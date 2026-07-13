import type { Molecule } from '../molecule'

function fnv1a(input: string): string {
  let hash = 0x811c9dc5
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

/** Deterministic, non-cryptographic revision used for optimistic concurrency. */
export function computeMoleculeRevision(molecule: Molecule): string {
  const serialized = JSON.stringify({
    name: molecule.name ?? null,
    atoms: molecule.atoms,
    bonds: molecule.bonds,
  })
  return `mol-v1-${molecule.atoms.length}-${molecule.bonds.length}-${fnv1a(serialized)}`
}

