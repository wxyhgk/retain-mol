/**
 * atomOps.ts — 原子级编辑操作
 * 纯函数，不修改入参，返回新 Molecule。
 */

import type { Molecule, Atom, Bond } from '../../molecule'
import { newAtom, newBond } from '../../molecule'
import { getElementConfig } from '../../../config/elements.config'
import { degree, hParentOf, hNeighborsOf } from '../graph'
import { calcAddAtomOnExisting, calcBondLength } from '../geometry/vsepr'
import { maxValence, targetValence, valenceUsed } from '../valence'
import { getHydrogenAdditionAvailability, isPotentialStereoCenter } from '../../chemistry/policies/atomPolicy'
import { getConnectedFragment } from '../analysis/fragments'
import { flipTetraBranches, parityFromCoords } from '../../stereo/geometry'
import { perceiveAtomChirality, reconcileAtomChirality } from '../../stereo/perception'

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
  return reconcileAtomChirality({
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
  })
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
  if (getHydrogenAdditionAvailability(mol, atomId).ok === false) return mol
  const atom = mol.atoms.find(a => a.id === atomId)
  if (!atom) return mol
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
    if (getHydrogenAdditionAvailability(current, target.id).ok === false) continue
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

export type FlipChiralityAvailability =
  | { readonly ok: true }
  | { readonly ok: false; readonly reason: string }

/**
 * 翻转前置检查：C/Si、四显式单键配体、非芳香、非平面。
 * 隐 H 中心直接拒绝（先补显式 H 再翻；看不见的第四配体无法搬运）。
 */
export function flipChiralityAvailability(mol: Molecule, atomId: string): FlipChiralityAvailability {
  const center = mol.atoms.find(a => a.id === atomId)
  if (!center) return { ok: false, reason: '原子不存在' }
  if (!isPotentialStereoCenter(mol, atomId)) {
    if (center.symbol !== 'C' && center.symbol !== 'Si') {
      return { ok: false, reason: '仅 C / Si 支持翻转（N 会快速消旋，无指定意义）' }
    }
    return { ok: false, reason: '需要 4 个单键配体且全部显式存在（含 H），且不在芳香环上' }
  }
  const ligands = mol.bonds
    .filter(b => b.atomId1 === atomId || b.atomId2 === atomId)
    .map(b => (b.atomId1 === atomId ? b.atomId2 : b.atomId1))
  const [l0, l1, l2, l3] = ligands.map(id => mol.atoms.find(a => a.id === id))
  if (!l0 || !l1 || !l2 || !l3) return { ok: false, reason: '原子不存在' }
  if (parityFromCoords([l0, l1, l2, l3]) === 0) {
    return { ok: false, reason: '中心已平面化，无需翻转' }
  }
  return { ok: true }
}

/**
 * 翻转手性中心：旋转分支最小的一对独立取代基，保留键长（含 wedge 互换），R↔S 标签同步翻转，
 * 未指定保持未指定。失败原样返回同一引用。调用方包进 undo 事务。
 * 提交前复核真实 CIP 已反转，失败不修改分子。
 */
