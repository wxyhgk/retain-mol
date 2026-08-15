#!/usr/bin/env node

import { createHash } from 'node:crypto'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import {
  computeCanonicalSnapshotDigest,
  createCanonicalEffectChanges,
  createCanonicalMoleculeSnapshot,
  parseEditPlan,
  replayEditPlanTrace,
  verifyRotateGroupRelation,
} from '@retainmol/mol-viewer/modeling'
import { StrictJsonError, parseStrictJson } from './strict_json.mjs'
import {
  RelationTraceInputFileError,
  assertOutputIsNotInput,
  decodeUtf8,
  parseArgs,
  readBoundedRegularBytes,
  writeBoundedAtomic,
} from './relation_trace_projector_io.mjs'

export const RELATION_TRACE_PROJECTION_VERSION = 'runtime-rotate-relation-trace-v1'
export const RELATION_TRACE_COORDINATE_SCALE = 1000

const SUPPORTED_KIND = 'geometry.rotateGroup'
const MAX_RELATION_ATOMS = 316
const MAX_RELATION_BONDS = 1000
const MAX_TRACE_STEPS = 512
const MAX_TRACE_ATOM_STEPS = 50_000
const MAX_SAFE_COORDINATE_UNIT = 1_000_000_000
const QUANTIZATION_TIE_GUARD = 1e-9
const MIN_AXIS_SQUARED = 100_000n
const MIN_AREA_SQUARED = 10_000_000_000n
const MIN_ABS_VOLUME6 = 100_000_000n
const MAX_SQUARED_DISTANCE_DELTA = 0n
const EXACT_ANGLE_RATIOS = new Map([
  [0, [[1n, 1n], [0n, 1n]]],
  [30, [[3n, 4n], [1n, 4n]]],
  [45, [[1n, 2n], [1n, 2n]]],
  [60, [[1n, 4n], [3n, 4n]]],
  [90, [[0n, 1n], [1n, 1n]]],
  [120, [[1n, 4n], [3n, 4n]]],
  [135, [[1n, 2n], [1n, 2n]]],
  [150, [[3n, 4n], [1n, 4n]]],
  [180, [[1n, 1n], [0n, 1n]]],
])

export class RelationTraceProjectionError extends Error {
  constructor(verdict, code, message) {
    super(message)
    this.name = 'RelationTraceProjectionError'
    this.verdict = verdict
    this.code = code
  }
}

function reject(code, message) {
  throw new RelationTraceProjectionError('reject', code, message)
}

function indeterminate(code, message) {
  throw new RelationTraceProjectionError('indeterminate', code, message)
}

function sha256(content) {
  return createHash('sha256').update(content).digest('hex')
}

function sameJson(left, right) {
  if (left === right) return true
  if (Array.isArray(left) || Array.isArray(right)) {
    if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) return false
    return left.every((value, index) => sameJson(value, right[index]))
  }
  if (!left || !right || typeof left !== 'object' || typeof right !== 'object') return false
  const leftKeys = Object.keys(left).sort(byteCompare)
  const rightKeys = Object.keys(right).sort(byteCompare)
  if (leftKeys.length !== rightKeys.length) return false
  return leftKeys.every((key, index) => (
    key === rightKeys[index]
    && Object.hasOwn(right, key)
    && sameJson(left[key], right[key])
  ))
}

function byteCompare(left, right) {
  return Buffer.compare(Buffer.from(left), Buffer.from(right))
}

function requireObject(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    reject('invalid-input', `${label} 必须是对象`)
  }
  return value
}

function requireNonEmptyString(value, label) {
  if (typeof value !== 'string' || value.length === 0) {
    reject('invalid-input', `${label} 必须是非空字符串`)
  }
  return value
}

function requireArray(value, label) {
  if (!Array.isArray(value)) reject('invalid-input', `${label} 必须是数组`)
  return value
}

function parseJson(text, label) {
  try {
    return parseStrictJson(text, label)
  } catch (error) {
    if (error instanceof StrictJsonError) reject('invalid-json', error.message)
    reject('invalid-json', `${label} 不是有效 JSON：${error instanceof Error ? error.message : error}`)
  }
}

