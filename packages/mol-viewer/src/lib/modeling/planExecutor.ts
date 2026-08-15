import { ELEMENT_CONFIGS } from '../../config/elements.config'
import type { Molecule } from '../molecule'
import {
  getAddOneHydrogenAvailabilityCommand,
  runAddOneHydrogenCommand,
  runAddAtomCommand,
  runRemoveAtomCommand,
  runReplaceAtomCommand,
  runSetAtomChargeCommand,
  runSetAtomRadicalCommand,
} from '../builder/commands/atom'
import {
  runAddBondCommand,
  runRemoveBondCommand,
  runSetBondOrderCommand,
} from '../builder/commands/bond'
import {
  runMoveAtomCommand,
  runSetBondAngleCommand,
  runSetBondLengthCommand,
  runSetDihedralAngleCommand,
} from '../builder/commands/geometry'
import {
  runAttachFragmentToAtomCommand,
  runBridgeFragmentBetweenAtomsCommand,
  runFuseFragmentOnBondCommand,
} from '../builder/commands/fragment'
import { runRotateAtomGroupCommand } from '../builder/commands/scene'
import { getFragment } from '../builder/fragment/registry'
import type {
  CommandSelectionState,
  EditCommandResult,
  EditCommandWithSelectionResult,
} from '../builder/commands/shared'
import { createModelingChangeSet } from './changeSet'
import { cloneModelingMolecule } from './context'
import {
  validateModelingCommandConstraints,
  validateModelingConstraintInvariants,
  validateModelingConstraints,
} from './constraints'
import {
  type EditPlan,
  type ModelingCommand,
  type ModelingContext,
  type ModelingDryRunResult,
  type ModelingIssue,
} from './contracts'
import { parseEditPlan } from './planSchema'
import { computeMoleculeRevision } from './revision'

interface WorkingState {
  readonly molecule: Molecule
  readonly selection: CommandSelectionState
}

export interface ModelingPlanTraceStep {
  readonly commandId: string
  readonly commandKind: ModelingCommand['kind']
  readonly before: Molecule
  readonly after: Molecule
}

export interface ModelingPlanTraceResult {
  readonly result: ModelingDryRunResult
  readonly steps: readonly ModelingPlanTraceStep[]
}

type CommandExecutionResult =
  | { readonly ok: true; readonly changed: boolean; readonly state: WorkingState }
  | { readonly ok: false; readonly reason: string }

function hasAtom(molecule: Molecule, atomId: string): boolean {
  return molecule.atoms.some(atom => atom.id === atomId)
}

function hasBond(molecule: Molecule, bondId: string): boolean {
  return molecule.bonds.some(bond => bond.id === bondId)
}

function fromEditResult(state: WorkingState, result: EditCommandResult): CommandExecutionResult {
  if (result.ok === false) return result
  if (!result.changed) return { ok: true, changed: false, state }
  return { ok: true, changed: true, state: { ...state, molecule: result.molecule } }
}

function fromSelectionResult(
  state: WorkingState,
  result: EditCommandWithSelectionResult,
): CommandExecutionResult {
  return {
    ok: true,
    changed: result.moleculeChanged || result.selectionChanged,
    state: {
      molecule: result.molecule,
      selection: {
        selectedAtomIds: result.selectedAtomIds,
        selectedBondIds: result.selectedBondIds,
      },
    },
  }
}

function renameAddedAtom(
  before: Molecule,
  after: Molecule,
  atomId: string,
): Molecule | null {
  const previousIds = new Set(before.atoms.map(atom => atom.id))
  const added = after.atoms.find(atom => !previousIds.has(atom.id))
  if (!added) return null
  return {
    ...after,
    atoms: after.atoms.map(atom => atom.id === added.id ? { ...atom, id: atomId } : atom),
    bonds: after.bonds.map(bond => ({
      ...bond,
      atomId1: bond.atomId1 === added.id ? atomId : bond.atomId1,
      atomId2: bond.atomId2 === added.id ? atomId : bond.atomId2,
    })),
  }
}

function renameAddedBond(
  before: Molecule,
  after: Molecule,
  bondId: string,
): Molecule | null {
  const previousIds = new Set(before.bonds.map(bond => bond.id))
  const added = after.bonds.find(bond => !previousIds.has(bond.id))
  if (!added) return null
  return {
    ...after,
    bonds: after.bonds.map(bond => bond.id === added.id ? { ...bond, id: bondId } : bond),
  }
}

