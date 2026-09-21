import type { ConstrainedGeometryRequest, Molecule } from '@retainmol/mol-viewer/headless'

/** Procedural heavy-atom geometry test, not a validated cyclohexane conformer. */
export const ringFixture: Molecule = {
  name: '程序生成六碳闭环 · 几何测试骨架',
  atoms: Array.from({ length: 6 }, (_, index) => ({
    id: `constraint-ring-${index}`, symbol: 'C',
    x: 1.5 * Math.cos(index * Math.PI / 3),
    y: 1.5 * Math.sin(index * Math.PI / 3), z: 0,
  })),
  bonds: Array.from({ length: 6 }, (_, index) => ({
    id: `constraint-edge-${index}`, atomId1: `constraint-ring-${index}`,
    atomId2: `constraint-ring-${(index + 1) % 6}`, order: 1,
  })),
}

export type ConstraintScenario = 'ring' | 'locked'
export const anchorAtomId = ringFixture.atoms[0]!.id
export const targetAtomId = ringFixture.atoms[3]!.id

export function ringRequest(scenario: ConstraintScenario, lift: number): ConstrainedGeometryRequest {
  const target = ringFixture.atoms[3]!
  return {
    constraints: [{ id: 'lift-c4', kind: 'position', strength: 'hard', atomId: target.id,
      target: { x: target.x, y: target.y, z: lift }, tolerance: 0.03 }],
    movableAtomIds: scenario === 'locked' ? [] : ringFixture.atoms.slice(1).map(atom => atom.id),
    bondLengthTolerance: 0.03, angleToleranceDegrees: 10,
    nonbondedMinimumDistance: 0.8,
  }
}

export function bondLengthDelta(before: Molecule, after: Molecule): number {
  const first = new Map(before.atoms.map(atom => [atom.id, atom]))
  const second = new Map(after.atoms.map(atom => [atom.id, atom]))
  let maximum = 0
  for (const bond of before.bonds) {
    const a = first.get(bond.atomId1)!, b = first.get(bond.atomId2)!
    const c = second.get(bond.atomId1)!, d = second.get(bond.atomId2)!
    maximum = Math.max(maximum, Math.abs(Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z)
      - Math.hypot(c.x - d.x, c.y - d.y, c.z - d.z)))
  }
  return maximum
}

export function atomLabel(id: string): string {
  const index = ringFixture.atoms.findIndex(atom => atom.id === id)
  return index >= 0 ? `C${index + 1}` : id
}
