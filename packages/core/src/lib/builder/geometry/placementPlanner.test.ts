import { describe, expect, it } from 'vitest'
import { newAtom } from '../../molecule'
import { planMoleculePlacement, scoreMoleculePlacement } from './placementPlanner'

describe('planMoleculePlacement', () => {
  it('keeps placement unchanged when there are no base atoms', () => {
    const placed = newAtom('C', 0, 0, 0)
    const molecule = { atoms: [placed], bonds: [] }

    const plan = planMoleculePlacement([], molecule)

    expect(plan.molecule).toBe(molecule)
    expect(plan.offset).toEqual({ x: 0, y: 0, z: 0 })
    expect(plan.score.overlapPenalty).toBe(0)
  })

  it('keeps placement unchanged when clash avoidance is disabled', () => {
    const existing = newAtom('C', 0, 0, 0)
    const placed = newAtom('C', 0, 0, 0)
    const molecule = { atoms: [placed], bonds: [] }

    const plan = planMoleculePlacement([existing], molecule, { avoidClashes: false })

    expect(plan.molecule).toBe(molecule)
    expect(plan.offset).toEqual({ x: 0, y: 0, z: 0 })
    expect(plan.score.overlapPenalty).toBeGreaterThan(0)
  })

  it('nudges overlapping placement in the placement plane', () => {
    const existing = newAtom('C', 0, 0, 0)
    const placed = newAtom('C', 0, 0, 0)
    const molecule = { atoms: [placed], bonds: [] }

    const plan = planMoleculePlacement([existing], molecule, {
      orientation: { x: 0, y: 0, z: 1 },
    })

    expect(plan.molecule).not.toBe(molecule)
    expect(Math.hypot(plan.offset.x, plan.offset.y, plan.offset.z)).toBeGreaterThan(0)
    expect(plan.offset.z).toBeCloseTo(0)
    expect(plan.score.overlapPenalty).toBe(0)
  })

  it('scores molecule placement with excluded host atoms', () => {
    const host = newAtom('C', 0, 0, 0)
    const blocker = newAtom('C', 0, 0, 0)
    const placed = newAtom('C', 0, 0, 0)
    const molecule = { atoms: [placed], bonds: [] }

    const blocked = scoreMoleculePlacement([host, blocker], molecule)
    const hostExcluded = scoreMoleculePlacement([host, blocker], molecule, {
      excludeAtomIds: new Set([host.id]),
    })

    expect(blocked.overlapPenalty).toBeGreaterThan(hostExcluded.overlapPenalty)
    expect(hostExcluded.overlapPenalty).toBeGreaterThan(0)
  })
})