function classifyPlanCommandSet(rawPlan) {
  if (!rawPlan || typeof rawPlan !== 'object' || Array.isArray(rawPlan)) {
    reject('invalid-plan', 'enforced plan 必须是对象')
  }
  if (!Array.isArray(rawPlan.commands)) {
    reject('invalid-plan', 'enforced plan commands 必须是数组')
  }
  const commandKinds = rawPlan.commands.map((command, index) => {
    if (!command || typeof command !== 'object' || Array.isArray(command)) {
      reject('invalid-plan', `enforced plan commands[${index}] 必须是对象`)
    }
    if (typeof command.kind !== 'string' || command.kind.length === 0) {
      reject('invalid-plan', `enforced plan commands[${index}].kind 必须是非空字符串`)
    }
    return command.kind
  })
  if (commandKinds.length === 0 || commandKinds.some(kind => kind !== SUPPORTED_KIND)) {
    indeterminate('unsupported-command-set', 'relation trace v1 只接受非空且全部为 geometry.rotateGroup 的计划')
  }
}

function quantizeCoordinate(value, label) {
  if (!Number.isFinite(value)) indeterminate('non-finite-coordinate', `${label} 不是有限数`)
  const scaled = value * RELATION_TRACE_COORDINATE_SCALE
  const distanceToTie = Math.abs((scaled - Math.floor(scaled)) - 0.5)
  if (distanceToTie <= QUANTIZATION_TIE_GUARD) {
    indeterminate('quantization-boundary', `${label} 位于坐标量化边界的灰区`)
  }
  const units = Math.round(scaled)
  if (!Number.isSafeInteger(units) || Math.abs(units) > MAX_SAFE_COORDINATE_UNIT) {
    indeterminate('coordinate-out-of-range', `${label} 超出形式化投影的安全整数范围`)
  }
  return units
}

function projectCanonicalSnapshot(snapshot) {
  const aromaticAtomIds = new Set()
  for (const bond of snapshot.bonds) {
    if (bond.aromatic) {
      aromaticAtomIds.add(bond.atomId1)
      aromaticAtomIds.add(bond.atomId2)
    }
  }
  return {
    atoms: snapshot.atoms.map(atom => ({
      atomId: atom.id,
      symbol: atom.symbol,
      positionUnits: [
        quantizeCoordinate(atom.x, `${atom.id}.x`),
        quantizeCoordinate(atom.y, `${atom.id}.y`),
        quantizeCoordinate(atom.z, `${atom.id}.z`),
      ],
      formalCharge: atom.charge ?? 0,
      radicalElectrons: atom.radical ?? 0,
      aromatic: aromaticAtomIds.has(atom.id),
    })),
    bonds: snapshot.bonds.map(bond => ({
      bondId: bond.id,
      atomId1: bond.atomId1,
      atomId2: bond.atomId2,
      order: bond.aromatic
        ? 'aromatic'
        : ({ 1: 'single', 2: 'double', 3: 'triple' })[bond.order],
    })),
  }
}

function pointMap(snapshot) {
  return new Map(snapshot.atoms.map(atom => [atom.atomId, atom.positionUnits.map(BigInt)]))
}

function subtract(left, right) {
  return [left[0] - right[0], left[1] - right[1], left[2] - right[2]]
}

function scale(value, vector) {
  return [value * vector[0], value * vector[1], value * vector[2]]
}

function dot(left, right) {
  return left[0] * right[0] + left[1] * right[1] + left[2] * right[2]
}

function cross(left, right) {
  return [
    left[1] * right[2] - left[2] * right[1],
    left[2] * right[0] - left[0] * right[2],
    left[0] * right[1] - left[1] * right[0],
  ]
}

function squaredNorm(vector) {
  return dot(vector, vector)
}

function squaredDistance(left, right) {
  return squaredNorm(subtract(left, right))
}

function abs(value) {
  return value < 0n ? -value : value
}

function sign(value) {
  return value < 0n ? -1 : value > 0n ? 1 : 0
}

