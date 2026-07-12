import { describe, expect, it } from 'vitest'
import type { Molecule } from '../../molecule'
import { createBondLengthEditPlan, createBondLengthPositions } from './bondLengthHandle'

function chain(): Molecule {
  return {
    atoms: [
      { id: 'a', symbol: 'C', x: -1, y: 0, z: 0 },
      { id: 'b', symbol: 'C', x: 0, y: 0, z: 0 },
      { id: 'c', symbol: 'C', x: 1, y: 0, z: 0 },
      { id: 'd', symbol: 'C', x: 2, y: 0, z: 0 },
    ],
    bonds: [
      { id: 'ab', atomId1: 'a', atomId2: 'b', order: 1 },
      { id: 'bc', atomId1: 'b', atomId2: 'c', order: 1 },
      { id: 'cd', atomId1: 'c', atomId2: 'd', order: 1 },
    ],
  }
}

describe('bond length handle geometry', () => {
  it('moves the complete left fragment while keeping the right fragment fixed', () => {
    const result = createBondLengthEditPlan(chain(), 'b', 'c')
    expect(result.ok).toBe(true)
    if (!result.ok) return

    const positions = createBondLengthPositions(result.plan, 2, 'left')
    expect(positions.get('a')?.x).toBe(-2)
    expect(positions.get('b')?.x).toBe(-1)
    expect(positions.has('c')).toBe(false)
    expect(positions.has('d')).toBe(false)
  })

  it('moves the complete right fragment while keeping the left fragment fixed', () => {
    const result = createBondLengthEditPlan(chain(), 'b', 'c')
    if (result.ok === false) throw new Error(result.reason)

    const positions = createBondLengthPositions(result.plan, 2, 'right')
    expect(positions.has('a')).toBe(false)
    expect(positions.has('b')).toBe(false)
    expect(positions.get('c')?.x).toBe(2)
    expect(positions.get('d')?.x).toBe(3)
  })

  it('moves both fragments symmetrically from the bond midpoint', () => {
    const result = createBondLengthEditPlan(chain(), 'b', 'c')
    if (result.ok === false) throw new Error(result.reason)

    const positions = createBondLengthPositions(result.plan, 2, 'center')
    expect(positions.get('b')?.x).toBe(-0.5)
    expect(positions.get('c')?.x).toBe(1.5)
    expect(positions.get('a')?.x).toBe(-1.5)
    expect(positions.get('d')?.x).toBe(2.5)
  })

  it('rejects ring bonds instead of distorting the ring', () => {
    const molecule: Molecule = {
      atoms: [
        { id: 'a', symbol: 'C', x: 0, y: 0, z: 0 },
        { id: 'b', symbol: 'C', x: 1, y: 0, z: 0 },
        { id: 'c', symbol: 'C', x: 0.5, y: 1, z: 0 },
      ],
      bonds: [
        { id: 'ab', atomId1: 'a', atomId2: 'b', order: 1 },
        { id: 'bc', atomId1: 'b', atomId2: 'c', order: 1 },
        { id: 'ca', atomId1: 'c', atomId2: 'a', order: 1 },
      ],
    }

    expect(createBondLengthEditPlan(molecule, 'a', 'b')).toMatchObject({
      ok: false,
      constrained: true,
    })
  })
})
