import type { Molecule } from '../../molecule'
import { findBond } from '../graph'
import { reachableWithout } from '../editing/bondOps'

export type BondLengthHandle = 'left' | 'center' | 'right'

export interface BondLengthEditPlan {
  readonly atomId1: string
  readonly atomId2: string
  readonly initialLength: number
  readonly axis: Readonly<{ x: number; y: number; z: number }>
  readonly leftAtomIds: ReadonlySet<string>
  readonly rightAtomIds: ReadonlySet<string>
  readonly initialPositions: ReadonlyMap<string, Readonly<{ x: number; y: number; z: number }>>
}

export type BondLengthPlanResult =
  | { readonly ok: true; readonly plan: BondLengthEditPlan }
  | { readonly ok: false; readonly reason: string; readonly constrained?: boolean }

export function createBondLengthEditPlan(
  molecule: Molecule,
  atomId1: string,
  atomId2: string,
): BondLengthPlanResult {
  if (atomId1 === atomId2) return { ok: false, reason: '请选择两个不同的原子' }
  const atom1 = molecule.atoms.find(atom => atom.id === atomId1)
  const atom2 = molecule.atoms.find(atom => atom.id === atomId2)
  if (!atom1 || !atom2) return { ok: false, reason: '所选原子不存在' }

  const bond = findBond(molecule.bonds, atomId1, atomId2)
  if (!bond) return { ok: false, reason: '两个原子之间尚未成键' }

  const leftAtomIds = reachableWithout(molecule.bonds, bond.id, atomId1)
  const rightAtomIds = reachableWithout(molecule.bonds, bond.id, atomId2)
  if (leftAtomIds.has(atomId2) || rightAtomIds.has(atomId1)) {
    return { ok: false, reason: '环内键受约束，暂不支持直接拖动', constrained: true }
  }

  const dx = atom2.x - atom1.x
  const dy = atom2.y - atom1.y
  const dz = atom2.z - atom1.z
  const initialLength = Math.hypot(dx, dy, dz)
  if (initialLength < 1e-6) return { ok: false, reason: '两个原子重合，无法确定键轴' }

  return {
    ok: true,
    plan: {
      atomId1,
      atomId2,
      initialLength,
      axis: { x: dx / initialLength, y: dy / initialLength, z: dz / initialLength },
      leftAtomIds,
      rightAtomIds,
      initialPositions: new Map(molecule.atoms.map(atom => [
        atom.id,
        { x: atom.x, y: atom.y, z: atom.z },
      ])),
    },
  }
}

export function createBondLengthPositions(
  plan: BondLengthEditPlan,
  targetLength: number,
  handle: BondLengthHandle,
): ReadonlyMap<string, { x: number; y: number; z: number }> {
  const safeTarget = Math.max(0.1, Math.min(10, targetLength))
  const delta = safeTarget - plan.initialLength
  const leftScale = handle === 'left' ? -delta : handle === 'center' ? -delta / 2 : 0
  const rightScale = handle === 'right' ? delta : handle === 'center' ? delta / 2 : 0
  const positions = new Map<string, { x: number; y: number; z: number }>()

  appendTranslatedPositions(positions, plan, plan.leftAtomIds, leftScale)
  appendTranslatedPositions(positions, plan, plan.rightAtomIds, rightScale)
  return positions
}

function appendTranslatedPositions(
  positions: Map<string, { x: number; y: number; z: number }>,
  plan: BondLengthEditPlan,
  atomIds: ReadonlySet<string>,
  scale: number,
) {
  if (Math.abs(scale) < 1e-12) return
  for (const atomId of atomIds) {
    const initial = plan.initialPositions.get(atomId)
    if (!initial) continue
    positions.set(atomId, {
      x: initial.x + plan.axis.x * scale,
      y: initial.y + plan.axis.y * scale,
      z: initial.z + plan.axis.z * scale,
    })
  }
}