function radialNumerator(axis, relative) {
  return subtract(scale(squaredNorm(axis), relative), scale(dot(axis, relative), axis))
}

function signedVolume6(a, b, c, d) {
  return dot(subtract(b, a), cross(subtract(c, a), subtract(d, a)))
}

function decimal(value) {
  return value.toString()
}

function normalizedExactAngle(angleDegrees) {
  if (!Number.isInteger(angleDegrees)) {
    indeterminate('unsupported-angle', 'relation trace v1 只证明整数角度')
  }
  let normalized = angleDegrees % 360
  if (normalized > 180) normalized -= 360
  if (normalized <= -180) normalized += 360
  if (EXACT_ANGLE_RATIOS.has(Math.abs(normalized))) return normalized
  indeterminate(
    'unsupported-angle',
    'relation trace v1 仅证明 0、±30、±45、±60、±90、±120、±135、±150 与 180 度',
  )
}

function ratioInBand(value, denominator, loNum, loDen, hiNum, hiDen) {
  if (denominator <= 0n) return false
  const squared = value * value
  return loNum * denominator <= loDen * squared
    && hiDen * squared <= hiNum * denominator
}

function createTurnBand(beforePoints, afterPoints, relation, command) {
  const fixed = beforePoints.get(relation.fixedAxisAtomId)
  const moving = beforePoints.get(relation.movingAxisAtomId)
  const radialBeforePoint = beforePoints.get(relation.radialAtomId)
  const radialAfterPoint = afterPoints.get(relation.radialAtomId)
  if (!fixed || !moving || !radialBeforePoint || !radialAfterPoint) {
    reject('missing-witness-atom', '旋转关系引用了不存在的形式化原子')
  }
  const axis = subtract(moving, fixed)
  const beforeRadial = radialNumerator(axis, subtract(radialBeforePoint, fixed))
  const afterRadial = radialNumerator(axis, subtract(radialAfterPoint, fixed))
  const radialDenominator = squaredNorm(beforeRadial) * squaredNorm(afterRadial)
  const cosineNumerator = dot(beforeRadial, afterRadial)
  const sineNumerator = dot(axis, cross(beforeRadial, afterRadial))
  const sineDenominator = squaredNorm(axis) * radialDenominator
  if (radialDenominator <= 0n || sineDenominator <= 0n) {
    indeterminate('degenerate-formal-frame', '坐标量化后径向证据退化')
  }

  const axisDirection = relation.axisAtomIds[0] === relation.fixedAxisAtomId ? 1 : -1
  const expectedAngle = normalizedExactAngle(command.angleDegrees * axisDirection)
  const magnitude = Math.abs(expectedAngle)
  const [cosineRatio, sineRatio] = EXACT_ANGLE_RATIOS.get(magnitude)
  const cosineBand = [cosineRatio[0], cosineRatio[1], cosineRatio[0], cosineRatio[1]]
  const sineBand = [sineRatio[0], sineRatio[1], sineRatio[0], sineRatio[1]]
  if (
    !ratioInBand(cosineNumerator, radialDenominator, ...cosineBand)
    || !ratioInBand(sineNumerator, sineDenominator, ...sineBand)
  ) {
    indeterminate('quantized-angle-band-mismatch', '量化后的转角落在固定证明带之外')
  }
  const expectedCosineSign = magnitude === 90 ? 0 : magnitude < 90 ? 1 : -1
  const expectedSineSign = magnitude === 0 || magnitude === 180
    ? 0
    : Math.sign(expectedAngle)
  if (sign(cosineNumerator) !== expectedCosineSign || sign(sineNumerator) !== expectedSineSign) {
    indeterminate('quantized-angle-sign-mismatch', '量化后的有向转角符号与命令不一致')
  }
  const renderBand = ([loNum, loDen, hiNum, hiDen]) => ({
    loNum: decimal(loNum),
    loDen: decimal(loDen),
    hiNum: decimal(hiNum),
    hiDen: decimal(hiDen),
  })
  return {
    cosineSign: expectedCosineSign === 0 ? 'nearZero' : expectedCosineSign > 0 ? 'positive' : 'negative',
    sineSign: expectedSineSign === 0 ? 'nearZero' : expectedSineSign > 0 ? 'positive' : 'negative',
    signMargin: '0',
    cosineSquared: renderBand(cosineBand),
    sineSquared: renderBand(sineBand),
  }
}

