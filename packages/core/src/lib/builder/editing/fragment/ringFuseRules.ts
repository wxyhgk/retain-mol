import type { Atom, Bond, Molecule } from '../../../molecule'
import type { FragmentDef } from '../../fragmentLibrary'
import { hNeighborsOf } from '../../../graph/queries'
import { maxValence, valenceUsed } from '../../valence'

export type RingFuseTargetResult =
  | {
      readonly ok: true
      readonly bond: Bond
      readonly targetAtom1: Atom
      readonly targetAtom2: Atom
    }
  | {
      readonly ok: false
      readonly reason: string
    }

export function resolveRingFuseTarget(molecule: Molecule, bondId: string): RingFuseTargetResult {
  const bond = molecule.bonds.find(candidate => candidate.id === bondId)
  if (!bond) return { ok: false, reason: '键不存在' }
  const targetAtom1 = molecule.atoms.find(atom => atom.id === bond.atomId1)
  const targetAtom2 = molecule.atoms.find(atom => atom.id === bond.atomId2)
  if (!targetAtom1 || !targetAtom2) return { ok: false, reason: '键不存在' }
  if (targetAtom1.symbol === 'H' || targetAtom2.symbol === 'H') {
    return { ok: false, reason: '不能在 X-H 键上并环' }
  }
  return { ok: true, bond, targetAtom1, targetAtom2 }
}

export function buildRingFuseSkipSet(
  fragment: FragmentDef,
  f1i: number,
  f2i: number,
  isHydrogenIndex: (index: number) => boolean,
): Set<number> {
  const skip = new Set<number>([f1i, f2i])
  for (const bond of fragment.bonds) {
    if (bond.a === f1i || bond.a === f2i) {
      if (isHydrogenIndex(bond.b)) skip.add(bond.b)
    } else if (bond.b === f1i || bond.b === f2i) {
      if (isHydrogenIndex(bond.a)) skip.add(bond.a)
    }
  }
  return skip
}

/**
 * 共享原子键价预检：删一个 H、加一条新环键之后不得超过 maxValence。
 * 新增键级默认按 1（下界）估计；调用方应传入按凯库勒相位候选算出的
 * 实际最小新增键级（ringFuseMinAddedOrders），不要假设恒为 +1。
 * 这是快速失败 + 友好报错；完整防线是 remapAndMergeBonds 的最终键级和校验。
 */
export function validateRingFuseSharedValence(
  molecule: Molecule,
  targetAtoms: readonly Atom[],
  addedOrderByAtomId?: ReadonlyMap<string, number>,
): string | null {
  for (const atom of targetAtoms) {
    const removableHydrogen = hNeighborsOf(molecule, atom.id).length > 0 ? 1 : 0
    const addedOrder = addedOrderByAtomId?.get(atom.id) ?? 1
    const finalValence = valenceUsed(molecule, atom.id) - removableHydrogen + addedOrder
    if (finalValence > maxValence(atom) + 1e-8) {
      return `${atom.symbol} 已饱和，无法并环`
    }
  }
  return null
}
