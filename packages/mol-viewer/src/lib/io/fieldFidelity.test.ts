import { describe, expect, it } from 'vitest'
import { Molecule as OCLMolecule } from 'openchemlib'
import { exportMol, exportSdf, parseMol, parseSdf } from './molFormat'
import { exportMoleculeJson, parseMoleculeJson } from './moleculeJson'
import { parseMolecule } from '../moleculeValidation'
import type { Molecule } from '../types'
import { runCopySelectionCommand, runPasteAtomsCommand } from '../builder/commands/clipboard'
import { replaceAtomSymbol, growByReplacingH } from '../builder/editing/atomOps'
import { computeCanonicalMoleculeDigest } from '../modeling/effects/canonical'
import { getAtomChiralityState } from '../stereo/atomChiralityState'

const decorated: Molecule = {
  name: 'field fidelity',
  atoms: [
    { id: 'h', symbol: 'H', isotope: 2, x: 0, y: 1, z: -2 },
    { id: 'n', symbol: 'N', charge: 1, x: 1.4, y: 1, z: -2 },
    { id: 'c', symbol: 'C', isotope: 13, radical: 1, label: '连接位点', x: 4, y: 3, z: 1 },
    { id: 'o', symbol: 'O', charge: -1, x: 8, y: -1, z: 0 },
  ],
  bonds: [{ id: 'nh', atomId1: 'n', atomId2: 'h', order: 1 }],
}

describe('native molecule validation and fidelity', () => {
  it('round-trips IDs, every authored field and unknown JSON data without sharing references', () => {
    const molecule = { ...decorated, notes: { source: ['host'] } }
    const copy = parseMolecule(molecule)
    expect(copy).toEqual(molecule)
    expect(copy.atoms[0]).not.toBe(molecule.atoms[0])
    expect(parseMoleculeJson(exportMoleculeJson(copy))).toEqual(molecule)
    molecule.notes.source.push('changed')
    expect((copy as typeof molecule).notes.source).toEqual(['host'])
  })

  it.each([
    { ...decorated, atoms: [...decorated.atoms, decorated.atoms[0]] },
    { ...decorated, bonds: [{ ...decorated.bonds[0], atomId2: 'absent' }] },
    { ...decorated, bonds: [{ ...decorated.bonds[0], atomId2: 'n' }] },
    { ...decorated, atoms: [{ ...decorated.atoms[0], x: NaN }] },
    { ...decorated, atoms: [{ ...decorated.atoms[0], isotope: 1.5 }] },
    { ...decorated, atoms: [{ ...decorated.atoms[0], chirality: 'unknown' }] },
    { ...decorated, atoms: [{ ...decorated.atoms[0], charge: 0.5 }] },
    { ...decorated, bonds: [{ ...decorated.bonds[0], aromatic: 'yes' }] },
    { ...decorated, bonds: [...decorated.bonds, { ...decorated.bonds[0], id: 'duplicate' }] },
    { ...decorated, notes: () => 1 },
  ])('rejects invalid fields or graph references', value => {
    expect(() => parseMolecule(value)).toThrow(TypeError)
  })

  it('rejects cycles, unsupported JSON versions and missing envelopes', () => {
    const value = { ...decorated, loop: {} }
    value.loop = value
    expect(() => parseMolecule(value)).toThrow(/cyclic/)
    expect(() => parseMoleculeJson(JSON.stringify({ schemaVersion: 2, molecule: decorated }))).toThrow(/schemaVersion/)
    expect(() => parseMoleculeJson(JSON.stringify(decorated))).toThrow(/schemaVersion/)
  })

  it('includes isotope identity in edit effect digests', () => {
    const different = { ...decorated, atoms: decorated.atoms.map(a => a.id === 'c' ? { ...a, isotope: 14 } : a) }
    expect(computeCanonicalMoleculeDigest(different)).not.toBe(computeCanonicalMoleculeDigest(decorated))
  })
})

