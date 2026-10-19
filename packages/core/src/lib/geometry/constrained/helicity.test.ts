import { describe, expect, it } from 'vitest'
import type { Molecule, Vector3Data } from '../../model/types'
import { calcDihedral } from '../measure'
import { analyzeHelicalPath, measureLocalHelicalTurn } from './helicity'

function pathMolecule(points: readonly Vector3Data[]): Molecule {
  return {
    atoms: points.map((point, index) => ({ ...point, id: `a${index}`, symbol: 'C' })),
    bonds: points.slice(1).map((_, index) => ({
      id: `b${index}`, atomId1: `a${index}`, atomId2: `a${index + 1}`, order: 1,
    })),
  }
}

function helix(): Molecule {
  // Analytic coordinates generated here, never taken from a molecule database.
  return pathMolecule(Array.from({ length: 10 }, (_, index) => {
    const t = index * Math.PI / 3
    return { x: 2 * Math.cos(t), y: 2 * Math.sin(t), z: 0.4 * t }
  }))
}

function ids(molecule: Molecule): string[] {
  return molecule.atoms.map(atom => atom.id)
}

describe('analyzeHelicalPath', () => {
  it('assigns positive geometric turns to an analytic right-handed helix', () => {
    const molecule = helix()
    const result = analyzeHelicalPath(molecule, ids(molecule), 1)
    expect(result.status).toBe('right')
    expect(result.issues).toEqual([])
    expect(result.turnsDegrees).toHaveLength(molecule.atoms.length - 3)
    for (const turn of result.turnsDegrees) {
      expect(turn).toBeGreaterThan(1)
      expect(turn).toBeLessThan(90)
      expect(turn).toBeCloseTo(result.turnsDegrees[0]!, 10)
    }
    const [a, b, c, d] = molecule.atoms
    expect(result.turnsDegrees[0]).toBeCloseTo(-calcDihedral(a!, b!, c!, d!), 10)
  })

  it('preserves handedness when the entire ordered path is reversed', () => {
    const molecule = helix()
    const forward = analyzeHelicalPath(molecule, ids(molecule), 1)
    const reversed = analyzeHelicalPath(molecule, ids(molecule).reverse(), 1)
    expect(reversed.status).toBe('right')
    for (const [index, turn] of reversed.turnsDegrees.entries()) {
      expect(turn).toBeCloseTo(forward.turnsDegrees.at(-index - 1)!, 10)
    }
  })

  it('preserves turns under a proper rigid rotation and translation', () => {
    const molecule = helix()
    const transformed: Molecule = {
      ...molecule,
      // Cyclic permutation of axes has determinant +1.
      atoms: molecule.atoms.map(atom => ({ ...atom, x: atom.z + 10, y: atom.x - 7, z: atom.y + 3 })),
    }
    const before = analyzeHelicalPath(molecule, ids(molecule), 1)
    const after = analyzeHelicalPath(transformed, ids(molecule), 1)
    expect(after.status).toBe('right')
    after.turnsDegrees.forEach((turn, index) => expect(turn).toBeCloseTo(before.turnsDegrees[index]!, 10))
  })

  it('reverses handedness under reflection', () => {
    const molecule = helix()
    const reflected: Molecule = { ...molecule, atoms: molecule.atoms.map(atom => ({ ...atom, x: -atom.x })) }
    const before = analyzeHelicalPath(molecule, ids(molecule), 1)
    const after = analyzeHelicalPath(reflected, ids(molecule), 1)
    expect(after.status).toBe('left')
    after.turnsDegrees.forEach((turn, index) => expect(turn).toBeCloseTo(-before.turnsDegrees[index]!, 10))
  })

  it.each([0, 2])('treats either coplanar dihedral branch as zero twist (last x = %s)', lastX => {
    const molecule = pathMolecule([
      { x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 },
      { x: 1, y: 1, z: 0 }, { x: lastX, y: 1, z: 0 },
    ])
    const result = analyzeHelicalPath(molecule, ids(molecule), 1)
    expect(result.status).toBe('indeterminate')
    expect(result.turnsDegrees).toEqual([0])
    expect(result.issues).toEqual([])
  })

  it.each([-1e-4, 1e-4])('does not label almost-trans planar geometry helical (z = %s)', lastZ => {
    const molecule = pathMolecule([
      { x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 },
      { x: 1, y: 1, z: 0 }, { x: 2, y: 1, z: lastZ },
    ])
    const result = analyzeHelicalPath(molecule, ids(molecule), 1)
    expect(result.status).toBe('indeterminate')
    expect(Math.abs(result.turnsDegrees[0]!)).toBeLessThan(0.01)
  })

  it('reports opposing local turns rather than averaging them into a handedness', () => {
    const molecule = pathMolecule(Array.from({ length: 12 }, (_, index) => {
      const t = index * Math.PI / 3
      return { x: 2 * Math.cos(t), y: 2 * Math.sin(t), z: 0.4 * (index <= 5 ? index : 10 - index) }
    }))
    const result = analyzeHelicalPath(molecule, ids(molecule), 1)
    expect(result.status).toBe('mixed')
    expect(result.turnsDegrees.some(turn => turn !== null && turn > 1)).toBe(true)
    expect(result.turnsDegrees.some(turn => turn !== null && turn < -1)).toBe(true)
  })

  it('requires every window to meet the requested minimum twist', () => {
    const molecule = helix()
    expect(analyzeHelicalPath(molecule, ids(molecule), 89).status).toBe('indeterminate')
  })

  it('reports an undefined collinear window even when later windows are helical', () => {
    const molecule = helix()
    const second = molecule.atoms[1]!
    const third = molecule.atoms[2]!
    const modified: Molecule = {
      ...molecule,
      atoms: molecule.atoms.map((atom, index) => index !== 0 ? atom : {
        ...atom, x: 2 * second.x - third.x, y: 2 * second.y - third.y, z: 2 * second.z - third.z,
      }),
    }
    const result = analyzeHelicalPath(modified, ids(modified), 1)
    expect(result.status).toBe('indeterminate')
    expect(result.turnsDegrees[0]).toBeNull()
    expect(result.issues).toEqual([expect.objectContaining({
      code: 'degenerate-geometry', atomIds: ['a0', 'a1', 'a2', 'a3'],
    })])
  })

  it('reports coincident atoms without manufacturing a fallback normal', () => {
    const molecule = pathMolecule([
      { x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 },
      { x: 1, y: 0, z: 0 }, { x: 2, y: 1, z: 1 },
    ])
    const result = analyzeHelicalPath(molecule, ids(molecule), 1)
    expect(result.status).toBe('indeterminate')
    expect(result.turnsDegrees).toEqual([null])
    expect(result.issues[0]?.code).toBe('degenerate-geometry')
  })

  it.each([0, -1, 91, Number.NaN, Number.POSITIVE_INFINITY])('rejects invalid minimum twist %s', minimum => {
    const molecule = helix()
    const result = analyzeHelicalPath(molecule, ids(molecule), minimum)
    expect(result.status).toBe('invalid')
    expect(result.turnsDegrees).toEqual([])
    expect(result.issues[0]?.code).toBe('invalid-constraint')
  })

  it.each([
    ['too short', ['a0', 'a1', 'a2']],
    ['duplicate ID', ['a0', 'a1', 'a2', 'a1']],
    ['missing ID', ['a0', 'a1', 'a2', 'missing']],
    ['unbonded neighbors', ['a0', 'a2', 'a3', 'a4']],
  ])('rejects a path with %s', (_, path) => {
    const result = analyzeHelicalPath(helix(), path, 1)
    expect(result.status).toBe('invalid')
    expect(result.turnsDegrees).toEqual([])
  })

  it('rejects duplicate molecule atom IDs and nonfinite path coordinates', () => {
    const molecule = helix()
    const duplicate = { ...molecule, atoms: [...molecule.atoms, molecule.atoms[0]!] }
    expect(analyzeHelicalPath(duplicate, ids(molecule), 1).status).toBe('invalid')
    const nonfinite = { ...molecule, atoms: molecule.atoms.map((atom, index) => index ? atom : { ...atom, z: Infinity }) }
    const result = analyzeHelicalPath(nonfinite, ids(molecule), 1)
    expect(result.status).toBe('invalid')
    expect(result.issues.some(issue => issue.code === 'invalid-input')).toBe(true)
  })

  it('leaves graph metadata and coordinates unchanged', () => {
    const molecule = helix()
    const before = structuredClone(molecule)
    Object.freeze(molecule.atoms)
    Object.freeze(molecule.bonds)
    for (const atom of molecule.atoms) Object.freeze(atom)
    for (const bond of molecule.bonds) Object.freeze(bond)
    Object.freeze(molecule)
    analyzeHelicalPath(molecule, ids(molecule), 1)
    expect(molecule).toEqual(before)
  })
})

describe('measureLocalHelicalTurn', () => {
  it('uses a bounded signed departure from coplanarity instead of a raw near-180 dihedral', () => {
    const [a, b, c, d] = pathMolecule([
      { x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 },
      { x: 1, y: 1, z: 0 }, { x: 2, y: 1, z: 1 },
    ]).atoms
    expect(Math.abs(calcDihedral(a!, b!, c!, d!))).toBeCloseTo(135)
    expect(measureLocalHelicalTurn(a!, b!, c!, d!)).toBeCloseTo(45)
  })
})
