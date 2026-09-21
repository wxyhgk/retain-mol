import { describe, expect, it } from 'vitest'
import type { Atom, Molecule } from '../../model/types'
import { checkPreservedStereoGeometry } from './stereochemistry'

function tetrahedron(): Molecule {
  return {
    atoms: [
      { id: 'c', symbol: 'C', x: 0, y: 0, z: 0, chirality: 'S' },
      { id: 'f', symbol: 'F', x: 1, y: 1, z: 1 },
      { id: 'cl', symbol: 'Cl', x: -1, y: -1, z: 1 },
      { id: 'br', symbol: 'Br', x: -1, y: 1, z: -1 },
      { id: 'h', symbol: 'H', x: 1, y: -1, z: -1 },
    ],
    bonds: ['f', 'cl', 'br', 'h'].map(id => ({ id: `c-${id}`, atomId1: 'c', atomId2: id, order: 1 })),
  }
}

function alkene(): Molecule {
  return {
    atoms: [
      { id: 'a', symbol: 'C', x: 0, y: 0, z: 0 },
      { id: 'b', symbol: 'C', x: 1.4, y: 0, z: 0 },
      { id: 'f', symbol: 'F', x: 0, y: 1, z: 0 },
      { id: 'cl', symbol: 'Cl', x: 1.4, y: 1, z: 0 },
    ],
    bonds: [
      { id: 'ab', atomId1: 'a', atomId2: 'b', order: 2, ez: 'Z' },
      { id: 'af', atomId1: 'a', atomId2: 'f', order: 1 },
      { id: 'bcl', atomId1: 'b', atomId2: 'cl', order: 1 },
    ],
  }
}

function mapAtoms(molecule: Molecule, transform: (atom: Atom) => Atom): Molecule {
  return { ...molecule, atoms: molecule.atoms.map(transform) }
}

const rotateAndTranslate = (atom: Atom): Atom => ({ ...atom, x: atom.z + 6, y: atom.x - 3, z: atom.y + 10 })

describe('checkPreservedStereoGeometry: authored tetrahedral centers', () => {
  it('rejects a mirrored coordinate candidate that retains the original R/S annotation', () => {
    const molecule = tetrahedron()
    const mirrored = mapAtoms(molecule, atom => ({ ...atom, x: -atom.x }))
    expect(mirrored.atoms[0]?.chirality).toBe(molecule.atoms[0]?.chirality)
    expect(checkPreservedStereoGeometry(molecule, mirrored)).toEqual([
      expect.objectContaining({ code: 'stereochemistry-violation', atomIds: ['c', 'br', 'cl', 'f', 'h'] }),
    ])
  })

  it('accepts proper rigid motion and storage reordering', () => {
    const molecule = tetrahedron()
    const transformed = mapAtoms(molecule, rotateAndTranslate)
    expect(checkPreservedStereoGeometry(molecule, {
      ...transformed, atoms: [...transformed.atoms].reverse(), bonds: [...transformed.bonds].reverse(),
    })).toEqual([])
  })

  it('handles three explicit neighbors with an implicit fourth ligand', () => {
    const original: Molecule = {
      atoms: [
        { id: 'c', symbol: 'C', x: 0, y: 0, z: 0, chirality: 'R' },
        { id: 'f', symbol: 'F', x: 1, y: 0, z: 0 },
        { id: 'cl', symbol: 'Cl', x: 0, y: 1, z: 0 },
        { id: 'br', symbol: 'Br', x: 0, y: 0, z: 1 },
      ],
      bonds: ['f', 'cl', 'br'].map(id => ({ id: `c-${id}`, atomId1: 'c', atomId2: id, order: 1 })),
    }
    expect(checkPreservedStereoGeometry(original, mapAtoms(original, rotateAndTranslate))).toEqual([])
    expect(checkPreservedStereoGeometry(original, mapAtoms(original, atom => ({ ...atom, z: -atom.z })))).toHaveLength(1)
  })

  it('rejects planar or nearly planar marked centers including unchanged invalid input', () => {
    for (const scale of [0, 1e-9]) {
      const planar = mapAtoms(tetrahedron(), atom => ({ ...atom, z: atom.z * scale }))
      expect(checkPreservedStereoGeometry(planar, planar)).toHaveLength(1)
      expect(checkPreservedStereoGeometry(tetrahedron(), planar)).toHaveLength(1)
    }
  })

  it('rejects missing or coincident ligands and changed annotations', () => {
    const molecule = tetrahedron()
    expect(checkPreservedStereoGeometry(molecule, {
      ...molecule, atoms: molecule.atoms.filter(atom => atom.id !== 'f'),
    })).toHaveLength(1)
    expect(checkPreservedStereoGeometry(molecule, mapAtoms(molecule, atom => atom.id === 'f'
      ? { ...atom, x: 1, y: -1, z: -1 } : atom))).toHaveLength(1)
    expect(checkPreservedStereoGeometry(molecule, mapAtoms(molecule, atom => atom.id === 'c'
      ? { ...atom, chirality: 'R' } : atom))).toHaveLength(1)
  })

  it('rejects a marked center with unsupported ligand count', () => {
    const molecule = tetrahedron()
    const insufficient = { ...molecule, bonds: molecule.bonds.slice(0, 2) }
    expect(checkPreservedStereoGeometry(insufficient, insufficient)).toHaveLength(1)
  })
})