describe('MOL and SDF field fidelity', () => {
  it('retains stereogenic isotope identity through MOL and CIP perception', () => {
    const source = parseMol(OCLMolecule.fromSmiles('[C@]([2H])([H])(F)Cl').toMolfile())
    const center = source.atoms.find(a => a.symbol === 'C')!
    expect(['R', 'S']).toContain(center.chirality)
    expect(getAtomChiralityState(source, center.id).computed).toBe(center.chirality)
    const result = parseMol(exportMol(source))
    expect(result.atoms.find(a => a.symbol === 'C')?.chirality).toBe(center.chirality)
    expect(result.atoms.some(a => a.symbol === 'H' && a.isotope === 2)).toBe(true)
  })
  it.each(['MOL', 'SDF'])('preserves charge, radicals, isotope, label and coordinates through %s', format => {
    const file = format === 'MOL' ? exportMol(decorated) : exportSdf(decorated)
    expect(file).toContain('M  CHG')
    expect(file).toContain('M  ISO')
    expect(file).toContain('M  RAD')
    const result = format === 'MOL' ? parseMol(file) : parseSdf(file)[0]
    expect(result.atoms).toHaveLength(decorated.atoms.length)
    for (const atom of decorated.atoms) {
      const actual = result.atoms.find(a => a.symbol === atom.symbol)!
      expect(actual).toMatchObject({ ...atom, id: actual.id })
      expect(actual.id).not.toBe(atom.id)
    }
    const bond = result.bonds[0]
    expect(result.atoms.find(a => a.id === bond.atomId1)?.symbol).toBe('N')
    expect(result.atoms.find(a => a.id === bond.atomId2)?.symbol).toBe('H')
  })

  it('reads externally authored V3000 charge, radical and mass fields', () => {
    const molecule = parseMol(`external
  RetainMol

  0  0  0     0  0            999 V3000
M  V30 BEGIN CTAB
M  V30 COUNTS 2 1 0 0 0
M  V30 BEGIN ATOM
M  V30 1 C 0 0 0 0 MASS=13 RAD=2
M  V30 2 N 1.4 0 0 0 CHG=1
M  V30 END ATOM
M  V30 BEGIN BOND
M  V30 1 1 1 2
M  V30 END BOND
M  V30 END CTAB
M  END`)
    expect(molecule.atoms[0]).toMatchObject({ symbol: 'C', isotope: 13, radical: 1 })
    expect(molecule.atoms[1]).toMatchObject({ symbol: 'N', charge: 1 })
  })

  it('preserves aromaticity when all authored aromatic bonds use order one', () => {
    const parsed = parseMol(OCLMolecule.fromSmiles('c1ccccc1').toMolfile())
    const source = { ...parsed, bonds: parsed.bonds.map(b => ({ ...b, order: 1 as const, aromatic: true })) }
    const result = parseMol(exportMol(source))
    expect(result.bonds).toHaveLength(6)
    expect(result.bonds.every(b => b.aromatic)).toBe(true)
  })

  it('rejects unrepresentable radicals and unknown elements instead of changing them', () => {
    expect(() => exportMol({ atoms: [{ id: 'x', symbol: 'Xx', x: 0, y: 0, z: 0 }], bonds: [] })).toThrow(/元素/)
    expect(() => exportMol({ atoms: [{ ...decorated.atoms[2], radical: 3 }], bonds: [] })).toThrow(/自由基/)
    const singlet = new OCLMolecule(1, 0)
    const index = singlet.addAtom(6)
    singlet.setAtomRadical(index, OCLMolecule.cAtomRadicalStateS)
    expect(() => parseMol(singlet.toMolfile())).toThrow(/singlet/)
  })
})

describe('clipboard and element replacement', () => {
  it('remaps IDs and directed bond endpoints while retaining labels and stereo fields', () => {
    const source: Molecule = {
      ...decorated,
      atoms: decorated.atoms.map(a => a.id === 'c' ? { ...a, chirality: 'R' } : a),
      bonds: [
        { ...decorated.bonds[0], wedge: 'down' },
        { id: 'co', atomId1: 'c', atomId2: 'o', order: 2, ez: 'E' },
      ],
    }
    const clipboard = runCopySelectionCommand(source, new Set(source.atoms.map(a => a.id))).clipboard!
    const result = runPasteAtomsCommand({ atoms: [], bonds: [] }, clipboard, 3)
    expect(result.ok && result.changed).toBe(true)
    if (!result.ok || !result.changed) return
    source.atoms.forEach((a, i) => {
      expect(result.molecule.atoms[i]).toEqual({ ...a, id: result.newAtomIds[i], x: a.x + 3 })
      expect(result.newAtomIds).not.toContain(a.id)
    })
    expect(result.molecule.bonds[0]).toMatchObject({ atomId1: result.newAtomIds[1], atomId2: result.newAtomIds[0], wedge: 'down' })
    expect(result.molecule.bonds[1]).toMatchObject({ order: 2, ez: 'E' })
    expect(parseMoleculeJson(exportMoleculeJson(result.molecule))).toEqual(result.molecule)
  })

  it('clears the old element isotope on element replacement and H growth', () => {
    expect(replaceAtomSymbol(decorated, 'c', 'N').atoms.find(a => a.id === 'c')?.isotope).toBeUndefined()
    expect(growByReplacingH(decorated, 'h', 'C').atoms.find(a => a.id === 'h')?.isotope).toBeUndefined()
    expect(replaceAtomSymbol(decorated, 'c', 'C')).toBe(decorated)
  })
})
