import type { Molecule } from '@retainmol/mol-viewer/core'
import { describe, expect, it } from 'vitest'
import {
  canonicalizeMolecule,
  computeContentHash,
  computeTopologyFingerprint,
  stableCanonicalJson,
} from './canonicalize'

const molecule: Molecule = {
  name: 'formaldehyde',
  atoms: [
    { id: 'o1', symbol: 'O', x: 1.2, y: 0, z: 0, charge: 0 },
    { id: 'c1', symbol: 'C', x: 0, y: 0, z: 0 },
    { id: 'h2', symbol: 'H', x: -0.5, y: -0.9, z: 0 },
    { id: 'h1', symbol: 'H', x: -0.5, y: 0.9, z: 0 },
  ],
  bonds: [
    { id: 'ch2', atomId1: 'h2', atomId2: 'c1', order: 1 },
    { id: 'co', atomId1: 'o1', atomId2: 'c1', order: 2 },
    { id: 'ch1', atomId1: 'c1', atomId2: 'h1', order: 1 },
  ],
}

function reorder(input: Molecule): Molecule {
  return {
    ...input,
    atoms: [...input.atoms].reverse(),
    bonds: [...input.bonds].reverse().map(bond => ({
      ...bond,
      atomId1: bond.atomId2,
      atomId2: bond.atomId1,
    })),
  }
}

describe('stableCanonicalJson', () => {
  it('sorts object keys recursively while preserving array order', () => {
    expect(stableCanonicalJson({ z: 1, a: { d: 4, b: 2 }, list: [3, 1] }))
      .toBe('{"a":{"b":2,"d":4},"list":[3,1],"z":1}')
  })

  it('rejects non-finite numbers instead of hashing them as null', () => {
    expect(() => stableCanonicalJson({ coordinate: Number.NaN }))
      .toThrow('Canonical JSON only supports finite numbers')
  })
})

describe('molecule canonicalization', () => {
  it('is independent of atom order, bond order, and undirected bond endpoint order', () => {
    expect(canonicalizeMolecule(reorder(molecule))).toBe(canonicalizeMolecule(molecule))
  })

  it('produces a stable SHA-256 content hash', async () => {
    const original = await computeContentHash(molecule)
    const reordered = await computeContentHash(reorder(molecule))

    expect(original).toMatch(/^[a-f0-9]{64}$/)
    expect(reordered).toBe(original)
  })

  it('changes the content hash when coordinates change', async () => {
    const moved: Molecule = {
      ...molecule,
      atoms: molecule.atoms.map(atom => atom.id === 'o1' ? { ...atom, x: atom.x + 0.01 } : atom),
    }

    await expect(computeContentHash(moved)).resolves.not.toBe(await computeContentHash(molecule))
  })
})

describe('topology fingerprint', () => {
  it('is independent of order for molecules with the same stable atom ids', async () => {
    await expect(computeTopologyFingerprint(reorder(molecule)))
      .resolves.toBe(await computeTopologyFingerprint(molecule))
  })

  it('does not include coordinates but changes with bond topology', async () => {
    const moved: Molecule = {
      ...molecule,
      atoms: molecule.atoms.map(atom => ({ ...atom, x: atom.x + 100, y: atom.y - 50, z: 7 })),
    }
    const changedBond: Molecule = {
      ...molecule,
      bonds: molecule.bonds.map(bond => bond.id === 'co' ? { ...bond, order: 1 } : bond),
    }
    const original = await computeTopologyFingerprint(molecule)

    await expect(computeTopologyFingerprint(moved)).resolves.toBe(original)
    await expect(computeTopologyFingerprint(changedBond)).resolves.not.toBe(original)
  })
})
