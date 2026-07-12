/**
 * moleculeStore 共享纯工具
 *
 * 全部接收 state（或 get/set），不持有 store 引用，供各 slice 复用。
 */

import type { Molecule } from '../../lib/molecule'
import type { SceneObject } from '../../lib/sceneObject'
import type {
  EditCommandResult,
  EditCommandResultWithMeta,
  EditCommandWithSelectionResult,
  GeomCommandResult,
} from '../../lib/builder/commands/shared'
import type {
  AddSceneObjectCommandResult,
  RemoveSceneObjectCommandResult,
  SceneObjectUpdatedCommandResult,
  SetMoleculeInSceneCommandResult,
  SplitSceneObjectCommandResult,
} from '../../lib/builder/commands/scene'
import type { SelectionCommandResult } from '../../lib/builder/commands/selection'
import type { MoleculeState } from './types'

// ── Selectors ─────────────────────────────────────────────────────────────────

const EMPTY_MOLECULE: Molecule = { atoms: [], bonds: [], name: 'New Molecule' }

export function selectActiveMolecule(s: MoleculeState): Molecule | null {
  return s.activeObjectId ? (s.objectsById[s.activeObjectId]?.molecule ?? null) : null
}

export function selectActiveMoleculeOrEmpty(s: MoleculeState): Molecule {
  return selectActiveMolecule(s) ?? EMPTY_MOLECULE
}

// ── 内部工具 ──────────────────────────────────────────────────────────────────

export function isSceneObjectEditable(object: SceneObject | undefined): object is SceneObject {
  return Boolean(object && object.visible !== false && object.locked !== true)
}

export function getEditableObject(
  s: MoleculeState,
  objectId: string | null,
): SceneObject | null {
  if (!objectId) return null
  const object = s.objectsById[objectId]
  return isSceneObjectEditable(object) ? object : null
}

export function getActiveMol(s: MoleculeState): Molecule | null {
  return getEditableObject(s, s.activeObjectId)?.molecule ?? null
}

export function patchActiveMol(s: MoleculeState, newMol: Molecule): Partial<MoleculeState> {
  const objectId = s.activeObjectId
  const obj = getEditableObject(s, objectId)
  if (!objectId || !obj) return {}
  return {
    objectsById: {
      ...s.objectsById,
      [objectId]: { ...obj, molecule: newMol, name: newMol.name ?? obj.name },
    },
  }
}

export function applySelectionResult(
  s: MoleculeState,
  result: SelectionCommandResult,
): Partial<MoleculeState> {
  if (!result.selectionChanged) return {}
  return {
    selectedAtomIds: result.selectedAtomIds,
    selectedBondIds: result.selectedBondIds,
    selectionVersion: s.selectionVersion + 1,
  }
}

function clearSelectionPatch(
  s: MoleculeState,
): Partial<Pick<MoleculeState, 'selectedAtomIds' | 'selectedBondIds' | 'selectionVersion'>> {
  if (s.selectedAtomIds.size === 0 && s.selectedBondIds.size === 0) return {}
  return {
    selectedAtomIds: new Set(),
    selectedBondIds: new Set(),
    selectionVersion: s.selectionVersion + 1,
  }
}

export function applyAddSceneObjectResult(
  s: MoleculeState,
  result: AddSceneObjectCommandResult,
): Partial<MoleculeState> {
  return {
    objectsById: { ...s.objectsById, [result.object.id]: result.object },
    objectOrder: [...s.objectOrder, result.object.id],
    activeObjectId: result.object.id,
    ...clearSelectionPatch(s),
  }
}

export type SceneGraphCommandResult = RemoveSceneObjectCommandResult | SplitSceneObjectCommandResult

export function applySceneGraphResult(
  s: MoleculeState,
  result: SceneGraphCommandResult,
): Partial<MoleculeState> {
  if (!result.changed) return {}
  return {
    objectsById: result.objectsById,
    objectOrder: result.objectOrder,
    activeObjectId: result.activeObjectId,
    ...(result.clearSelection ? clearSelectionPatch(s) : {}),
  }
}

