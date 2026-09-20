import { describe, expect, it } from 'vitest'
import type { Molecule } from '../molecule'
import { clearChirality, setChirality } from '../builder/editing/atomOps'
import { runReplaceAtomCommand } from '../builder/commands/atom'
import { exportMol, parseMol } from '../io/molFormat'
import { computeCanonicalMoleculeDigest } from '../modeling/effects/canonical'
import { compileExpectedEffect } from '../modeling/effects/compiler'
import { createHeadlessModelingContext } from '../modeling/headless'
import { dryRunEditPlan } from '../modeling/planExecutor'
import { reconcileAtomChirality } from './perception'

function tetrahedron(): Molecule {
  return {
    atoms: [
      { id: 'c', symbol: 'C', x: 0, y: 0, z: 0 },
      { id: 'f', symbol: 'F', x: 1, y: 1, z: 1 },
      { id: 'cl', symbol: 'Cl', x: -1, y: -1, z: 1 },
      { id: 'br', symbol: 'Br', x: -1, y: 1, z: -1 },
      { id: 'h', symbol: 'H', x: 1, y: -1, z: -1 },
    ],
    bonds: ['f', 'cl', 'br', 'h'].map(id => ({ id: `c-${id}`, atomId1: 'c', atomId2: id, order: 1 })),
  }
}

function label(mol: Molecule, chirality: 'R' | 'S'): Molecule {
  return { ...mol, atoms: mol.atoms.map(a => a.id === 'c' ? { ...a, chirality } : a) }
}

describe('stereochemistry correctness', () => {
  for (const target of ['R', 'S'] as const) {
    for (const reordered of ['original', 'swap-bonds', 'reverse-atoms']) {
      it(`sets actual CIP ${target} with reordered atoms/bonds=${reordered}`, () => {
        const input = tetrahedron()
        const mol = reordered === 'reverse-atoms' ? { ...input, atoms: [...input.atoms].reverse() }
          : reordered === 'swap-bonds' ? { ...input, bonds: [input.bonds[1]!, input.bonds[0]!, ...input.bonds.slice(2)] } : input
        const result = setChirality(mol, 'c', target)
        expect(result.atoms.find(a => a.id === 'c')?.chirality).toBe(target)
        const restored = parseMol(exportMol(result))
        expect(restored.atoms.find(a => a.symbol === 'C')?.chirality).toBe(target)
        for (const atom of result.atoms) {
          expect(restored.atoms.find(a => a.symbol === atom.symbol)).toMatchObject({ x: atom.x, y: atom.y, z: atom.z })
        }
      })
    }
  }

  it('clears a specified center after replacing a ligand by an identical substituent', () => {
    const result = runReplaceAtomCommand(label(tetrahedron(), 'S'), 'cl', 'F')
    expect(result.ok && result.changed).toBe(true)
    if (!result.ok || !result.changed) throw new Error('expected edit')
    expect(result.molecule.atoms.find(a => a.id === 'c')?.chirality).toBeUndefined()
  })

  it('recalculates a specified label when ligand priority changes without moving atoms', () => {
    const result = runReplaceAtomCommand(label(tetrahedron(), 'S'), 'cl', 'I')
    if (!result.ok || !result.changed) throw new Error('expected edit')
    const actual = parseMol(exportMol(result.molecule)).atoms.find(a => a.symbol === 'C')?.chirality
    expect(actual).toBe('R') // Br > Cl > F becomes I > Br > F: exchange the top two priorities.
    expect(result.molecule.atoms.find(a => a.id === 'c')?.chirality).toBe(actual)
  })

  it('does not label an unspecified center during ordinary edits', () => {
    const result = runReplaceAtomCommand(tetrahedron(), 'cl', 'I')
    if (!result.ok || !result.changed) throw new Error('expected edit')
    expect(result.molecule.atoms.every(a => a.chirality === undefined)).toBe(true)
  })

  it('clears flattened centers and their owned wedge without mutating the input', () => {
    const original = label(tetrahedron(), 'S')
    const input = { ...original, atoms: original.atoms.map(a => ({ ...a, z: 0 })) }
    const before = structuredClone(input)
    const result = reconcileAtomChirality(input)
    expect(result.atoms.find(a => a.id === 'c')?.chirality).toBeUndefined()
    expect(input).toEqual(before)
    const withWedge: Molecule = { ...original, bonds: original.bonds.map(b => ({ ...b, wedge: 'up' })) }
    const replaced = runReplaceAtomCommand(withWedge, 'cl', 'F')
    if (!replaced.ok || !replaced.changed) throw new Error('expected edit')
    expect(replaced.molecule.bonds.every(b => b.wedge === undefined)).toBe(true)
  })

  it('clearing a center leaves an incoming wedge owned by the adjacent atom intact', () => {
    const original = label(tetrahedron(), 'S')
    const mol: Molecule = { ...original, bonds: original.bonds.map((b, i) => i === 0
      ? { ...b, atomId1: 'f', atomId2: 'c', wedge: 'up' } : b) }
    expect(clearChirality(mol, 'c').bonds[0]?.wedge).toBe('up')
  })

  it('independent ExpectedEffect and headless execution both record invalidated chirality', () => {
    const molecule = label(tetrahedron(), 'S')
    const context = createHeadlessModelingContext(molecule)
    const plan = {
      schemaVersion: 1 as const, source: 'ai' as const, planId: 'replace-stereo-ligand',
      targetObjectId: context.activeObjectId!,
      commands: [{ commandId: 'make-symmetric', kind: 'atom.replace' as const, atomId: 'cl', symbol: 'F' }],
    }
    const expected = compileExpectedEffect(molecule, plan)
    const actual = dryRunEditPlan(context, plan)
    if (expected.status !== 'compiled' || !actual.ok) throw new Error('expected successful execution')
    expect(expected.commands[0]?.changes.atoms).toContainEqual(expect.objectContaining({
      id: 'c', before: expect.objectContaining({ chirality: 'S' }), after: expect.objectContaining({ chirality: null }),
    }))
    expect(computeCanonicalMoleculeDigest(actual.molecule)).toBe(expected.finalDigest)
  })

  it('includes atom chirality, wedge direction/apex, and E/Z in canonical digests', () => {
    const mol = tetrahedron()
    const digest = computeCanonicalMoleculeDigest
    expect(digest(label(mol, 'R'))).not.toBe(digest(label(mol, 'S')))
    const up: Molecule = { ...mol, bonds: mol.bonds.map((b, i) => i === 0 ? { ...b, wedge: 'up' } : b) }
    const down: Molecule = { ...up, bonds: up.bonds.map((b, i) => i === 0 ? { ...b, wedge: 'down' } : b) }
    const reversed: Molecule = { ...up, bonds: up.bonds.map((b, i) => i === 0 ? { ...b, atomId1: b.atomId2, atomId2: b.atomId1 } : b) }
    expect(digest(up)).not.toBe(digest(down))
    expect(digest(up)).not.toBe(digest(reversed))
    expect(digest({ ...mol, bonds: mol.bonds.map(b => ({ ...b, order: 2, ez: 'E' })) })).not.toBe(
      digest({ ...mol, bonds: mol.bonds.map(b => ({ ...b, order: 2, ez: 'Z' })) }),
    )
  })
})
