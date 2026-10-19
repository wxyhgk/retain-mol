import { describe, expect, it } from 'vitest'
import { newAtom, newBond, type Molecule } from '../../molecule'
import { GraphIndex } from './GraphIndex'

describe('GraphIndex', () => {
  it('indexes atoms, bonds, neighbors and first pair bond', () => {
    const c = newAtom('C')
    const h1 = newAtom('H')
    const h2 = newAtom('H')
    const b1 = newBond(c.id, h1.id)
    const b2 = newBond(c.id, h2.id)
    const mol: Molecule = { atoms: [c, h1, h2], bonds: [b1, b2] }

    const graph = new GraphIndex(mol)

    expect(graph.atom(c.id)).toBe(c)
    expect(graph.bond(b1.id)).toBe(b1)
    expect(graph.degree(c.id)).toBe(2)
    expect(graph.bondsOf(c.id)).toEqual([b1, b2])
    expect(graph.findBond(h1.id, c.id)).toBe(b1)
    expect(graph.neighborsOf(c.id).map(a => a.id)).toEqual([h1.id, h2.id])
    expect(graph.hNeighborsOf(c.id).map(a => a.id)).toEqual([h1.id, h2.id])
  })

  it('distinguishes first H parent from all bridge H parents', () => {
    const b1 = newAtom('B')
    const b2 = newAtom('B')
    const h = newAtom('H')
    const hb1 = newBond(h.id, b1.id)
    const hb2 = newBond(h.id, b2.id)
    const graph = new GraphIndex({ atoms: [b1, b2, h], bonds: [hb1, hb2] })

    expect(graph.isSlotHydrogen(h.id)).toBe(true)
    expect(graph.hParentOf(h.id)?.parent.id).toBe(b1.id)
    expect(graph.hParentsOf(h.id).map(p => p.parent.id)).toEqual([b1.id, b2.id])
  })
})
