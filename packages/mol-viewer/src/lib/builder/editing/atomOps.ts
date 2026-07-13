/**
 * atomOps.ts — 原子级编辑操作
 * 纯函数，不修改入参，返回新 Molecule。
 */

import type { Molecule, Atom } from '../../molecule'
import { newAtom, newBond } from '../../molecule'
import { getElementConfig } from '../../../config/elements.config'
import { degree, hParentOf, hNeighborsOf } from '../graph'
import { calcAddAtomOnExisting, calcBondLength } from '../geometry/vsepr'
import { maxValence, targetValence, valenceUsed } from '../valence'

/** 原子的有效成键数（读取自身电荷/自由基） */
function atomMaxBonds(a: Atom): number {
  return maxValence(a)
}

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
  const atom = mol.atoms.find(a => a.id === atomId)
  if (!atom || atom.symbol === newSymbol) return mol
  return {
    ...mol,
    atoms: mol.atoms.map(a => {
      if (a.id !== atomId) return a
      const {
        coordinationGeometry: _coordinationGeometry,
        coordinationDirections: _coordinationDirections,
        coordinationSites: _coordinationSites,
        coordinationNumber: _coordinationNumber,
        ...plainAtom
      } = a
      return { ...plainAtom, symbol: newSymbol }
    }),
  }
}

/**
 * 替换原子元素：计算化学建模语义下只改元素符号，保留 id、坐标和已有连接。
 * 不按单双键/价态增删 H，也不因为价态看起来异常而拒绝；这些问题交给检查器提示。
 */
export function substituteAtomElement(
  mol: Molecule,
  atomId: string,
  newSymbol: string,
): Molecule {
  return replaceAtomSymbol(mol, atomId, newSymbol)
}

/**
 * 给指定原子加恰好一个 H（如果还有剩余连接位）。
 * 用连接数而非键级之和判断，SDF 中的键级仅供参考，不作为编辑约束。
 * 返回新分子；若已满或找不到原子则原样返回。
 */
export function addOneHydrogen(mol: Molecule, atomId: string): Molecule {
  const atom = mol.atoms.find(a => a.id === atomId)
  if (!atom) return mol
  if (atomMaxBonds(atom) === 0) return mol
  if (valenceUsed(mol, atomId) >= atomMaxBonds(atom)) return mol
  const result = calcAddAtomOnExisting(atom, mol.bonds, mol.atoms, 'H')
  const h = newAtom('H', ...result.position)
  return {
    ...mol,
    atoms: [...mol.atoms, h],
    bonds: [...mol.bonds, newBond(atomId, h.id)],
  }
}

/**
 * 让指定原子的 H 数量对齐到当前有效成键数（设电荷/自由基后调用）：
 *  - 差额 > 0：补 H（NH₃ 设 +1 → 长出第 4 个 H 成 NH₄⁺）
 *  - 差额 < 0：删多余的 H（H₂O 设 −1 → 掉一个 H 成 OH⁻）
 * 只增删 H，不动重原子邻居；重原子已占满时不强删（返回尽力对齐的结果）。
 */
export function resaturateAtom(mol: Molecule, atomId: string): Molecule {
  const atom = mol.atoms.find(a => a.id === atomId)
  if (!atom) return mol
  const diff = targetValence(atom) - valenceUsed(mol, atomId)
  if (diff > 0) return autoAddHydrogens(mol, atomId)
  if (diff < 0) {
    const hs = hNeighborsOf(mol, atomId).slice(0, Math.ceil(-diff))
    if (hs.length === 0) return mol
    const remove = new Set(hs.map(h => h.id))
    return {
      ...mol,
      atoms: mol.atoms.filter(a => !remove.has(a.id)),
      bonds: mol.bonds.filter(b => !remove.has(b.atomId1) && !remove.has(b.atomId2)),
    }
  }
  return mol
}

/** 只删除超出当前目标价态的 H，不补缺失 H；用于显式提高键级后的拓扑清理。 */
export function removeExcessHydrogens(mol: Molecule, atomId: string): Molecule {
  const atom = mol.atoms.find(a => a.id === atomId)
  if (!atom) return mol
  const excess = valenceUsed(mol, atomId) - targetValence(atom)
  if (excess <= 0) return mol
  const hs = hNeighborsOf(mol, atomId).slice(0, Math.ceil(excess))
  if (hs.length === 0) return mol
  const remove = new Set(hs.map(h => h.id))
  return {
    ...mol,
    atoms: mol.atoms.filter(a => !remove.has(a.id)),
    bonds: mol.bonds.filter(b => !remove.has(b.atomId1) && !remove.has(b.atomId2)),
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
    const targetMax = targetValence(target)
    if (targetMax === 0) continue

    const needed = Math.max(0, Math.floor(targetMax - valenceUsed(current, target.id) + 1e-6))
    if (needed <= 0) continue

    for (let i = 0; i < needed; i++) {
      const centerAtom = current.atoms.find(a => a.id === target.id)
      if (!centerAtom) break
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
