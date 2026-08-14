#!/usr/bin/env node

import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { exportSdf, parseSdf } from '@retainmol/mol-viewer/io'
import {
  MODELING_COMMAND_KINDS,
  compareExpectedEffect,
  compileExpectedEffect,
  computeCanonicalSnapshotDigest,
  createCanonicalEffectChanges,
  createCanonicalMoleculeSnapshot,
  createHeadlessModelingContext,
  replayEditPlan,
} from '@retainmol/mol-viewer/modeling'

const EXECUTOR_ID = '@retainmol/mol-viewer/modeling'
const EXECUTOR_SCHEMA_VERSION = 1

function parseArgs(argv) {
  const values = new Map()
  for (let index = 0; index < argv.length; index += 1) {
    const name = argv[index]
    if (!name?.startsWith('--')) throw new Error(`未知参数：${name}`)
    const value = argv[index + 1]
    if (!value || value.startsWith('--')) throw new Error(`参数缺少值：${name}`)
    values.set(name.slice(2), value)
    index += 1
  }
  for (const required of [
    'initial',
    'plan',
    'output',
    'receipt',
    'metadata',
    'snapshot',
    'identity-map',
    'coordinate-transport-receipt',
    'expected-effect',
    'enforced-plan',
  ]) {
    if (!values.has(required)) throw new Error(`缺少参数：--${required}`)
  }
  return Object.fromEntries(values)
}

function sha256(content) {
  return createHash('sha256').update(content).digest('hex')
}