export type ActiveSceneObjectCommandResult =
  | { readonly ok: true; readonly changed: true; readonly activeObjectId: string | null; readonly clearSelection: boolean }
  | { readonly ok: true; readonly changed: false }

export function applyActiveSceneObjectResult(
  s: MoleculeState,
  result: ActiveSceneObjectCommandResult,
): Partial<MoleculeState> {
  if (!result.changed) return {}
  return {
    activeObjectId: result.activeObjectId,
    ...(result.clearSelection ? clearSelectionPatch(s) : {}),
  }
}

export function applySetMoleculeInSceneResult(
  s: MoleculeState,
  result: SetMoleculeInSceneCommandResult,
): Partial<MoleculeState> {
  return {
    objectsById: result.objectsById,
    objectOrder: result.objectOrder,
    activeObjectId: result.activeObjectId,
    ...(result.clearSelection ? clearSelectionPatch(s) : {}),
  }
}

export interface ApplySceneObjectUpdatedResultOptions {
  readonly bumpAtomPositionVersion?: boolean
}

export function applySceneObjectUpdatedResult(
  s: MoleculeState,
  result: SceneObjectUpdatedCommandResult,
  options: ApplySceneObjectUpdatedResultOptions = {},
): Partial<MoleculeState> {
  if (!result.changed) return {}
  return {
    objectsById: result.objectsById,
    ...(options.bumpAtomPositionVersion ? { atomPositionVersion: s.atomPositionVersion + 1 } : {}),
  }
}

export interface ApplyActiveMoleculeEditOptions {
  readonly bumpAtomPositionVersion?: boolean
}

export function applyActiveMoleculeEdit(
  s: MoleculeState,
  edit: (mol: Molecule) => EditCommandResult,
  options: ApplyActiveMoleculeEditOptions = {},
): Partial<MoleculeState> {
  const mol = getActiveMol(s)
  if (!mol) return {}
  const result = edit(mol)
  if (!result.ok || !result.changed) return {}
  return {
    ...patchActiveMol(s, result.molecule),
    ...(options.bumpAtomPositionVersion ? { atomPositionVersion: s.atomPositionVersion + 1 } : {}),
  }
}

export function applyActiveMoleculeEditWithMeta<TMeta extends object>(
  get: () => MoleculeState,
  set: (fn: (s: MoleculeState) => Partial<MoleculeState>) => void,
  edit: (mol: Molecule) => EditCommandResultWithMeta<TMeta>,
  readMeta: (result: Extract<EditCommandResultWithMeta<TMeta>, { ok: true }>) => TMeta,
): ({ ok: true } & TMeta) | { ok: false; reason?: string } {
  const mol = getActiveMol(get())
  if (!mol) return { ok: false, reason: '没有活跃分子' }
  const result = edit(mol)
  if (!result.ok) return result
  const meta = readMeta(result)
  if (!result.changed) return { ok: true, ...meta }
  set((s) => {
    const m = getActiveMol(s)
    if (!m) return {}
    return patchActiveMol(s, result.molecule)
  })
  return { ok: true, ...meta }
}

export function applyActiveMoleculeEditWithSelection(
  s: MoleculeState,
  edit: (mol: Molecule, selection: MoleculeState) => EditCommandWithSelectionResult | { ok: false; reason: string },
): Partial<MoleculeState> {
  const mol = getActiveMol(s)
  if (!mol) return {}
  const result = edit(mol, s)
  if (!result.ok) return {}
  return applyActiveMoleculeSelectionResult(s, result)
}

