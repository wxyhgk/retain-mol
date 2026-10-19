import { describe, expect, it } from 'vitest'
import { Molecule as OCLMolecule, Resources } from 'openchemlib'
import type { Molecule } from '../molecule'
import { clearChirality, flipChirality, setChirality } from '../builder/editing/atomOps'
import { generate3D, parseMol } from '../io/molFormat'
import { getAtomChiralityState } from './atomChiralityState'

const tetrahedron: Molecule = {
  atoms: [
    { id: 'c', symbol: 'C', x: 0, y: 0, z: 0 },
    { id: 'f', symbol: 'F', x: 1, y: 1, z: 1 },
    { id: 'cl', symbol: 'Cl', x: -1, y: -1, z: 1 },
    { id: 'br', symbol: 'Br', x: -1, y: 1, z: -1 },
    { id: 'h', symbol: 'H', x: 1, y: -1, z: -1 },
  ],
  bonds: ['f', 'cl', 'br', 'h'].map(id => ({ id: `c-${id}`, atomId1: 'c', atomId2: id, order: 1 })),
}

describe('getAtomChiralityState', () => {
  it('reads geometry without specifying or mutating the molecule', () => {
    const before = structuredClone(tetrahedron)
    expect(getAtomChiralityState(tetrahedron, 'c')).toEqual({ specified: null, computed: 'S' })
    expect(tetrahedron).toEqual(before)
    expect(getAtomChiralityState(tetrahedron, 'h')).toEqual({ specified: null, computed: null })
    expect(getAtomChiralityState(tetrahedron, 'missing')).toEqual({ specified: null, computed: null })
  })

  it('clearing a specified center preserves its current geometric configuration', () => {
    const specified = setChirality(tetrahedron, 'c', 'R')
    expect(getAtomChiralityState(specified, 'c')).toEqual({ specified: 'R', computed: 'R' })
    const cleared = clearChirality(specified, 'c')
    expect(getAtomChiralityState(cleared, 'c')).toEqual({ specified: null, computed: 'R' })
    expect(cleared.atoms.map(({ x, y, z }) => [x, y, z])).toEqual(specified.atoms.map(({ x, y, z }) => [x, y, z]))
  })

  it('refreshes after a flip without turning an unspecified center into a specified one', () => {
    getAtomChiralityState(tetrahedron, 'c')
    const flipped = flipChirality(tetrahedron, 'c')
    expect(getAtomChiralityState(flipped, 'c')).toEqual({ specified: null, computed: 'R' })
    expect(getAtomChiralityState(tetrahedron, 'c')).toEqual({ specified: null, computed: 'S' })
  })

  it('does not retain inferred labels after flattening or making ligands identical', () => {
    getAtomChiralityState(tetrahedron, 'c')
    const flat = { ...tetrahedron, atoms: tetrahedron.atoms.map(a => ({ ...a, z: 0 })) }
    const symmetric = { ...tetrahedron, atoms: tetrahedron.atoms.map(a => a.id === 'cl' ? { ...a, symbol: 'F' } : a) }
    expect(getAtomChiralityState(flat, 'c').computed).toBeNull()
    expect(getAtomChiralityState(symmetric, 'c').computed).toBeNull()
  })

  it('does not use an authored annotation as evidence for the current configuration', () => {
    const inconsistent: Molecule = { ...tetrahedron, atoms: tetrahedron.atoms.map(a => a.id === 'c' ? { ...a, chirality: 'R' } : a) }
    expect(getAtomChiralityState(inconsistent, 'c')).toEqual({ specified: 'R', computed: 'S' })
  })

  it('shows a generated CC(F)(Br)I conformer while retaining unspecified input stereo', () => {
    Resources.registerFromNodejs()
    const input = parseMol(OCLMolecule.fromSmiles('CC(F)(Br)I').toMolfile())
    const result = generate3D(input)
    expect(result.ok).toBe(true)
    const states = result.molecule.atoms.map(a => getAtomChiralityState(result.molecule, a.id))
    expect(states.filter(s => s.computed !== null)).toHaveLength(1)
    expect(states.every(s => s.specified === null)).toBe(true)
    expect(result.molecule.atoms.every(a => a.chirality === undefined)).toBe(true)
  })
})