function renameAddedEntities(
  before: Molecule,
  after: Molecule,
  prefix: string,
): Molecule {
  const previousAtomIds = new Set(before.atoms.map(atom => atom.id))
  const previousBondIds = new Set(before.bonds.map(bond => bond.id))
  const atomIdMap = new Map<string, string>()
  const bondIdMap = new Map<string, string>()

  after.atoms
    .filter(atom => !previousAtomIds.has(atom.id))
    .forEach((atom, index) => atomIdMap.set(atom.id, `${prefix}:atom:${index + 1}`))
  after.bonds
    .filter(bond => !previousBondIds.has(bond.id))
    .forEach((bond, index) => bondIdMap.set(bond.id, `${prefix}:bond:${index + 1}`))

  const generatedIds = new Set([...atomIdMap.values(), ...bondIdMap.values()])
  const occupiedIds = new Set([...previousAtomIds, ...previousBondIds])
  const collision = [...generatedIds].find(id => occupiedIds.has(id))
  if (collision) throw new Error(`确定性生成 id 已存在：${collision}`)

  return {
    ...after,
    atoms: after.atoms.map(atom => ({ ...atom, id: atomIdMap.get(atom.id) ?? atom.id })),
    bonds: after.bonds.map(bond => ({
      ...bond,
      id: bondIdMap.get(bond.id) ?? bond.id,
      atomId1: atomIdMap.get(bond.atomId1) ?? bond.atomId1,
      atomId2: atomIdMap.get(bond.atomId2) ?? bond.atomId2,
      ...(bond.coordinationSites
        ? {
            coordinationSites: bond.coordinationSites.map(site => ({
              ...site,
              atomId: atomIdMap.get(site.atomId) ?? site.atomId,
            })),
          }
        : {}),
    })),
  }
}

function applyPositionMap(molecule: Molecule, positions: ReadonlyMap<string, { x: number; y: number; z: number }>): Molecule {
  return {
    ...molecule,
    atoms: molecule.atoms.map(atom => {
      const position = positions.get(atom.id)
      return position ? { ...atom, ...position } : atom
    }),
  }
}

function quaternionAroundAxis(
  first: { x: number; y: number; z: number },
  second: { x: number; y: number; z: number },
  angleDegrees: number,
) {
  const dx = second.x - first.x
  const dy = second.y - first.y
  const dz = second.z - first.z
  const length = Math.hypot(dx, dy, dz)
  if (length < 1e-9) return null
  const halfAngle = angleDegrees * Math.PI / 360
  const scale = Math.sin(halfAngle) / length
  return {
    x: dx * scale,
    y: dy * scale,
    z: dz * scale,
    w: Math.cos(halfAngle),
  }
}

function atomMissing(command: ModelingCommand, molecule: Molecule): string | null {
  const atomIds = (() => {
    switch (command.kind) {
      case 'atom.add': return []
      case 'atom.replace':
      case 'atom.remove':
      case 'atom.move':
      case 'atom.setCharge':
      case 'atom.setRadical':
      case 'atom.addHydrogen': return [command.atomId]
      case 'bond.add': return [command.atomId1, command.atomId2]
      case 'fragment.attach': return [command.atomId]
      case 'fragment.bridge': return [command.atomId1, command.atomId2]
      case 'geometry.rotateGroup': return [
        command.axisAtomId1,
        command.axisAtomId2,
        ...command.atomIds,
      ]
      case 'bond.remove':
      case 'bond.setOrder': return []
      case 'fragment.fuse': return []
      case 'geometry.setBondLength': return [command.atomId1, command.atomId2]
      case 'geometry.setBondAngle': return [command.atomId1, command.atomId2, command.atomId3]
      case 'geometry.setDihedral': return [command.atomId1, command.atomId2, command.atomId3, command.atomId4]
    }
  })()
  return atomIds.find(atomId => !hasAtom(molecule, atomId)) ?? null
}

