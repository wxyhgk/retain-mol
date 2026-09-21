/**
 * builder/queries — 分子查询纯函数层
 *
 * 把 useBuilder / useCanvasPointerRouter 里重复的
 * "拾取 atom → activateObjectContainingAtom → 重读 state → getConnectedFragment"
 * 序列，以及零散的无状态分子谓词（isSlotH / canGrowFrom）抽成脱离组件的纯函数。
 *
 * 风格参考同目录 focused builder modules / analysis。这些函数不订阅 React、不持有闭包状态；
 * 需要 store 的部分以显式参数（getState 快照 / activate 回调）传入，保持可测试。
 */

import type { Molecule } from '../molecule'
import { degree } from '../graph/queries'
import { getConnectedFragment } from '../graph/components'
import { maxValence } from './valence'

/**
 * 是否是"槽位 H"：带键的 H 原子。
 * 价态完整模型下它就是可生长/成键的槽位。
 */
export function isSlotH(mol: Molecule, atomId: string): boolean {
  const atom = mol.atoms.find(a => a.id === atomId)
  return !!atom && atom.symbol === 'H' && degree(mol.bonds, atomId) > 0
}

/**
 * 未饱和重原子（导入骨架等）是否还能长出新键：
 * 非 H 且当前连接数 < 有效最大键数。
 */
export function canGrowFrom(mol: Molecule, atomId: string): boolean {
  const atom = mol.atoms.find(a => a.id === atomId)
  if (!atom || atom.symbol === 'H') return false
  return degree(mol.bonds, atomId) < maxValence(atom)
}

/**
 * 激活包含 atomId 的宿主对象，激活后重读 store，解析出活跃分子及该原子所在连通片段。
 *
 * 以显式回调/取值函数传入 store 交互，保持本层纯净、可测：
 *  - activate: 尝试激活宿主对象（不可见/锁定时返回 false → 整个手势应中止）
 *  - getActiveMolecule: 激活后重读，返回当前活跃分子（可能为空/undefined）
 *
 * 返回 null 表示激活失败或无有效活跃分子，调用方应中止。
 */
export function activateAndResolve(
  atomId: string,
  activate: (atomId: string) => boolean,
  getActiveMolecule: () => Molecule | undefined,
): { mol: Molecule; fragment: Set<string> } | null {
  if (!activate(atomId)) return null
  const mol = getActiveMolecule()   // 激活是同步 set，重新读取
  if (!mol) return null
  const fragment = getConnectedFragment(mol.atoms, mol.bonds, atomId)
  return { mol, fragment }
}