describe('checkPreservedStereoGeometry: authored E/Z bonds', () => {
  it('accepts rigid motion and reflection, which preserve alkene same-side orientation', () => {
    const molecule = alkene()
    expect(checkPreservedStereoGeometry(molecule, mapAtoms(molecule, rotateAndTranslate))).toEqual([])
    expect(checkPreservedStereoGeometry(molecule, mapAtoms(molecule, atom => ({ ...atom, y: -atom.y })))).toEqual([])
  })

  it('rejects swapping one substituent to the opposite side', () => {
    const molecule = alkene()
    const flipped = mapAtoms(molecule, atom => atom.id === 'cl' ? { ...atom, y: -1 } : atom)
    expect(checkPreservedStereoGeometry(molecule, flipped)).toHaveLength(1)
  })

  it.each([20, 89, 90])('rejects indeterminate nonplanar E/Z geometry twisted %s degrees', degrees => {
    const molecule = alkene()
    const radians = degrees * Math.PI / 180
    const twisted = mapAtoms(molecule, atom => atom.id === 'cl'
      ? { ...atom, y: Math.cos(radians), z: Math.sin(radians) } : atom)
    expect(checkPreservedStereoGeometry(molecule, twisted)).toHaveLength(1)
    expect(checkPreservedStereoGeometry(twisted, twisted)).toHaveLength(1)
  })

  it('accepts small out-of-plane numerical distortion within the documented 15-degree bound', () => {
    const molecule = alkene()
    const radians = 14 * Math.PI / 180
    const tilted = mapAtoms(molecule, atom => atom.id === 'cl'
      ? { ...atom, y: Math.cos(radians), z: Math.sin(radians) } : atom)
    expect(checkPreservedStereoGeometry(molecule, tilted)).toEqual([])
  })

  it('rejects collinear and coincident substituent frames that atan2(0,0) could mislabel', () => {
    const molecule = alkene()
    for (const x of [1.4, 2.4]) {
      const invalid = mapAtoms(molecule, atom => atom.id === 'cl' ? { ...atom, x, y: 0, z: 0 } : atom)
      expect(checkPreservedStereoGeometry(molecule, invalid)).toHaveLength(1)
      expect(checkPreservedStereoGeometry(invalid, invalid)).toHaveLength(1)
    }
  })

  it('checks every explicit substituent instead of only the first one stored', () => {
    const base = alkene()
    const molecule: Molecule = {
      ...base,
      atoms: [...base.atoms, { id: 'z-h', symbol: 'H', x: 1.4, y: -1, z: 0 }],
      bonds: [...base.bonds, { id: 'bh', atomId1: 'b', atomId2: 'z-h', order: 1 }],
    }
    expect(checkPreservedStereoGeometry(molecule, molecule)).toEqual([])
    const twisted = mapAtoms(molecule, atom => atom.id === 'z-h' ? { ...atom, y: 0, z: -1 } : atom)
    expect(checkPreservedStereoGeometry(molecule, twisted)).toHaveLength(1)
  })

  it('rejects missing substituents, invalid marked bond types and altered annotations', () => {
    const molecule = alkene()
    const missing = { ...molecule, bonds: molecule.bonds.filter(bond => bond.id !== 'bcl') }
    expect(checkPreservedStereoGeometry(missing, missing)).toHaveLength(1)
    const single = { ...molecule, bonds: molecule.bonds.map(bond => ({ ...bond, order: 1 as const })) }
    expect(checkPreservedStereoGeometry(single, single)).toHaveLength(1)
    const changed = { ...molecule, bonds: molecule.bonds.map(bond => bond.ez ? { ...bond, ez: 'E' as const } : bond) }
    expect(checkPreservedStereoGeometry(molecule, changed)).toHaveLength(1)
  })
})