export function flipChirality(mol: Molecule, atomId: string): Molecule {
  if (!flipChiralityAvailability(mol, atomId).ok) return mol
  const center = mol.atoms.find(a => a.id === atomId)
  if (!center) return mol
  const originalChirality = perceiveAtomChirality(mol).get(atomId)
  if (originalChirality === undefined) return mol
  const ligandIds = mol.bonds
    .filter(b => b.atomId1 === atomId || b.atomId2 === atomId)
    .map(b => (b.atomId1 === atomId ? b.atomId2 : b.atomId1))
  const cut = mol.bonds.filter(b => b.atomId1 !== atomId && b.atomId2 !== atomId)
  let best: [string, string] | null = null
  let bestSize = Number.POSITIVE_INFINITY
  for (let i = 0; i < ligandIds.length; i += 1) {
    for (let j = i + 1; j < ligandIds.length; j += 1) {
      const a = ligandIds[i]
      const b = ligandIds[j]
      if (a === undefined || b === undefined) continue
      const branchA = getConnectedFragment(mol.atoms, cut, a)
      const branchB = getConnectedFragment(mol.atoms, cut, b)
      if ([...branchA].some(id => branchB.has(id))) continue
      if (ligandIds.some(id => (id !== a && branchA.has(id)) || (id !== b && branchB.has(id)))) continue
      const size = branchA.size + branchB.size
      if (size < bestSize) {
        bestSize = size
        best = [a, b]
      }
    }
  }
  if (!best) return mol
  const flipped = flipTetraBranches(mol, atomId, best[0], best[1])
  if (!flipped) return mol
  const toggled: 'R' | 'S' | undefined = center.chirality === 'R' ? 'S' : center.chirality === 'S' ? 'R' : undefined
  const atoms = flipped.molecule.atoms.map(a => {
    if (a.id !== atomId || toggled === undefined) return a
    return { ...a, chirality: toggled }
  })
  const bondOf = (lid: string): Bond | undefined =>
    flipped.molecule.bonds.find(
      b => (b.atomId1 === atomId && b.atomId2 === lid) || (b.atomId1 === lid && b.atomId2 === atomId),
    )
  const bondA = bondOf(best[0])
  const bondB = bondOf(best[1])
  if (!bondA || !bondB) return mol
  const withWedge = (b: Bond, wedge: 'up' | 'down' | undefined): Bond => {
    if (b.wedge === wedge) return b
    if (wedge === undefined) {
      const { wedge: _omitWedge, ...rest } = b
      return rest
    }
    return { ...b, wedge }
  }
  const bonds = flipped.molecule.bonds.map(b => {
    if (b.id === bondA.id) return withWedge(b, bondB.wedge)
    if (b.id === bondB.id) return withWedge(b, bondA.wedge)
    return b
  })
  const result = { ...flipped.molecule, atoms, bonds }
  const target = originalChirality === 'R' ? 'S' : 'R'
  if (perceiveAtomChirality(result).get(atomId) !== target) return mol
  return reconcileAtomChirality(result)
}
/**
 * 存储配体序下的几何 parity，仅用于几何检查，不代表 CIP R/S。
 * 配体不足 4 个或有缺失返回 null。
 */
export function chiralityParity(mol: Molecule, atomId: string): 1 | -1 | 0 | null {
  const ligandIds = mol.bonds
    .filter(b => b.atomId1 === atomId || b.atomId2 === atomId)
    .map(b => (b.atomId1 === atomId ? b.atomId2 : b.atomId1))
  if (ligandIds.length !== 4) return null
  const ligands = ligandIds.map(id => mol.atoms.find(a => a.id === id))
  if (ligands.some(ligand => ligand === undefined)) return null
  return parityFromCoords(ligands as [Atom, Atom, Atom, Atom])
}

function withoutWedge(bond: Bond): Bond {
  if (bond.wedge === undefined) return bond
  const { wedge: _omitted, ...rest } = bond
  return rest
}

function withoutChirality(atom: Atom): Atom {
  if (atom.chirality === undefined) return atom
  const { chirality: _omitted, ...rest } = atom
  return rest
}

/**
 * 清除手性标记与中心连键的楔形；无事可做返回同一引用（'none' 语义）。
 */
export function clearChirality(mol: Molecule, atomId: string): Molecule {
  const center = mol.atoms.find(a => a.id === atomId)
  if (!center) return mol
  const needsAtom = center.chirality !== undefined
  const needsBonds = mol.bonds.some(
    b => b.atomId1 === atomId && b.wedge !== undefined,
  )
  if (!needsAtom && !needsBonds) return mol
  return {
    ...mol,
    atoms: needsAtom
      ? mol.atoms.map(a => (a.id === atomId ? withoutChirality(a) : a))
      : mol.atoms,
    bonds: needsBonds
      ? mol.bonds.map(b =>
          b.atomId1 === atomId ? withoutWedge(b) : b)
      : mol.bonds,
  }
}

/** Set absolute CIP configuration and confirm the resulting geometry before labeling it. */
export function setChirality(mol: Molecule, atomId: string, target: 'R' | 'S'): Molecule {
  if (flipChiralityAvailability(mol, atomId).ok === false) return mol
  const current = perceiveAtomChirality(mol).get(atomId)
  if (current === undefined) return mol
  const next = current === target ? mol : flipChirality(mol, atomId)
  if (perceiveAtomChirality(next).get(atomId) !== target) return mol
  if (next.atoms.some(atom => atom.id === atomId && atom.chirality === target)) return next
  return {
    ...next,
    atoms: next.atoms.map(atom => atom.id === atomId ? { ...atom, chirality: target } : atom),
  }
}