function existingTargets(command: ModelingCommand): {
  readonly atomIds: readonly string[]
  readonly bondIds: readonly string[]
} {
  switch (command.kind) {
    case 'atom.add': return { atomIds: [], bondIds: [] }
    case 'atom.replace':
    case 'atom.remove':
    case 'atom.move':
    case 'atom.setCharge':
    case 'atom.setRadical':
    case 'atom.addHydrogen': return { atomIds: [command.atomId], bondIds: [] }
    case 'bond.add': return { atomIds: [command.atomId1, command.atomId2], bondIds: [] }
    case 'fragment.attach': return { atomIds: [command.atomId], bondIds: [] }
    case 'fragment.bridge': return { atomIds: [command.atomId1, command.atomId2], bondIds: [] }
    case 'bond.remove':
    case 'bond.setOrder': return { atomIds: [], bondIds: [command.bondId] }
    case 'fragment.fuse': return { atomIds: [], bondIds: [command.bondId] }
    case 'geometry.setBondLength': return { atomIds: [command.atomId1, command.atomId2], bondIds: [] }
    case 'geometry.setBondAngle': return {
      atomIds: [command.atomId1, command.atomId2, command.atomId3],
      bondIds: [],
    }
    case 'geometry.setDihedral': return {
      atomIds: [command.atomId1, command.atomId2, command.atomId3, command.atomId4],
      bondIds: [],
    }
    case 'geometry.rotateGroup': return {
      atomIds: [command.axisAtomId1, command.axisAtomId2, ...command.atomIds],
      bondIds: [],
    }
  }
}