function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`
  if (value && typeof value === 'object') {
    return `{${Object.keys(value)
      .sort()
      .map(key => `${JSON.stringify(key)}:${canonicalJson(value[key])}`)
      .join(',')}}`
  }
  return JSON.stringify(value)
}

function isMolecule(value) {
  return value && typeof value === 'object' && Array.isArray(value.atoms) && Array.isArray(value.bonds)
}

function unique(values) {
  return [...new Set(values)]
}

function definedEntries(value) {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined))
}

function createBuilderSnapshot(molecule) {
  return {
    schemaVersion: 1,
    coordinateSpace: 'angstrom',
    molecule: {
      ...(molecule.name === undefined ? {} : { name: molecule.name }),
      atoms: molecule.atoms.map(atom => definedEntries({
        atomId: atom.id,
        symbol: atom.symbol,
        position: [atom.x, atom.y, atom.z],
        formalCharge: atom.charge ?? 0,
        radicalElectrons: atom.radical ?? 0,
        label: atom.label,
        coordinationGeometry: atom.coordinationGeometry,
        coordinationDirections: atom.coordinationDirections,
        coordinationSites: atom.coordinationSites,
        coordinationNumber: atom.coordinationNumber,
      })),
      bonds: molecule.bonds.map(bond => definedEntries({
        bondId: bond.id,
        atomId1: bond.atomId1,
        atomId2: bond.atomId2,
        order: bond.order,
        aromatic: bond.aromatic ?? false,
        coordinationSites: bond.coordinationSites,
      })),
    },
  }
}

function createIdentityMap(molecule) {
  return {
    schemaVersion: 1,
    atomRows: molecule.atoms.map((atom, index) => ({
      rowIndex: index + 1,
      atomId: atom.id,
      symbol: atom.symbol,
    })),
    bondRows: molecule.bonds.map((bond, index) => ({
      rowIndex: index + 1,
      bondId: bond.id,
      atomId1: bond.atomId1,
      atomId2: bond.atomId2,
      order: bond.order,
    })),
  }
}

function createCoordinateTransportReceipt({
  sdf,
  builderSnapshotText,
  identityMapText,
  identityMap,
}) {
  const parsed = parseSdf(sdf)[0]
  if (!parsed || parsed.atoms.length !== identityMap.atomRows.length) {
    throw new Error('导出 SDF 无法按 identity map 重新解析')
  }
  const atomRows = identityMap.atomRows.map((row, index) => {
    const atom = parsed.atoms[index]
    if (!atom || atom.symbol !== row.symbol) {
      throw new Error(`导出 SDF 第 ${index + 1} 行元素与 identity map 不一致`)
    }
    return {
      rowIndex: row.rowIndex,
      atomId: row.atomId,
      symbol: row.symbol,
      position: [atom.x, atom.y, atom.z],
    }
  })
  const mapping = { schemaVersion: 1, atomRows }
  return {
    schemaVersion: 1,
    kind: 'stable-atom-coordinate-transport',
    builderSnapshotSha256: sha256(builderSnapshotText),
    identityMapSha256: sha256(identityMapText),
    finalSdfSha256: sha256(sdf),
    atomRowMappingSha256: sha256(canonicalJson(mapping)),
    atomRows,
  }
}

function createProductionEffectReceipt(initialMolecule, plan, objectId) {
  const baseSnapshot = createCanonicalMoleculeSnapshot(initialMolecule)
  const commands = []
  let previousMolecule = initialMolecule
  for (let commandIndex = 0; commandIndex < plan.commands.length; commandIndex += 1) {
    const prefixPlan = {
      ...plan,
      expectedRevision: undefined,
      commands: plan.commands.slice(0, commandIndex + 1),
    }
    const prefixResult = replayEditPlan(initialMolecule, prefixPlan, { objectId })
    if (!prefixResult.ok) {
      throw new Error(`无法为命令 ${commandIndex + 1} 生成 production effect receipt`)
    }
    const before = createCanonicalMoleculeSnapshot(previousMolecule)
    const after = createCanonicalMoleculeSnapshot(prefixResult.molecule)
    const command = plan.commands[commandIndex]
    commands.push({
      commandId: command.commandId,
      kind: command.kind,
      preDigest: computeCanonicalSnapshotDigest(before),
      postDigest: computeCanonicalSnapshotDigest(after),
      changes: createCanonicalEffectChanges(before, after),
    })
    previousMolecule = prefixResult.molecule
  }
  const finalSnapshot = createCanonicalMoleculeSnapshot(previousMolecule)
  return {
    schemaVersion: 1,
    planId: plan.planId,
    baseDigest: computeCanonicalSnapshotDigest(baseSnapshot),
    finalDigest: computeCanonicalSnapshotDigest(finalSnapshot),
    commands,
  }
}

function withEnforcedConstraints(plan, fixedAtomIds) {
  const constraints = plan.constraints ?? {}
  return {
    ...plan,
    constraints: {
      ...constraints,
      fixedAtomPositions: unique([
        ...(constraints.fixedAtomPositions ?? []),
        ...fixedAtomIds,
      ]),
      protectedAtomIds: unique([
        ...(constraints.protectedAtomIds ?? []),
        ...fixedAtomIds,
      ]),
    },
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const initialText = await readFile(args.initial, 'utf8')
  const planText = await readFile(args.plan, 'utf8')
  const initial = JSON.parse(initialText)
  const submittedPlan = JSON.parse(planText)
  if (initial.schemaVersion !== 1 || !isMolecule(initial.molecule)) {
    throw new Error('initial-molecule.json 格式无效')
  }
  if (typeof initial.objectId !== 'string' || initial.objectId.length === 0) {
    throw new Error('initial-molecule.json 缺少 objectId')
  }
  if (submittedPlan.targetObjectId !== initial.objectId) {
    throw new Error(`EditPlan targetObjectId 必须为 ${initial.objectId}`)
  }

  const fixedAtomIds = unique(initial.fixedAtomIds ?? [])
  const initialAtomIds = new Set(initial.molecule.atoms.map(atom => atom.id))
  const missingFixedAtom = fixedAtomIds.find(atomId => !initialAtomIds.has(atomId))
  if (missingFixedAtom) throw new Error(`固定原子不存在：${missingFixedAtom}`)

  const context = createHeadlessModelingContext(initial.molecule, {
    objectId: initial.objectId,
    name: initial.molecule.name,
  })
  const plan = withEnforcedConstraints(submittedPlan, fixedAtomIds)
  const enforcedPlanText = `${JSON.stringify(plan, null, 2)}\n`
  const expectedEffect = compileExpectedEffect(initial.molecule, plan)
  const result = replayEditPlan(initial.molecule, plan, { objectId: initial.objectId })
  const receipt = {
    schemaVersion: EXECUTOR_SCHEMA_VERSION,
    executor: EXECUTOR_ID,
    status: result.ok ? 'completed' : 'rejected',
    inputSha256: sha256(initialText),
    submittedPlanSha256: sha256(planText),
    enforcedPlanSha256: sha256(enforcedPlanText),
    targetObjectId: result.targetObjectId,
    baseRevision: result.baseRevision,
    commandCount: Array.isArray(plan.commands) ? plan.commands.length : 0,
    capabilities: MODELING_COMMAND_KINDS,
    issues: result.issues,
    ...(result.ok
      ? {
          changed: result.changed,
          nextRevision: result.nextRevision,
          changes: result.changes,
        }
      : {}),
  }

  await mkdir(path.dirname(args.receipt), { recursive: true })
  await writeFile(args.receipt, `${JSON.stringify(receipt, null, 2)}\n`)
  if (!result.ok) {
    process.stderr.write(`${JSON.stringify(receipt, null, 2)}\n`)
    process.exitCode = 2
    return
  }

  if (expectedEffect.status === 'indeterminate') {
    const indeterminateReceipt = {
      ...receipt,
      status: 'indeterminate',
      expectedEffectStatus: expectedEffect.status,
      expectedEffectSha256: sha256(`${JSON.stringify(expectedEffect, null, 2)}\n`),
      effectComparison: {
        verdict: 'indeterminate',
        reason: expectedEffect.reason,
        message: expectedEffect.message,
        mismatches: [],
      },
    }
    await writeFile(args.receipt, `${JSON.stringify(indeterminateReceipt, null, 2)}\n`)
    process.stderr.write(`${JSON.stringify(indeterminateReceipt, null, 2)}\n`)
    process.exitCode = 4
    return
  }

  const actualEffectReceipt = createProductionEffectReceipt(
    initial.molecule,
    plan,
    initial.objectId,
  )
  const productionResultDigest = computeCanonicalSnapshotDigest(
    createCanonicalMoleculeSnapshot(result.molecule),
  )
  if (actualEffectReceipt.finalDigest !== productionResultDigest) {
    throw new Error(
      `逐命令 production receipt 与最终执行结果不一致：${actualEffectReceipt.finalDigest} != ${productionResultDigest}`,
    )
  }
  const effectComparison = compareExpectedEffect(expectedEffect, actualEffectReceipt)

  if (effectComparison.verdict !== 'pass') {
    const failedReceipt = {
      ...receipt,
      status: effectComparison.verdict === 'reject' ? 'rejected' : 'indeterminate',
      expectedEffectStatus: expectedEffect.status,
      expectedEffectSha256: sha256(`${JSON.stringify(expectedEffect, null, 2)}\n`),
      actualEffectReceipt,
      effectComparison,
    }
    await writeFile(args.receipt, `${JSON.stringify(failedReceipt, null, 2)}\n`)
    process.stderr.write(`${JSON.stringify(failedReceipt, null, 2)}\n`)
    process.exitCode = effectComparison.verdict === 'reject' ? 3 : 4
    return
  }

  const sdf = exportSdf(result.molecule)
  const builderSnapshot = createBuilderSnapshot(result.molecule)
  const builderSnapshotText = `${JSON.stringify(builderSnapshot, null, 2)}\n`
  const identityMap = createIdentityMap(result.molecule)
  const identityMapText = `${JSON.stringify(identityMap, null, 2)}\n`
  const coordinateTransportReceipt = createCoordinateTransportReceipt({
    sdf,
    builderSnapshotText,
    identityMapText,
    identityMap,
  })
  const coordinateTransportReceiptText = `${JSON.stringify(coordinateTransportReceipt, null, 2)}\n`
  const anchorAtomIndices = Object.fromEntries(
    fixedAtomIds.map(atomId => {
      const index = result.molecule.atoms.findIndex(atom => atom.id === atomId)
      if (index < 0) throw new Error(`执行后固定原子丢失：${atomId}`)
      return [atomId, index + 1]
    }),
  )
  const metadata = {
    schemaVersion: 1,
    builder: 'retainmol-edit-plan',
    planId: plan.planId,
    targetObjectId: plan.targetObjectId,
    anchorAtomIndices,
    commandCount: plan.commands.length,
    executorReceipt: path.basename(args.receipt),
    builderSnapshot: path.basename(args.snapshot),
    builderSnapshotSha256: sha256(builderSnapshotText),
    identityMap: path.basename(args['identity-map']),
    identityMapSha256: sha256(identityMapText),
    coordinateTransportReceipt: path.basename(args['coordinate-transport-receipt']),
    coordinateTransportReceiptSha256: sha256(coordinateTransportReceiptText),
  }

  await mkdir(path.dirname(args.output), { recursive: true })
  await writeFile(args.output, sdf)
  await writeFile(args.snapshot, builderSnapshotText)
  await writeFile(args['identity-map'], identityMapText)
  await writeFile(args['coordinate-transport-receipt'], coordinateTransportReceiptText)
  await writeFile(args['expected-effect'], `${JSON.stringify(expectedEffect, null, 2)}\n`)
  await writeFile(args['enforced-plan'], enforcedPlanText)
  await writeFile(args.metadata, `${JSON.stringify(metadata, null, 2)}\n`)
  await writeFile(args.receipt, `${JSON.stringify({
    ...receipt,
    outputSha256: sha256(sdf),
    builderSnapshotSha256: sha256(builderSnapshotText),
    identityMapSha256: sha256(identityMapText),
    coordinateTransportReceiptSha256: sha256(coordinateTransportReceiptText),
    expectedEffectStatus: expectedEffect.status,
    expectedEffectSha256: sha256(`${JSON.stringify(expectedEffect, null, 2)}\n`),
    actualEffectReceipt,
    effectComparison,
    atomCount: result.molecule.atoms.length,
    bondCount: result.molecule.bonds.length,
  }, null, 2)}\n`)
}

main().catch(error => {
  process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`)
  process.exitCode = 1
})
