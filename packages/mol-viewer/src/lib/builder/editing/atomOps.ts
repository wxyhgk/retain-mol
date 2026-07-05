/**
 * atomOps.ts — 原子级编辑操作
 * 纯函数，不修改入参，返回新 Molecule。
 */

import type { Molecule } from '../../molecule'
import { newAtom, newBond } from '../../molecule'
import { getElementConfig } from '../../../config/elements.config'
import { degree, hParentOf } from '../graph'
import { calcAddAtomOnExisting, calcBondLength } from '../geometry/vsepr'

/**
 * 槽位 H 被 newSymbol 替换后的落点（growByReplacingH 与拖拽/点击预览共用，
 * 保证所见即所得）：沿 父原子→H 方向按标准键长定位。
 * 孤立 H / 宿主原子缺失 → null（预览端自行处理，落盘端走各自的退化守卫）。
 */
export function resolveHSlotGrowth(
  mol: Molecule,
  hId: string,
  newSymbol: string,
): { x: number; y: number; z: number } | null {
  const h = mol.atoms.find(a => a.id === hId)
  if (!h) return null
  const hp = hParentOf(mol, hId)
  if (!hp) return null
  const { parent } = hp
  let dx = h.x - parent.x, dy = h.y - parent.y, dz = h.z - parent.z
  const norm = Math.hypot(dx, dy, dz)
  if (norm < 1e-6) { dx = 1; dy = 0; dz = 0 } else { dx /= norm; dy /= norm; dz /= norm }
  const len = calcBondLength(parent.symbol, newSymbol)
  return { x: parent.x + dx * len, y: parent.y + dy * len, z: parent.z + dz * len }
}

/**
 * 点 H 生长：把一个 H 替换为 newSymbol 的饱和基团（价态完整模型的核心操作）。
 * 保留原 H 的 id（选择/测量引用不失效），沿 父原子→H 方向按标准键长重定位，
 * 再给新原子补满 H。孤立 H（无键）只替换元素后补氢。
 */
export function growByReplacingH(
  mol: Molecule,
  hAtomId: string,
  newSymbol: string,
): Molecule {
  const h = mol.atoms.find(a => a.id === hAtomId)
  if (!h || h.symbol !== 'H' || newSymbol === 'H') return mol

  const hasBond = degree(mol.bonds, hAtomId) > 0
  let next: Molecule
  if (!hasBond) {
    next = replaceAtomSymbol(mol, hAtomId, newSymbol)
  } else {
    // He 等 maxBonds=0 的元素承接不了父键：替换会产生带键的稀有气体，
    // 打破价态不变式 → 按本函数的失败约定原样返回
    if (getElementConfig(newSymbol).maxBonds < 1) return mol
    const pos = resolveHSlotGrowth(mol, hAtomId, newSymbol)
    if (!pos) return mol   // 宿主原子缺失（悬空键）
    next = {
      ...mol,
      atoms: mol.atoms.map(a => a.id === hAtomId
        ? { ...a, symbol: newSymbol, x: pos.x, y: pos.y, z: pos.z }
        : a),
    }
  }
  return autoAddHydrogens(next, hAtomId)
}

/** 替换指定原子的元素符号，保留位置、id 和已有键 */
export function replaceAtomSymbol(
  mol: Molecule,
  atomId: string,
  newSymbol: string,
): Molecule {
  if (!mol.atoms.some(a => a.id === atomId)) return mol
  // 新元素撑不起现有连接数（如把带两键的 O 换成 He）→ 拒绝，守住价态不变式：
  // 画布上永远是完整分子，不允许出现超价原子
  if (getElementConfig(newSymbol).maxBonds < degree(mol.bonds, atomId)) return mol
  return {
    ...mol,
    atoms: mol.atoms.map(a => a.id === atomId ? { ...a, symbol: newSymbol } : a),
  }
}

/**
 * 给指定原子加恰好一个 H（如果还有剩余连接位）。
 * 用连接数而非键级之和判断，SDF 中的键级仅供参考，不作为编辑约束。
 * 返回新分子；若已满或找不到原子则原样返回。
 */
export function addOneHydrogen(mol: Molecule, atomId: string): Molecule {
  const atom = mol.atoms.find(a => a.id === atomId)
  if (!atom) return mol
  const el = getElementConfig(atom.symbol)
  if (el.maxBonds === 0) return mol
  if (degree(mol.bonds, atomId) >= el.maxBonds) return mol
  const result = calcAddAtomOnExisting(atom, mol.bonds, mol.atoms, 'H')
  const h = newAtom('H', ...result.position)
  return {
    ...mol,
    atoms: [...mol.atoms, h],
    bonds: [...mol.bonds, newBond(atomId, h.id)],
  }
}

/**
 * 给分子中所有（或指定）原子补满氢原子。
 * 同样以连接数判断，不依赖键级。
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

    const needed = Math.max(0, el.maxBonds - degree(current.bonds, target.id))
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