function executeCommand(state: WorkingState, command: ModelingCommand): CommandExecutionResult {
  const missingAtomId = atomMissing(command, state.molecule)
  if (missingAtomId) return { ok: false, reason: `原子不存在：${missingAtomId}` }

  switch (command.kind) {
    case 'atom.add': {
      if (hasAtom(state.molecule, command.atomId)) {
        return { ok: false, reason: `原子 id 已存在：${command.atomId}` }
      }
      if (!Object.hasOwn(ELEMENT_CONFIGS, command.symbol)) {
        return { ok: false, reason: `未知元素：${command.symbol}` }
      }
      const result = runAddAtomCommand(
        state.molecule,
        command.symbol,
        command.position.x,
        command.position.y,
        command.position.z,
      )
      const molecule = renameAddedAtom(state.molecule, result.molecule, command.atomId)
      return molecule
        ? { ok: true, changed: true, state: { ...state, molecule } }
        : { ok: false, reason: '添加原子后无法确定新原子' }
    }
    case 'atom.replace':
      if (!Object.hasOwn(ELEMENT_CONFIGS, command.symbol)) {
        return { ok: false, reason: `未知元素：${command.symbol}` }
      }
      return fromEditResult(
        state,
        runReplaceAtomCommand(state.molecule, command.atomId, command.symbol),
      )
    case 'atom.remove':
      return fromSelectionResult(
        state,
        runRemoveAtomCommand(state.molecule, command.atomId, state.selection),
      )
    case 'atom.move':
      return fromEditResult(
        state,
        runMoveAtomCommand(
          state.molecule,
          command.atomId,
          command.position.x,
          command.position.y,
          command.position.z,
        ),
      )
    case 'atom.setCharge':
      return fromEditResult(
        state,
        runSetAtomChargeCommand(state.molecule, command.atomId, command.charge),
      )
    case 'atom.setRadical':
      return fromEditResult(
        state,
        runSetAtomRadicalCommand(state.molecule, command.atomId, command.radical),
      )
    case 'atom.addHydrogen': {
      if (hasAtom(state.molecule, command.hydrogenAtomId)) {
        return { ok: false, reason: `原子 id 已存在：${command.hydrogenAtomId}` }
      }
      const availability = getAddOneHydrogenAvailabilityCommand(state.molecule, command.atomId)
      if (!availability.ok) return { ok: false, reason: availability.reason ?? '无法添加 H' }
      const result = runAddOneHydrogenCommand(state.molecule, command.atomId)
      if (!result.ok || !result.changed) return { ok: false, reason: '添加 H 未产生结构变化' }
      const molecule = renameAddedAtom(state.molecule, result.molecule, command.hydrogenAtomId)
      return molecule
        ? { ok: true, changed: true, state: { ...state, molecule } }
        : { ok: false, reason: '添加 H 后无法确定新原子' }
    }
    case 'bond.add': {
      if (hasBond(state.molecule, command.bondId)) {
        return { ok: false, reason: `键 id 已存在：${command.bondId}` }
      }
      const result = runAddBondCommand(state.molecule, command)
      if (result.ok === false) return { ok: false, reason: result.reason }
      if (!result.changed) return { ok: true, changed: false, state }
      const molecule = renameAddedBond(state.molecule, result.molecule, command.bondId)
      return molecule
        ? { ok: true, changed: true, state: { ...state, molecule } }
        : { ok: false, reason: '添加键后无法确定新键' }
    }
    case 'bond.remove':
      if (!hasBond(state.molecule, command.bondId)) {
        return { ok: false, reason: `键不存在：${command.bondId}` }
      }
      return fromSelectionResult(
        state,
        runRemoveBondCommand(state.molecule, command.bondId, state.selection),
      )
    case 'bond.setOrder':
      if (!hasBond(state.molecule, command.bondId)) {
        return { ok: false, reason: `键不存在：${command.bondId}` }
      }
      return fromEditResult(
        state,
        runSetBondOrderCommand(state.molecule, command.bondId, command.order),
      )
    case 'fragment.attach': {
      const fragment = getFragment(command.fragmentId)
      if (!fragment) return { ok: false, reason: `模板不存在：${command.fragmentId}` }
      const result = runAttachFragmentToAtomCommand(state.molecule, {
        atomId: command.atomId,
        fragment,
        ...(command.torsionAngleDegrees === undefined
          ? {}
          : { torsionAngleDegrees: command.torsionAngleDegrees }),
      })
      if (result.ok === false) return result
      if (!result.changed) return { ok: true, changed: false, state }
      try {
        return {
          ok: true,
          changed: true,
          state: { ...state, molecule: renameAddedEntities(state.molecule, result.molecule, command.commandId) },
        }
      } catch (error) {
        return { ok: false, reason: error instanceof Error ? error.message : '模板实体重命名失败' }
      }
    }
    case 'fragment.fuse': {
      if (!hasBond(state.molecule, command.bondId)) {
        return { ok: false, reason: `键不存在：${command.bondId}` }
      }
      const fragment = getFragment(command.fragmentId)
      if (!fragment) return { ok: false, reason: `模板不存在：${command.fragmentId}` }
      const result = runFuseFragmentOnBondCommand(state.molecule, {
        bondId: command.bondId,
        fragment,
      })
      if (result.ok === false) return result
      if (!result.changed) return { ok: true, changed: false, state }
      try {
        return {
          ok: true,
          changed: true,
          state: { ...state, molecule: renameAddedEntities(state.molecule, result.molecule, command.commandId) },
        }
      } catch (error) {
        return { ok: false, reason: error instanceof Error ? error.message : '并环实体重命名失败' }
      }
    }
    case 'fragment.bridge': {
      const fragment = getFragment(command.fragmentId)
      if (!fragment) return { ok: false, reason: `模板不存在：${command.fragmentId}` }
      const result = runBridgeFragmentBetweenAtomsCommand(state.molecule, {
        atomId1: command.atomId1,
        atomId2: command.atomId2,
        fragment,
        ...(command.orientationDegrees === undefined
          ? {}
          : { orientationDegrees: command.orientationDegrees }),
      })
      if (result.ok === false) return result
      if (!result.changed) return { ok: true, changed: false, state }
      try {
        return {
          ok: true,
          changed: true,
          state: { ...state, molecule: renameAddedEntities(state.molecule, result.molecule, command.commandId) },
        }
      } catch (error) {
        return { ok: false, reason: error instanceof Error ? error.message : '双锚点模板实体重命名失败' }
      }
    }
    case 'geometry.setBondLength':
      return fromEditResult(
        state,
        runSetBondLengthCommand(
          state.molecule,
          command.atomId1,
          command.atomId2,
          command.length,
        ),
      )
    case 'geometry.setBondAngle':
      return fromEditResult(
        state,
        runSetBondAngleCommand(
          state.molecule,
          command.atomId1,
          command.atomId2,
          command.atomId3,
          command.angleDegrees,
        ),
      )
    case 'geometry.setDihedral':
      return fromEditResult(
        state,
        runSetDihedralAngleCommand(
          state.molecule,
          command.atomId1,
          command.atomId2,
          command.atomId3,
          command.atomId4,
          command.angleDegrees,
        ),
      )
    case 'geometry.rotateGroup': {
      const first = state.molecule.atoms.find(atom => atom.id === command.axisAtomId1)
      const second = state.molecule.atoms.find(atom => atom.id === command.axisAtomId2)
      if (!first || !second) return { ok: false, reason: '旋转轴原子不存在' }
      if (command.axisAtomId1 === command.axisAtomId2) {
        return { ok: false, reason: '刚性旋转轴必须由两个不同原子定义' }
      }
      const quaternion = quaternionAroundAxis(first, second, command.angleDegrees)
      if (!quaternion) return { ok: false, reason: '刚性旋转轴长度为零' }
      const result = runRotateAtomGroupCommand(
        state.molecule,
        new Set(command.atomIds),
        first,
        quaternion,
      )
      if (!result.changed) return { ok: true, changed: false, state }
      return {
        ok: true,
        changed: true,
        state: { ...state, molecule: applyPositionMap(state.molecule, result.positions) },
      }
    }
  }
}