function deriveRigidRegion(beforeFormal, afterFormal, relation) {
  const beforePoints = pointMap(beforeFormal)
  const afterPoints = pointMap(afterFormal)
  const fixed = beforePoints.get(relation.fixedAxisAtomId)
  const moving = beforePoints.get(relation.movingAxisAtomId)
  const radial = beforePoints.get(relation.radialAtomId)
  if (!fixed || !moving || !radial) reject('missing-witness-atom', '旋转证据原子不存在')
  const axis = subtract(moving, fixed)
  const normal = cross(axis, subtract(radial, fixed))
  const fixedAfter = afterPoints.get(relation.fixedAxisAtomId)
  const movingAfter = afterPoints.get(relation.movingAxisAtomId)
  const radialAfter = afterPoints.get(relation.radialAtomId)
  if (!fixedAfter || !movingAfter || !radialAfter) reject('missing-witness-atom', '旋转证据 after 原子不存在')
  const afterAxis = subtract(movingAfter, fixedAfter)
  const afterNormal = cross(afterAxis, subtract(radialAfter, fixedAfter))
  if (
    squaredNorm(axis) < MIN_AXIS_SQUARED
    || squaredNorm(afterAxis) < MIN_AXIS_SQUARED
    || squaredNorm(normal) < MIN_AREA_SQUARED
    || squaredNorm(afterNormal) < MIN_AREA_SQUARED
  ) {
    indeterminate('degenerate-formal-frame', '坐标量化后端口坐标架低于固定 V1 几何阈值')
  }

  const candidateIds = [...relation.movingAtomIds]
    .filter(atomId => atomId !== relation.movingAxisAtomId && atomId !== relation.radialAtomId)
    .sort(byteCompare)
  let handedness = null
  for (const atomId of candidateIds) {
    const beforePoint = beforePoints.get(atomId)
    const afterPoint = afterPoints.get(atomId)
    if (!beforePoint || !afterPoint) continue
    const beforeVolume = signedVolume6(fixed, moving, radial, beforePoint)
    const afterVolume = signedVolume6(fixedAfter, movingAfter, radialAfter, afterPoint)
    if (
      abs(beforeVolume) < MIN_ABS_VOLUME6
      || abs(afterVolume) < MIN_ABS_VOLUME6
      || sign(beforeVolume) !== sign(afterVolume)
    ) continue
    const margin = abs(beforeVolume) < abs(afterVolume) ? abs(beforeVolume) : abs(afterVolume)
    if (
      !handedness
      || margin > handedness.margin
      || (margin === handedness.margin
        && Buffer.compare(Buffer.from(atomId), Buffer.from(handedness.atomId)) < 0)
    ) handedness = { atomId, margin }
  }
  if (!handedness) {
    indeterminate('no-handedness-witness', '移动刚体中没有量化后保持手性的第四原子')
  }

  const atomIds = [relation.fixedAxisAtomId, ...relation.movingAtomIds]
  let maxSquaredDistanceDelta = 0n
  for (let left = 0; left < atomIds.length; left += 1) {
    for (let right = left + 1; right < atomIds.length; right += 1) {
      const beforeVector = subtract(beforePoints.get(atomIds[left]), beforePoints.get(atomIds[right]))
      const afterVector = subtract(afterPoints.get(atomIds[left]), afterPoints.get(atomIds[right]))
      const delta = abs(squaredNorm(beforeVector) - squaredNorm(afterVector))
      if (delta > maxSquaredDistanceDelta) maxSquaredDistanceDelta = delta
    }
  }
  if (maxSquaredDistanceDelta > MAX_SQUARED_DISTANCE_DELTA) {
    indeterminate('quantized-rigidity-mismatch', '量化后的刚体距离不满足固定 V1 零漂移策略')
  }
  return {
    beforePoints,
    afterPoints,
    region: {
      atomIds,
      frame: {
        originAtomId: relation.fixedAxisAtomId,
        axisAtomId: relation.movingAxisAtomId,
        radialAtomId: relation.radialAtomId,
        minAxisSquared: decimal(MIN_AXIS_SQUARED),
        minAreaSquared: decimal(MIN_AREA_SQUARED),
      },
      handednessAtomId: handedness.atomId,
      maxSquaredDistanceDelta: decimal(MAX_SQUARED_DISTANCE_DELTA),
      minAbsVolume6: decimal(MIN_ABS_VOLUME6),
    },
  }
}

