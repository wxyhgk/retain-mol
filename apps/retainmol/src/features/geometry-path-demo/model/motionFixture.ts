import type { ConstrainedGeometryRequest, Molecule } from '@/domain/viewer/geometryPath'

export type MotionScenario = 'crossing' | 'safe'
/** Deliberately long geometric segments, not chemically meaningful C-C lengths. */
export const motionFixture: Molecule = {
  name: '线性运动测试 · 两条几何线段',
  atoms: [
    { id: 'motion-x-left', symbol: 'C', x: -2, y: 0, z: 0 },
    { id: 'motion-x-right', symbol: 'C', x: 2, y: 0, z: 0 },
    { id: 'motion-y-bottom', symbol: 'C', x: 0, y: -2, z: 1 },
    { id: 'motion-y-top', symbol: 'C', x: 0, y: 2, z: 1 },
  ],
  bonds: [
    { id: 'motion-x-edge', atomId1: 'motion-x-left', atomId2: 'motion-x-right', order: 1 },
    { id: 'motion-y-edge', atomId1: 'motion-y-bottom', atomId2: 'motion-y-top', order: 1 },
  ],
}
export const movingAtomIds = motionFixture.atoms.slice(2).map(atom => atom.id)
export function motionTarget(before: Molecule, scenario: MotionScenario): Molecule {
  return { ...before, atoms: before.atoms.map(atom => movingAtomIds.includes(atom.id)
    ? { ...atom, z: scenario === 'crossing' ? -1 : 2 } : atom) }
}
export function motionRequest(before: Molecule, scenario: MotionScenario): ConstrainedGeometryRequest {
  const target = motionTarget(before, scenario)
  return {
    movableAtomIds: movingAtomIds,
    constraints: target.atoms.filter(atom => movingAtomIds.includes(atom.id)).map(atom => ({
      id: `target-${atom.id}`, kind: 'position', strength: 'hard', atomId: atom.id,
      target: { x: atom.x, y: atom.y, z: atom.z }, tolerance: 0.000001,
    })),
    motion: {},
  }
}
export function interpolateMotion(before: Molecule, after: Molecule, progress: number): Molecule {
  const targets = new Map(after.atoms.map(atom => [atom.id, atom]))
  return { ...before, atoms: before.atoms.map(atom => {
    const target = targets.get(atom.id)!
    return { ...atom, x: atom.x + (target.x - atom.x) * progress,
      y: atom.y + (target.y - atom.y) * progress, z: atom.z + (target.z - atom.z) * progress }
  }) }
}