function invalidResult(
  targetObjectId: string | null,
  baseRevision: string | null,
  issues: readonly ModelingIssue[],
): ModelingDryRunResult {
  return { ok: false, changed: false, targetObjectId, baseRevision, issues }
}

function dryRunEditPlanInternal(
  context: ModelingContext,
  input: EditPlan | unknown,
  traceSteps?: ModelingPlanTraceStep[],
): ModelingDryRunResult {
  const parsed = parseEditPlan(input)
  if (parsed.ok === false) return invalidResult(null, null, parsed.issues)
  const plan = parsed.plan
  const target = context.objects.find(object => object.objectId === plan.targetObjectId)
  if (!target) {
    return invalidResult(plan.targetObjectId, null, [{
      severity: 'error',
      code: 'target-not-found',
      message: `场景对象不存在：${plan.targetObjectId}`,
    }])
  }
  if (!target.editable) {
    return invalidResult(target.objectId, target.revision, [{
      severity: 'error',
      code: 'object-not-editable',
      message: target.locked ? '目标对象已锁定' : '目标对象不可见',
    }])
  }
  if (plan.expectedRevision && plan.expectedRevision !== target.revision) {
    return invalidResult(target.objectId, target.revision, [{
      severity: 'error',
      code: 'stale-context',
      message: `目标结构已变化：期望 ${plan.expectedRevision}，当前 ${target.revision}`,
    }])
  }

  const duplicateCommandIds = plan.commands
    .map(command => command.commandId)
    .filter((id, index, ids) => ids.indexOf(id) !== index)
  if (duplicateCommandIds.length > 0) {
    return invalidResult(target.objectId, target.revision, [{
      severity: 'error',
      code: 'duplicate-id',
      message: `命令 id 重复：${duplicateCommandIds[0]}`,
    }])
  }

  const unsupportedCommandIndex = plan.commands.findIndex(
    command => !context.capabilities.includes(command.kind),
  )
  if (unsupportedCommandIndex >= 0) {
    const command = plan.commands[unsupportedCommandIndex]
    return invalidResult(target.objectId, target.revision, [{
      severity: 'error',
      code: 'unsupported-command',
      message: `当前执行器不支持命令：${command?.kind ?? 'unknown'}`,
      commandIndex: unsupportedCommandIndex,
      ...(command ? { commandId: command.commandId } : {}),
    }])
  }

  if (plan.anchor?.kind === 'atom' && !hasAtom(target.molecule, plan.anchor.atomId)) {
    return invalidResult(target.objectId, target.revision, [{
      severity: 'error',
      code: 'atom-not-found',
      message: `锚点原子不存在：${plan.anchor.atomId}`,
    }])
  }
  if (plan.anchor?.kind === 'bond' && !hasBond(target.molecule, plan.anchor.bondId)) {
    return invalidResult(target.objectId, target.revision, [{
      severity: 'error',
      code: 'bond-not-found',
      message: `锚点键不存在：${plan.anchor.bondId}`,
    }])
  }

  const constraintIssues = validateModelingConstraints(target.molecule, plan.constraints)
  if (constraintIssues.length > 0) {
    return invalidResult(target.objectId, target.revision, constraintIssues)
  }

  const scopedAtomIds = plan.scope?.kind === 'selection'
    ? new Set(plan.scope.atomIds)
    : null
  const scopedBondIds = plan.scope?.kind === 'selection'
    ? new Set(plan.scope.bondIds)
    : null
  if (scopedAtomIds || scopedBondIds) {
    const selectedAtomIds = new Set(context.selection.atomIds)
    const selectedBondIds = new Set(context.selection.bondIds)
    const invalidScopedAtom = [...(scopedAtomIds ?? [])].find(
      atomId => !selectedAtomIds.has(atomId) || !hasAtom(target.molecule, atomId),
    )
    const invalidScopedBond = [...(scopedBondIds ?? [])].find(
      bondId => !selectedBondIds.has(bondId) || !hasBond(target.molecule, bondId),
    )
    if (invalidScopedAtom || invalidScopedBond) {
      return invalidResult(target.objectId, target.revision, [{
        severity: 'error',
        code: 'out-of-scope',
        message: invalidScopedAtom
          ? `原子不在当前选区：${invalidScopedAtom}`
          : `键不在当前选区：${invalidScopedBond}`,
      }])
    }
  }

  let state: WorkingState = {
    molecule: target.molecule,
    selection: {
      selectedAtomIds: new Set(context.selection.atomIds),
      selectedBondIds: new Set(context.selection.bondIds),
    },
  }
  const issues: ModelingIssue[] = []
  let changed = false

  for (let commandIndex = 0; commandIndex < plan.commands.length; commandIndex += 1) {
    const command = plan.commands[commandIndex]
    if (!command) continue
    const commandConstraintIssue = validateModelingCommandConstraints(command, plan.constraints)
    if (commandConstraintIssue) {
      return invalidResult(target.objectId, target.revision, [
        ...issues,
        { ...commandConstraintIssue, commandIndex, commandId: command.commandId },
      ])
    }
    if (scopedAtomIds || scopedBondIds) {
      const targets = existingTargets(command)
      const atomOutsideScope = targets.atomIds.find(atomId => !scopedAtomIds?.has(atomId))
      const bondOutsideScope = targets.bondIds.find(bondId => !scopedBondIds?.has(bondId))
      if (atomOutsideScope || bondOutsideScope) {
        return invalidResult(target.objectId, target.revision, [
          ...issues,
          {
            severity: 'error',
            code: 'out-of-scope',
            message: atomOutsideScope
              ? `命令访问了选区外原子：${atomOutsideScope}`
              : `命令访问了选区外键：${bondOutsideScope}`,
            commandIndex,
            commandId: command.commandId,
          },
        ])
      }
    }
    const previousAtomIds = new Set(state.molecule.atoms.map(atom => atom.id))
    const previousBondIds = new Set(state.molecule.bonds.map(bond => bond.id))
    const before = traceSteps ? cloneModelingMolecule(state.molecule) : null
    const result = executeCommand(state, command)
    if (result.ok === false) {
      const code = result.reason.startsWith('未知元素')
        ? 'unknown-element'
        : result.reason.startsWith('原子不存在')
          ? 'atom-not-found'
          : result.reason.startsWith('键不存在')
            ? 'bond-not-found'
            : result.reason.includes('id 已存在')
              ? 'duplicate-id'
              : 'command-failed'
      return invalidResult(target.objectId, target.revision, [
        ...issues,
        {
          severity: 'error',
          code,
          message: result.reason,
          commandIndex,
          commandId: command.commandId,
        },
      ])
    }
    const invariantIssues = validateModelingConstraintInvariants(
      target.molecule,
      result.state.molecule,
      plan.constraints,
    )
    if (invariantIssues.length > 0) {
      return invalidResult(target.objectId, target.revision, [
        ...issues,
        ...invariantIssues.map(issue => ({
          ...issue,
          commandIndex,
          commandId: command.commandId,
        })),
      ])
    }
    if (!result.changed) {
      issues.push({
        severity: 'warning',
        code: 'command-noop',
        message: '命令未产生结构变化',
        commandIndex,
        commandId: command.commandId,
      })
    }
    changed ||= result.changed
    state = result.state
    if (traceSteps && before) {
      traceSteps.push({
        commandId: command.commandId,
        commandKind: command.kind,
        before,
        after: cloneModelingMolecule(state.molecule),
      })
    }
    for (const atom of state.molecule.atoms) {
      if (!previousAtomIds.has(atom.id)) scopedAtomIds?.add(atom.id)
    }
    for (const bond of state.molecule.bonds) {
      if (!previousBondIds.has(bond.id)) scopedBondIds?.add(bond.id)
    }
  }

  return {
    ok: true,
    changed,
    targetObjectId: target.objectId,
    baseRevision: target.revision,
    nextRevision: computeMoleculeRevision(state.molecule),
    molecule: state.molecule,
    selection: {
      atomIds: [...state.selection.selectedAtomIds],
      bondIds: [...state.selection.selectedBondIds],
    },
    changes: createModelingChangeSet(target.molecule, state.molecule),
    issues,
  }
}

export function dryRunEditPlan(
  context: ModelingContext,
  input: EditPlan | unknown,
): ModelingDryRunResult {
  return dryRunEditPlanInternal(context, input)
}

/** Internal one-pass execution trace used by trusted headless adapters. */
export function dryRunEditPlanWithTrace(
  context: ModelingContext,
  input: EditPlan | unknown,
): ModelingPlanTraceResult {
  const steps: ModelingPlanTraceStep[] = []
  const result = dryRunEditPlanInternal(context, input, steps)
  return { result, steps: result.ok ? steps : [] }
}
