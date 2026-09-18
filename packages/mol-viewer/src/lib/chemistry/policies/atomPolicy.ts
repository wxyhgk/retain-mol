import { ELEMENT_CONFIGS } from '../../../config/elements.config'
import type { Atom, Molecule } from '../../molecule'
import { maxValence, valenceUsed } from '../valence'

export type AtomRuleResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly reason: string }

export function validateElementSymbol(symbol: string): AtomRuleResult {
  return Object.hasOwn(ELEMENT_CONFIGS, symbol)
    ? { ok: true }
    : { ok: false, reason: `未知元素：${symbol}` }
}

export function validateAtomPosition(x: number, y: number, z: number): AtomRuleResult {
  return [x, y, z].every(Number.isFinite)
    ? { ok: true }
    : { ok: false, reason: '原子坐标必须是有限数值' }
}

export function validateAtomCreationInput(
  symbol: string,
  x: number,
  y: number,
  z: number,
): AtomRuleResult {
  const element = validateElementSymbol(symbol)
  if (element.ok === false) return element
  return validateAtomPosition(x, y, z)
}

export function getHydrogenAdditionAvailability(
  molecule: Molecule,
  atomId: string,
): AtomRuleResult {
  const atom = molecule.atoms.find(candidate => candidate.id === atomId)
  if (!atom) return { ok: false, reason: '原子不存在' }
  if (atom.symbol === 'H') return { ok: false, reason: 'H 不能继续加 H' }
  const max = maxValence(atom)
  if (max <= 0) return { ok: false, reason: '该元素不能成键' }
  if (valenceUsed(molecule, atomId) >= max) return { ok: false, reason: '已满键，无法加 H' }
  return { ok: true }
}

/**
 * 潜在手性中心：C/Si + 4 个各不相同的显式单键配体（非芳香）。
 * 只看拓扑；平面性另由翻转可用性判定。overlay 角标与翻转 op 共用此定义。
 *
 * “各不相同”按取代基子树签名判定（元素 + 键级 + 邻居，深度截断、环路去重），
 * 而非原子 id 不同：甲基/亚甲基（≥2 个 H 配体必相同）与叔丁基式对称中心
 * 不再误报。深度截断与环路标记偏向保守（宁可漏掉 ?，不错标 ?）；
 * 内消旋等全图自同构情形不在此判定范围内。
 */
const STEREO_SUBTREE_DEPTH = 4

/** 同一 molecule 对象内的判定缓存：overlay 逐帧调用，编辑产生新对象即失效。 */
const potentialCenterCache = new WeakMap<object, Map<string, boolean>>()

export function isPotentialStereoCenter(mol: Molecule, atomId: string): boolean {
  let perMolecule = potentialCenterCache.get(mol)
  if (!perMolecule) {
    perMolecule = new Map<string, boolean>()
    potentialCenterCache.set(mol, perMolecule)
  }
  const cached = perMolecule.get(atomId)
  if (cached !== undefined) return cached
  const result = computePotentialStereoCenter(mol, atomId)
  perMolecule.set(atomId, result)
  return result
}

function computePotentialStereoCenter(mol: Molecule, atomId: string): boolean {
  const center = mol.atoms.find(a => a.id === atomId)
  if (!center || (center.symbol !== 'C' && center.symbol !== 'Si')) return false
  const spokes = mol.bonds.filter(b => b.atomId1 === atomId || b.atomId2 === atomId)
  if (spokes.length !== 4 || spokes.some(b => b.order !== 1 || b.aromatic === true)) return false
  const ligands = spokes.map(b => (b.atomId1 === atomId ? b.atomId2 : b.atomId1))
  if (new Set(ligands).size !== 4) return false
  const atomsById = new Map(mol.atoms.map(a => [a.id, a]))
  if (!ligands.every(id => atomsById.has(id))) return false
  // ≥2 个 H 配体必相同（如甲基、亚甲基）：直接排除，快路径
  const hydrogenLigands = ligands.filter(id => atomsById.get(id)?.symbol === 'H').length
  if (hydrogenLigands >= 2) return false
  // 其余两两比子树签名：任一对相同即非手性中心
  const signatures = ligands.map(id => subtreeSignature(mol, atomsById, id, atomId, STEREO_SUBTREE_DEPTH, new Set([atomId])))
  return new Set(signatures).size === signatures.length
}

/**
 * 配体子树规范签名：元素符号 + 按序排列的（键级，邻居签名）。
 * parent 方向不回头；已在路径上的环原子记固定标记（不含剩余深度，
 * 偏向合并而非拆分）；超深截断同样记固定标记。
 */
function subtreeSignature(
  mol: Molecule,
  atomsById: Map<string, Atom>,
  atomId: string,
  parentId: string | null,
  depth: number,
  path: Set<string>,
): string {
  const atom = atomsById.get(atomId)
  if (!atom) return '?'
  if (depth <= 0) return `${atom.symbol}…`
  if (path.has(atomId)) return `${atom.symbol}↺`
  path.add(atomId)
  const children: string[] = []
  for (const bond of mol.bonds) {
    const neighbor = bond.atomId1 === atomId ? bond.atomId2 : bond.atomId2 === atomId ? bond.atomId1 : null
    if (neighbor === null || neighbor === parentId) continue
    const edge = `${bond.order}${bond.aromatic === true ? 'a' : ''}`
    children.push(`${edge}:${subtreeSignature(mol, atomsById, neighbor, atomId, depth - 1, path)}`)
  }
  path.delete(atomId)
  children.sort()
  return `${atom.symbol}(${children.join(',')})`
}
