/**
 * atomOps.ts — 原子级编辑操作
 * 纯函数，不修改入参，返回新 Molecule。
 */

import type { Molecule } from '../../molecule'
import { newAtom, newBond } from '../../molecule'
import { getElementConfig } from '../../../config/elements.config'
import { calcAddAtomOnExisting } from '../geometry/vsepr'

/** 替换指定原子的元素符号，保留位置、id 和已有键 */
export function replaceAtomSymbol(
  mol: Molecule,
  atomId: string,
  newSymbol: string,
): Molecule {
  if (!mol.atoms.some(a => a.id === atomId)) return mol
  return {
    ...mol,
    atoms: mol.atoms.map(a => a.id === atomId ? { ...a, symbol: newSymbol } : a),
  }
}

/**
 * 给分子中所有（或指定）原子补满氢原子。
 * @param atomId 可选，只对指定原子补氢；省略时对所有原子补氢
 */
export function autoAddHydrogens(mol: Molecule, atomId?: string): Molecule {
  const targets = atomId
    ? mol.atoms.filter(a => a.id === atomId)
    : mol.atoms

  let current = mol

  for (const target of targets) {
    const el = getElementConfig(target.symbol)
    if (el.maxBonds === 0) continue

    const targetBonds = current.bonds
      .filter(b => b.atomId1 === target.id || b.atomId2 === target.id)
    const usedValence = targetBonds.reduce((sum, b) => sum + b.order, 0)
    const needed = Math.max(0, el.maxBonds - usedValence)
    if (needed <= 0) continue

    for (let i = 0; i < needed; i++) {
      const centerAtom = current.atoms.find(a => a.id === target.id)!
      const result = calcAddAtomOnExisting(centerAtom, current.bonds, current.atoms, 'H')
      const h = newAtom('H', ...result.position)
      const bond = newBond(target.id, h.id)
      current = {
        ...current,
        atoms: [...current.atoms, h],
        bonds: [...current.bonds, bond],
      }
    }
  }

  return current
}
