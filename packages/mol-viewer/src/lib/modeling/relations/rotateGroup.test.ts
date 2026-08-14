import { describe, expect, it } from 'vitest'
import type { Atom, Molecule } from '../../molecule'
import type { RotateGroupCommand } from './contracts'
import { compileRotateGroupRelation, verifyRotateGroupRelation } from './index'

function atom(id: string, x: number, y: number, z: number): Atom {
  return { id, symbol: 'C', x, y, z }
}

function acyclicMolecule(): Molecule {
  return {
    name: 'acyclic',
    atoms: [
      atom('a', -1, 0, 0),
      atom('b', 0, 0, 0),
      atom('c', 1, 0, 0),
      atom('d', 1, 1, 0),
      atom('e', 2, 1, 1),
    ],
    bonds: [
      { id: 'ab', atomId1: 'a', atomId2: 'b', order: 1 },
      { id: 'bc', atomId1: 'b', atomId2: 'c', order: 1 },
      { id: 'cd', atomId1: 'c', atomId2: 'd', order: 1 },
      { id: 'de', atomId1: 'd', atomId2: 'e', order: 1 },
    ],
  }
}

function rotateCommand(atomIds: readonly string[] = ['d', 'e'], angleDegrees = 90): RotateGroupCommand {
  return {
    commandId: 'rotate-bc',
    kind: 'geometry.rotateGroup',
    atomIds,
    axisAtomId1: 'b',
    axisAtomId2: 'c',
    angleDegrees,
  }
}

function rotateMovingSide(before: Molecule, angleDegrees: number): Molecule {
  const angle = angleDegrees * Math.PI / 180
  const cosine = Math.cos(angle)
  const sine = Math.sin(angle)
  const moving = new Set(['c', 'd', 'e'])
  return {
    ...before,
    atoms: before.atoms.map(current => moving.has(current.id)
      ? {
          ...current,
          y: current.y * cosine - current.z * sine,
          z: current.y * sine + current.z * cosine,
        }
      : current),
  }
}

