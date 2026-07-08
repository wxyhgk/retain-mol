/**
 * moleculeStore 共享纯工具
 *
 * 全部接收 state（或 get/set），不持有 store 引用，供各 slice 复用。
 */

import type { Atom, Bond, Molecule } from '../../lib/molecule'
import type { SceneObject } from '../../lib/sceneObject'
import type { GeomEditResult } from '../../lib/builder/BuilderEngine'
import type { MoleculeState } from './types'
import { PLACEMENT } from '../../config/interaction.config'
import { findBond } from '../../lib/builder/graph'
import { maxValence, valenceUsed } from '../../lib/builder/valence'
import { genId } from '../../lib/utils'

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
  return { x: isFinite(maxX) ? maxX + PLACEMENT.addObjectOffsetX : 0, y: 0, z: 0 }
}

function nextUnusedId(reserved: Set<string>): string {
  let id = genId()
  while (reserved.has(id)) id = genId()
  reserved.add(id)
  return id
}

export function moleculeIdsInScene(objects: Iterable<SceneObject>): Set<string> {
  const ids = new Set<string>()
  for (const obj of objects) {
    for (const atom of obj.molecule.atoms) ids.add(atom.id)
    for (const bond of obj.molecule.bonds) ids.add(bond.id)
  }
  return ids
}

export function withSceneUniqueIds(mol: Molecule, reservedIds: Set<string>): Molecule {
  const atomIdMap = new Map<string, string>()
  let changed = false
  const atoms: Atom[] = mol.atoms.map(atom => {
    if (!reservedIds.has(atom.id)) {
      reservedIds.add(atom.id)
      return atom
    }
    const id = nextUnusedId(reservedIds)
    atomIdMap.set(atom.id, id)
    changed = true
    return { ...atom, id }
  })

  const bonds: Bond[] = mol.bonds.map(bond => {
    const atomId1 = atomIdMap.get(bond.atomId1) ?? bond.atomId1
    const atomId2 = atomIdMap.get(bond.atomId2) ?? bond.atomId2
    if (!reservedIds.has(bond.id)) {
      reservedIds.add(bond.id)
      if (atomId1 === bond.atomId1 && atomId2 === bond.atomId2) return bond
      changed = true
      return { ...bond, atomId1, atomId2 }
    }
    changed = true
    return { ...bond, id: nextUnusedId(reservedIds), atomId1, atomId2 }
  })

  return changed ? { ...mol, atoms, bonds } : mol
}

export function validateAddBond(
  mol: Molecule,
  atomId1: string,
  atomId2: string,
  order: 1 | 2 | 3 = 1,
): { ok: boolean; reason?: string } {
  if (atomId1 === atomId2) return { ok: false, reason: '不能与自身成键' }
  const atom1 = mol.atoms.find(a => a.id === atomId1)
  const atom2 = mol.atoms.find(a => a.id === atomId2)
  if (!atom1 || !atom2) return { ok: false, reason: '原子不存在' }
  if (findBond(mol.bonds, atomId1, atomId2)) return { ok: false, reason: '两原子之间已存在键' }
  if (valenceUsed(mol, atomId1) + order > maxValence(atom1) + 1e-6) {
    return { ok: false, reason: `${atom1.symbol} 已达最大键数 (${maxValence(atom1)})` }
  }
  if (valenceUsed(mol, atomId2) + order > maxValence(atom2) + 1e-6) {
    return { ok: false, reason: `${atom2.symbol} 已达最大键数 (${maxValence(atom2)})` }
  }
  return { ok: true }
}
