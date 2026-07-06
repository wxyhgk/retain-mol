/**
 * moleculeStore 共享纯工具
 *
 * 全部接收 state（或 get/set），不持有 store 引用，供各 slice 复用。
 */

import type { Molecule } from '../../lib/molecule'
import type { SceneObject } from '../../lib/sceneObject'
import type { GeomEditResult } from '../../lib/builder/BuilderEngine'
import type { MoleculeState } from './types'

// ── Selectors ─────────────────────────────────────────────────────────────────

export function selectActiveMolecule(s: MoleculeState): Molecule | null {
  return s.activeObjectId ? (s.objectsById[s.activeObjectId]?.molecule ?? null) : null
}

export function selectActiveMoleculeOrEmpty(s: MoleculeState): Molecule {
  return selectActiveMolecule(s) ?? { atoms: [], bonds: [], name: 'New Molecule' }
}

// ── 内部工具 ──────────────────────────────────────────────────────────────────

export function getActiveMol(s: MoleculeState): Molecule | null {
  return s.activeObjectId ? (s.objectsById[s.activeObjectId]?.molecule ?? null) : null
}

export function patchActiveMol(s: MoleculeState, newMol: Molecule): Partial<MoleculeState> {
  if (!s.activeObjectId) return {}
  const obj = s.objectsById[s.activeObjectId]
  if (!obj) return {}
  return {
    objectsById: {
      ...s.objectsById,
      [s.activeObjectId]: { ...obj, molecule: newMol, name: newMol.name ?? obj.name },
    },
  }
}

/** 几何参数编辑（键长/键角/二面角）的统一落盘：单次 set = 单步 undo，附带位置版本号自增 */
export function applyGeomEdit(
  get: () => MoleculeState,
  set: (fn: (s: MoleculeState) => Partial<MoleculeState>) => void,
  edit: (mol: Molecule) => GeomEditResult,
): { ok: boolean; reason?: string } {
  const mol = getActiveMol(get())
  if (!mol) return { ok: false, reason: '没有活跃分子' }
  const result = edit(mol)
  if (!result.ok) return result
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

export function computeAutoOffset(objects: SceneObject[]): { x: number; y: number; z: number } {
  let maxX = -Infinity
  for (const obj of objects)
    for (const atom of obj.molecule.atoms)
      if (atom.x > maxX) maxX = atom.x
  return { x: isFinite(maxX) ? maxX + 5 : 0, y: 0, z: 0 }
}