function findAxisBond(snapshot, relation) {
  const matches = snapshot.bonds.filter(bond =>
    bond.order === 1
    && !bond.aromatic
    && ((bond.atomId1 === relation.fixedAxisAtomId && bond.atomId2 === relation.movingAxisAtomId)
      || (bond.atomId2 === relation.fixedAxisAtomId && bond.atomId1 === relation.movingAxisAtomId)))
  if (matches.length !== 1) reject('axis-bond-mismatch', '旋转轴必须对应唯一的非芳香单键')
  return matches[0].id
}

function recomputeEffectReceipt(trace, plan) {
  const commands = trace.steps.map(step => {
    const before = createCanonicalMoleculeSnapshot(step.before)
    const after = createCanonicalMoleculeSnapshot(step.after)
    return {
      commandId: step.commandId,
      kind: step.commandKind,
      preDigest: computeCanonicalSnapshotDigest(before),
      postDigest: computeCanonicalSnapshotDigest(after),
      changes: createCanonicalEffectChanges(before, after),
    }
  })
  const base = createCanonicalMoleculeSnapshot(trace.steps[0].before)
  const final = createCanonicalMoleculeSnapshot(trace.result.molecule)
  return {
    schemaVersion: 1,
    planId: plan.planId,
    baseDigest: computeCanonicalSnapshotDigest(base),
    finalDigest: computeCanonicalSnapshotDigest(final),
    commands,
  }
}

function validateReceipt(
  receipt,
  expected,
  expectedBaseRevision,
  initialBytes,
  enforcedPlanBytes,
  initial,
  plan,
) {
  requireObject(receipt, 'execution receipt')
  if (receipt.schemaVersion !== 1) reject('receipt-schema-mismatch', '执行回执 schemaVersion 不受支持')
  if (receipt.executor !== '@retainmol/mol-viewer/modeling') reject('executor-mismatch', '执行器标识不可信')
  if (
    receipt.status !== 'indeterminate'
    || receipt.expectedEffectStatus !== 'indeterminate'
    || receipt.effectComparison?.verdict !== 'indeterminate'
  ) {
    reject('receipt-status-mismatch', 'rotate-only V1 必须来自未发布产物的 indeterminate 执行回执')
  }
  if (receipt.inputSha256 !== sha256(initialBytes)) reject('input-digest-mismatch', 'initial 文件摘要与回执不一致')
  if (receipt.enforcedPlanSha256 !== sha256(enforcedPlanBytes)) reject('plan-digest-mismatch', 'enforced plan 文件摘要与回执不一致')
  if (receipt.targetObjectId !== initial.objectId || plan.targetObjectId !== initial.objectId) {
    reject('target-mismatch', 'initial、plan 与执行回执的目标对象不一致')
  }
  if (receipt.commandCount !== plan.commands.length) reject('command-count-mismatch', '命令数量与回执不一致')
  if (receipt.baseRevision !== expectedBaseRevision) reject('base-revision-mismatch', '执行回执 baseRevision 与可信重放不一致')
  const actual = requireObject(receipt.actualEffectReceipt, 'actualEffectReceipt')
  if (!sameJson(actual, expected)) reject('effect-receipt-mismatch', '外部逐命令回执与可信重放结果不一致')
}

