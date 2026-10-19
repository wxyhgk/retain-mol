import { describe, expect, it } from 'vitest'
import type { Molecule } from '../../../molecule'
import type { FragmentDef } from '../../fragment/model'
import { planBridgeRingBetweenBonds } from './bridgeRingTopology'

function sevenMemberedRing(): FragmentDef {
  return {
    id: 'cycloheptane-topology',
    name: 'Cycloheptane topology',
    short: 'C7',
    formula: 'C7H14',
    atoms: Array.from({ length: 7 }, (_, index) => ({
      symbol: 'C',
      x: Math.cos(index * 2 * Math.PI / 7),
      y: Math.sin(index * 2 * Math.PI / 7),
      z: 0,
    })),
    bonds: Array.from({ length: 7 }, (_, index) => ({
      a: index,
      b: (index + 1) % 7,
      order: 1 as const,
    })),
    attachIndex: 0,
    attachHIndex: -1,
    attachDirection: [1, 0, 0],
    attachBond: [0, 1],
    group: 'ring',
  }
}

function twoAromaticEdges(): Molecule {
  const atoms = [
    { id: 'a1', symbol: 'C', x: 0, y: 0, z: 0 },
    { id: 'a2', symbol: 'C', x: 1.4, y: 0, z: 0 },
    { id: 'a-out-1', symbol: 'C', x: -1, y: 0, z: 0 },
    { id: 'a-out-2', symbol: 'C', x: 2.4, y: 0, z: 0 },
    { id: 'b1', symbol: 'C', x: 10, y: 10, z: 10 },
    { id: 'b2', symbol: 'C', x: 11.4, y: 10, z: 10 },
    { id: 'b-out-1', symbol: 'C', x: 9, y: 10, z: 10 },
    { id: 'b-out-2', symbol: 'C', x: 12.4, y: 10, z: 10 },
    { id: 'ha1', symbol: 'H', x: 0, y: 1, z: 0 },
    { id: 'ha2', symbol: 'H', x: 1.4, y: 1, z: 0 },
    { id: 'hb1', symbol: 'H', x: 10, y: 11, z: 10 },
    { id: 'hb2', symbol: 'H', x: 11.4, y: 11, z: 10 },
  ]
  return {
    atoms,
    bonds: [
      { id: 'left', atomId1: 'a1', atomId2: 'a2', order: 1, aromatic: true },
      { id: 'left-out-1', atomId1: 'a1', atomId2: 'a-out-1', order: 1, aromatic: true },
      { id: 'left-out-2', atomId1: 'a2', atomId2: 'a-out-2', order: 1, aromatic: true },
      { id: 'right', atomId1: 'b1', atomId2: 'b2', order: 1, aromatic: true },
      { id: 'right-out-1', atomId1: 'b1', atomId2: 'b-out-1', order: 1, aromatic: true },
      { id: 'right-out-2', atomId1: 'b2', atomId2: 'b-out-2', order: 1, aromatic: true },
      { id: 'ha1-bond', atomId1: 'a1', atomId2: 'ha1', order: 1 },
      { id: 'ha2-bond', atomId1: 'a2', atomId2: 'ha2', order: 1 },
      { id: 'hb1-bond', atomId1: 'b1', atomId2: 'hb1', order: 1 },
      { id: 'hb2-bond', atomId1: 'b2', atomId2: 'hb2', order: 1 },
    ],
  }
}

const input = {
  targetBondIds: ['left', 'right'] as const,
  fragment: sevenMemberedRing(),
  templateBondPairs: [[0, 1], [3, 4]] as const,
}

describe('planBridgeRingBetweenBonds', () => {
  it('plans a seven-membered ring by reusing four host atoms and adding three heavy atoms', () => {
    const result = planBridgeRingBetweenBonds(twoAromaticEdges(), input)

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.candidates.length).toBeGreaterThan(0)
    expect(result.candidates.length).toBeLessThanOrEqual(4)
    for (const candidate of result.candidates) {
      expect(candidate.templateAtomToExistingAtomId.size).toBe(4)
      expect(candidate.newHeavyAtomTemplateIndices).toHaveLength(3)
      expect(candidate.atomSpecs).toHaveLength(3)
      expect(candidate.bondSpecs).toHaveLength(5)
      expect(candidate.removeAtomIds).toEqual(['ha1', 'ha2', 'hb1', 'hb2'])
    }
  })

  it('produces the same topology candidates when only host coordinates change', () => {
    const molecule = twoAromaticEdges()
    const transformed: Molecule = {
      ...molecule,
      atoms: molecule.atoms.map((atom, index) => ({
        ...atom,
        x: 1000 - atom.x * 37 + index,
        y: -400 + atom.y * 19,
        z: index % 2 === 0 ? 25 : -25,
      })),
    }

    const first = planBridgeRingBetweenBonds(molecule, input)
    const second = planBridgeRingBetweenBonds(transformed, input)
    expect(first.ok).toBe(true)
    expect(second.ok).toBe(true)
    if (!first.ok || !second.ok) return
    expect(first.candidates.map(candidate => candidate.key)).toEqual(
      second.candidates.map(candidate => candidate.key),
    )
  })

  it('rejects selecting the same target bond twice', () => {
    const result = planBridgeRingBetweenBonds(twoAromaticEdges(), {
      ...input,
      targetBondIds: ['left', 'left'],
    })
    expect(result).toMatchObject({ ok: false, code: 'same-target-bond' })
  })

  it('rejects target bonds that share an atom', () => {
    const molecule = twoAromaticEdges()
    const result = planBridgeRingBetweenBonds(molecule, {
      ...input,
      targetBondIds: ['left', 'left-out-1'],
    })
    expect(result).toMatchObject({ ok: false, code: 'target-bonds-share-atom' })
  })

  it('rejects a template that is not a simple seven-membered heavy-atom cycle', () => {
    const fragment = sevenMemberedRing()
    fragment.bonds = fragment.bonds.slice(0, 6)
    const result = planBridgeRingBetweenBonds(twoAromaticEdges(), { ...input, fragment })
    expect(result).toMatchObject({ ok: false, code: 'template-not-seven-cycle' })
  })
})