describe('rotateGroup spatial relation', () => {
  it('compiles a complete moving component and passes an independent positive 90 degree rotation', () => {
    const before = acyclicMolecule()
    const command = rotateCommand()
    const compiled = compileRotateGroupRelation(before, command)

    expect(compiled).toEqual({
      verdict: 'pass',
      relation: {
        kind: 'rotate-group',
        commandId: 'rotate-bc',
        angleDegrees: 90,
        axisAtomIds: ['b', 'c'],
        fixedAxisAtomId: 'b',
        movingAxisAtomId: 'c',
        fixedAtomIds: ['a', 'b'],
        movingAtomIds: ['c', 'd', 'e'],
        radialAtomId: 'e',
      },
    })
    expect(verifyRotateGroupRelation(before, rotateMovingSide(before, 90), command).verdict).toBe('pass')
  })

  it('rejects an improper mirror even though moving-side distances are preserved', () => {
    const before = acyclicMolecule()
    const mirrored: Molecule = {
      ...before,
      atoms: before.atoms.map(current => ['c', 'd', 'e'].includes(current.id)
        ? { ...current, z: -current.z }
        : current),
    }

    expect(verifyRotateGroupRelation(before, mirrored, rotateCommand()).verdict).toBe('reject')
  })

  it.each([
    ['wrong magnitude', 45],
    ['wrong direction', -90],
  ])('rejects %s', (_label, actualAngle) => {
    const before = acyclicMolecule()
    expect(
      verifyRotateGroupRelation(before, rotateMovingSide(before, actualAngle), rotateCommand()).verdict,
    ).toBe('reject')
  })

  it('rejects a ring axis because deleting the bond does not disconnect its endpoints', () => {
    const before = acyclicMolecule()
    const ring: Molecule = {
      ...before,
      bonds: [
        ...before.bonds,
        { id: 'bd', atomId1: 'b', atomId2: 'd', order: 1 },
      ],
    }

    const result = compileRotateGroupRelation(ring, rotateCommand())
    expect(result.verdict).toBe('reject')
    if (result.verdict !== 'pass') expect(result.diagnostic.code).toBe('axis-not-bridge')
  })

  it('rejects an aromatic axis even when its numeric order is one', () => {
    const before = acyclicMolecule()
    const aromaticAxis: Molecule = {
      ...before,
      bonds: before.bonds.map(bond => bond.id === 'bc'
        ? { ...bond, aromatic: true }
        : bond),
    }

    const result = compileRotateGroupRelation(aromaticAxis, rotateCommand())
    expect(result.verdict).toBe('reject')
    if (result.verdict !== 'pass') expect(result.diagnostic.code).toBe('axis-not-single-bond')
  })

  it('rejects a strict subset of the moving component', () => {
    const result = compileRotateGroupRelation(acyclicMolecule(), rotateCommand(['d']))
    expect(result.verdict).toBe('reject')
    if (result.verdict !== 'pass') expect(result.diagnostic.code).toBe('moving-side-incomplete')
  })

  it('rejects an after-state where only a subset of the complete moving side rotates', () => {
    const before = acyclicMolecule()
    const rotated = rotateMovingSide(before, 90)
    const originalE = before.atoms.find(current => current.id === 'e')!
    const after: Molecule = {
      ...rotated,
      atoms: rotated.atoms.map(current => current.id === 'e' ? originalE : current),
    }

    expect(verifyRotateGroupRelation(before, after, rotateCommand()).verdict).toBe('reject')
  })

  it('rejects movement on the fixed side', () => {
    const before = acyclicMolecule()
    const rotated = rotateMovingSide(before, 90)
    const after: Molecule = {
      ...rotated,
      atoms: rotated.atoms.map(current => current.id === 'a'
        ? { ...current, y: current.y + 0.25 }
        : current),
    }

    const result = verifyRotateGroupRelation(before, after, rotateCommand())
    expect(result.verdict).toBe('reject')
    if (result.verdict !== 'pass') expect(result.diagnostic.code).toBe('fixed-side-moved')
  })

  it('returns indeterminate when the complete moving side is all collinear with the axis', () => {
    const before: Molecule = {
      ...acyclicMolecule(),
      atoms: [
        atom('a', -1, 0, 0),
        atom('b', 0, 0, 0),
        atom('c', 1, 0, 0),
        atom('d', 2, 0, 0),
        atom('e', 3, 0, 0),
      ],
    }

    const result = compileRotateGroupRelation(before, rotateCommand())
    expect(result.verdict).toBe('indeterminate')
    if (result.verdict !== 'pass') expect(result.diagnostic.code).toBe('no-radial-witness')
  })

  it('preserves command-axis polarity when rotating the first-side component', () => {
    const before: Molecule = {
      name: 'first-side',
      atoms: [
        atom('a', 0, 1, 0),
        atom('b', 0, 0, 0),
        atom('c', 1, 0, 0),
        atom('d', 2, 1, 0),
        atom('e', 3, 1, 1),
      ],
      bonds: [
        { id: 'ab', atomId1: 'a', atomId2: 'b', order: 1 },
        { id: 'bc', atomId1: 'b', atomId2: 'c', order: 1 },
        { id: 'cd', atomId1: 'c', atomId2: 'd', order: 1 },
        { id: 'de', atomId1: 'd', atomId2: 'e', order: 1 },
      ],
    }
    const command = rotateCommand(['a'])
    const after: Molecule = {
      ...before,
      atoms: before.atoms.map(current => current.id === 'a'
        ? { ...current, y: 0, z: 1 }
        : current),
    }

    const compiled = compileRotateGroupRelation(before, command)
    expect(compiled.verdict).toBe('pass')
    if (compiled.verdict === 'pass') {
      expect(compiled.relation.axisAtomIds).toEqual(['b', 'c'])
      expect(compiled.relation.fixedAxisAtomId).toBe('c')
      expect(compiled.relation.movingAxisAtomId).toBe('b')
    }
    expect(verifyRotateGroupRelation(before, after, command).verdict).toBe('pass')
  })

  it('is translation invariant for fixed-side coordinate checks', () => {
    const offset = 1e12
    const before = acyclicMolecule()
    const translated: Molecule = {
      ...before,
      atoms: before.atoms.map(current => ({ ...current, x: current.x + offset })),
    }
    const after = rotateMovingSide(translated, 90)
    const drifted: Molecule = {
      ...after,
      atoms: after.atoms.map(current => current.id === 'a'
        ? { ...current, y: current.y + 1 }
        : current),
    }

    expect(verifyRotateGroupRelation(translated, drifted, rotateCommand()).verdict).toBe('reject')
  })

  it('uses a translation-invariant local scale for very large moving groups', () => {
    const radius = 1e12
    const before: Molecule = {
      name: 'large-local-radius',
      atoms: [
        atom('a', -1, 0, 0),
        atom('b', 0, 0, 0),
        atom('c', 1, 0, 0),
        atom('d', 1, radius, 0),
        atom('e', 2, radius, radius),
      ],
      bonds: acyclicMolecule().bonds,
    }

    expect(verifyRotateGroupRelation(before, rotateMovingSide(before, 90), rotateCommand()).verdict).toBe('pass')
  })

  it('rejects a visible axial translation hidden inside a very large rotation radius', () => {
    const radius = 1e12
    const before: Molecule = {
      name: 'large-local-radius-tamper',
      atoms: [
        atom('a', -1, 0, 0),
        atom('b', 0, 0, 0),
        atom('c', 1, 0, 0),
        atom('d', 1, radius, 0),
        atom('e', 2, radius, radius),
      ],
      bonds: acyclicMolecule().bonds,
    }
    const rotated = rotateMovingSide(before, 90)
    const tampered: Molecule = {
      ...rotated,
      atoms: rotated.atoms.map(current => ['d', 'e'].includes(current.id)
        ? { ...current, x: current.x + 0.5 }
        : current),
    }

    const result = verifyRotateGroupRelation(before, tampered, rotateCommand())
    expect(result.verdict).toBe('reject')
    if (result.verdict !== 'pass') expect(result.diagnostic.code).toBe('rotation-mismatch')
  })

  it('abstains when coordinates exceed the declared floating-point envelope', () => {
    const before: Molecule = {
      ...acyclicMolecule(),
      atoms: acyclicMolecule().atoms.map(current => current.id === 'e'
        ? { ...current, z: 3e12 }
        : current),
    }

    const result = compileRotateGroupRelation(before, rotateCommand())
    expect(result.verdict).toBe('indeterminate')
    if (result.verdict !== 'pass') expect(result.diagnostic.code).toBe('numeric-uncertainty')
  })

  it('rejects angles outside the plan schema periodic range', () => {
    const result = compileRotateGroupRelation(acyclicMolecule(), rotateCommand(['d', 'e'], 361))
    expect(result.verdict).toBe('reject')
    if (result.verdict !== 'pass') expect(result.diagnostic.code).toBe('invalid-command')
  })
})