export async function projectRelationTrace({ initialPath, enforcedPlanPath, executionReceiptPath }) {
  let initialBytes
  let enforcedPlanBytes
  let receiptBytes
  let initialText
  let enforcedPlanText
  let receiptText
  try {
    [initialBytes, enforcedPlanBytes, receiptBytes] = await Promise.all([
      readBoundedRegularBytes(initialPath, 'initial'),
      readBoundedRegularBytes(enforcedPlanPath, 'enforced plan'),
      readBoundedRegularBytes(executionReceiptPath, 'execution receipt'),
    ])
    initialText = decodeUtf8(initialBytes, 'initial')
    enforcedPlanText = decodeUtf8(enforcedPlanBytes, 'enforced plan')
    receiptText = decodeUtf8(receiptBytes, 'execution receipt')
  } catch (error) {
    if (error instanceof RelationTraceInputFileError) reject(error.code, error.message)
    throw error
  }
  const initial = requireObject(parseJson(initialText, 'initial'), 'initial')
  const objectId = requireNonEmptyString(initial.objectId, 'initial.objectId')
  const molecule = requireObject(initial.molecule, 'initial.molecule')
  const rawPlan = parseJson(enforcedPlanText, 'enforced plan')
  classifyPlanCommandSet(rawPlan)
  const parsedPlan = parseEditPlan(rawPlan)
  if (!parsedPlan.ok) reject('invalid-plan', parsedPlan.issues.map(issue => issue.message).join('; '))
  const plan = parsedPlan.plan
  if (plan.targetObjectId !== objectId) reject('target-mismatch', 'plan targetObjectId 与 initial.objectId 不一致')
  const commandIds = plan.commands.map(command => command.commandId)
  if (new Set(commandIds).size !== commandIds.length) reject('duplicate-command-id', '计划包含重复 commandId')
  if (plan.commands.length > MAX_TRACE_STEPS) {
    indeterminate('trace-too-large', 'relation trace v1 最多接受 ' + MAX_TRACE_STEPS + ' 个命令')
  }

  const initialAtoms = requireArray(molecule.atoms, 'initial.molecule.atoms')
  const initialBonds = requireArray(molecule.bonds, 'initial.molecule.bonds')
  if (initialAtoms.length > MAX_RELATION_ATOMS || initialBonds.length > MAX_RELATION_BONDS) {
    indeterminate(
      'resource-limit',
      `relation trace v1 最多接受 ${MAX_RELATION_ATOMS} 个原子和 ${MAX_RELATION_BONDS} 根键`,
    )
  }
  if (initialAtoms.length * (plan.commands.length + 1) > MAX_TRACE_ATOM_STEPS) {
    indeterminate(
      'resource-limit',
      `relation trace v1 原子-步骤预算不得超过 ${MAX_TRACE_ATOM_STEPS}`,
    )
  }
  const initialAtomIds = new Set(initialAtoms.map(atom => atom.id))
  const fixedAtomIds = requireArray(initial.fixedAtomIds ?? [], 'initial.fixedAtomIds')
  if (new Set(fixedAtomIds).size !== fixedAtomIds.length) reject('duplicate-fixed-atom', 'initial.fixedAtomIds 包含重复项')
  for (const atomId of fixedAtomIds) {
    requireNonEmptyString(atomId, 'initial.fixedAtomIds[]')
    if (!initialAtomIds.has(atomId)) reject('missing-fixed-atom', `固定原子不存在：${atomId}`)
    if (
      !plan.constraints?.fixedAtomPositions?.includes(atomId)
      || !plan.constraints?.protectedAtomIds?.includes(atomId)
    ) {
      reject('unenforced-fixed-atom', `enforced plan 未同时冻结并保护原子：${atomId}`)
    }
  }

  const replay = replayEditPlanTrace(molecule, plan, { objectId, name: molecule.name })
  if (!replay.ok) reject('replay-rejected', replay.result.issues.map(issue => issue.message).join('; '))
  if (replay.steps.length !== plan.commands.length) reject('trace-length-mismatch', '可信重放没有产生完整逐命令轨迹')
  const expectedReceipt = recomputeEffectReceipt(replay, plan)
  const externalReceipt = parseJson(receiptText, 'execution receipt')
  validateReceipt(
    externalReceipt,
    expectedReceipt,
    replay.result.baseRevision,
    initialBytes,
    enforcedPlanBytes,
    initial,
    plan,
  )

  const steps = replay.steps.map((step, index) => {
    const command = plan.commands[index]
    if (command.kind !== SUPPORTED_KIND || step.commandId !== command.commandId || step.commandKind !== command.kind) {
      reject('trace-command-mismatch', `第 ${index + 1} 个执行步骤与计划命令不一致`)
    }
    const verification = verifyRotateGroupRelation(step.before, step.after, command)
    if (verification.verdict !== 'pass') {
      const message = `${verification.diagnostic.code}: ${verification.diagnostic.message}`
      if (verification.verdict === 'reject') reject('runtime-relation-rejected', message)
      indeterminate('runtime-relation-indeterminate', message)
    }
    if (verification.relation.movingAtomIds.length + 1 > MAX_RELATION_ATOMS) {
      indeterminate('relation-too-large', '单步关系最多包含 ' + MAX_RELATION_ATOMS + ' 个原子')
    }
    const beforeRuntime = createCanonicalMoleculeSnapshot(step.before)
    const afterRuntime = createCanonicalMoleculeSnapshot(step.after)
    const before = projectCanonicalSnapshot(beforeRuntime)
    const after = projectCanonicalSnapshot(afterRuntime)
    const { beforePoints, afterPoints, region } = deriveRigidRegion(before, after, verification.relation)
    const receipt = expectedReceipt.commands[index]
    return {
      receipt: {
        commandId: receipt.commandId,
        commandKind: receipt.kind,
        preDigest: receipt.preDigest,
        postDigest: receipt.postDigest,
      },
      runtimeBefore: beforeRuntime,
      runtimeAfter: afterRuntime,
      before,
      after,
      witness: {
        kind: 'rotateGroup',
        commandId: command.commandId,
        axisBondId: findAxisBond(beforeRuntime, verification.relation),
        fixedAxisAtomId: verification.relation.fixedAxisAtomId,
        movingAxisAtomId: verification.relation.movingAxisAtomId,
        movingAtomIds: [...verification.relation.movingAtomIds].sort(byteCompare),
        region,
        turn: createTurnBand(beforePoints, afterPoints, verification.relation, command),
      },
    }
  })

  const identity = {
    projectionVersion: RELATION_TRACE_PROJECTION_VERSION,
    planId: plan.planId,
    enforcedPlanSha256: sha256(enforcedPlanBytes),
    baseDigest: expectedReceipt.baseDigest,
    finalDigest: expectedReceipt.finalDigest,
  }
  return {
    schemaVersion: 1,
    projectionVersion: RELATION_TRACE_PROJECTION_VERSION,
    coordinateScale: RELATION_TRACE_COORDINATE_SCALE,
    identity,
    expectedReceipts: steps.map(step => step.receipt),
    base: steps[0].before,
    final: steps.at(-1).after,
    steps,
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const outputPath = path.resolve(args.output)
  const inputPaths = [args.initial, args['enforced-plan'], args['execution-receipt']]
    .map(inputPath => path.resolve(inputPath))
  try {
    await assertOutputIsNotInput(outputPath, inputPaths)
    const projected = await projectRelationTrace({
      initialPath: args.initial,
      enforcedPlanPath: args['enforced-plan'],
      executionReceiptPath: args['execution-receipt'],
    })
    await writeBoundedAtomic(outputPath, projected)
  } catch (error) {
    if (error instanceof RelationTraceProjectionError) {
      const result = { status: error.verdict, code: error.code, message: error.message }
      await writeBoundedAtomic(outputPath, result)
      process.stderr.write(`${JSON.stringify(result)}\n`)
      process.exitCode = error.verdict === 'reject' ? 3 : 4
      return
    }
    throw error
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  main().catch(error => {
    process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`)
    process.exitCode = 1
  })
}