export function applyActiveMoleculeSelectionCommand(
  get: () => MoleculeState,
  set: (fn: (s: MoleculeState) => Partial<MoleculeState>) => void,
  edit: (mol: Molecule, selection: MoleculeState) => EditCommandWithSelectionResult | { ok: false; reason: string },
): { ok: boolean; reason?: string } {
  const state = get()
  const mol = getActiveMol(state)
  if (!mol) return { ok: false, reason: '没有活跃分子' }
  const result = edit(mol, state)
  if (result.ok === false) return { ok: false, reason: result.reason }
  if (!result.moleculeChanged && !result.selectionChanged) return { ok: true }
  set((s) => applyActiveMoleculeSelectionResult(s, result))
  return { ok: true }
}

export function applyActiveMoleculeSelectionResult(
  s: MoleculeState,
  result: EditCommandWithSelectionResult,
): Partial<MoleculeState> {
  if (!result.moleculeChanged && !result.selectionChanged) return {}
  return {
    ...(result.moleculeChanged ? patchActiveMol(s, result.molecule) : {}),
    ...(result.selectionChanged
      ? {
          selectedAtomIds: result.selectedAtomIds,
          selectedBondIds: result.selectedBondIds,
          selectionVersion: s.selectionVersion + 1,
        }
      : {}),
  }
}

/** 几何参数编辑（键长/键角/二面角）的统一落盘：单次 set = 单步 undo，附带位置版本号自增 */
export function applyGeomEdit(
  get: () => MoleculeState,
  set: (fn: (s: MoleculeState) => Partial<MoleculeState>) => void,
  edit: (mol: Molecule) => GeomCommandResult,
): { ok: boolean; reason?: string } {
  const mol = getActiveMol(get())
  if (!mol) return { ok: false, reason: '没有活跃分子' }
  const result = edit(mol)
  if (!result.ok) return result
  if (!result.changed) return { ok: true }
  set((s) => {
    const m = getActiveMol(s)
    if (!m) return {}
    return {
      ...patchActiveMol(s, result.molecule),
      atomPositionVersion: s.atomPositionVersion + 1,
    }
  })
  return { ok: true }
}

export type GeomCommandResultWithMeta<TMeta extends object> =
  | ({ ok: true; changed: true; molecule: Molecule } & TMeta)
  | ({ ok: true; changed: false } & Partial<TMeta>)
  | { ok: false; reason: string }

export function applyGeomEditWithMeta<TMeta extends object>(
  get: () => MoleculeState,
  set: (fn: (s: MoleculeState) => Partial<MoleculeState>) => void,
  edit: (mol: Molecule) => GeomCommandResultWithMeta<TMeta>,
  readMeta: (result: Extract<GeomCommandResultWithMeta<TMeta>, { ok: true }>) => TMeta,
): ({ ok: true } & TMeta) | { ok: false; reason?: string } {
  const mol = getActiveMol(get())
  if (!mol) return { ok: false, reason: '没有活跃分子' }
  const result = edit(mol)
  if (!result.ok) return result
  const meta = readMeta(result)
  if (!result.changed) return { ok: true, ...meta }
  set((s) => {
    const m = getActiveMol(s)
    if (!m) return {}
    return {
      ...patchActiveMol(s, result.molecule),
      atomPositionVersion: s.atomPositionVersion + 1,
    }
  })
  return { ok: true, ...meta }
}

/**
 * activateObjectContainingAtom / activateObjectContainingBond 的共同实现：
 * 按 objectOrder 找到宿主对象后先做可编辑性守卫——不可见/锁定的对象拒绝激活，
 * 编辑手势不应"穿透"到用户看不见或已锁定的分子上。
 */
export function activateObjectWhere(
  s: MoleculeState,
  contains: (obj: SceneObject) => boolean,
): boolean {
  for (const oid of s.objectOrder) {
    const obj = s.objectsById[oid]
    if (!obj || !contains(obj)) continue
    if (obj.visible === false || obj.locked === true) return false
    // set 是同步的：返回 true 时调用方立即读到新的 activeObjectId
    if (s.activeObjectId !== oid) s.setActiveObject(oid)
    return true
  }
  return false
}
