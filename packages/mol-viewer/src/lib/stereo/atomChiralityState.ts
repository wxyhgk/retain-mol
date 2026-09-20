import type { Molecule } from '../molecule'
import { perceiveAtomChirality } from './perception'

/** Authored stereochemistry and the independently perceived current configuration. */
export interface AtomChiralityState {
  readonly specified: 'R' | 'S' | null
  /** CIP from coordinates / 2D wedges; null when unavailable or not stereogenic. */
  readonly computed: 'R' | 'S' | null
}

const empty: AtomChiralityState = Object.freeze({ specified: null, computed: null })
const cache = new WeakMap<Molecule, ReadonlyMap<string, AtomChiralityState>>()

/**
 * Read-only: perceiving a conformer never specifies its stereochemistry.
 * Cached per immutable Molecule snapshot so overlays can read this every frame.
 * A missing atom returns both fields as null. Edits must use a new snapshot.
 */
export function getAtomChiralityState(molecule: Molecule, atomId: string): AtomChiralityState {
  let states = cache.get(molecule)
  if (!states) {
    const perceived = perceiveAtomChirality(molecule)
    states = new Map(molecule.atoms.map(atom => [atom.id, Object.freeze({
      specified: atom.chirality ?? null,
      computed: perceived.get(atom.id) ?? null,
    })]))
    cache.set(molecule, states)
  }
  return states.get(atomId) ?? empty
}
