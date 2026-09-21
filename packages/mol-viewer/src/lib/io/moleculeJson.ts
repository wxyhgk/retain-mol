import type { Molecule } from '../types'
import { parseMolecule } from '../moleculeValidation'

/** Lossless native JSON for the current Molecule shape, including stable IDs. */
export function exportMoleculeJson(molecule: Molecule): string {
  return JSON.stringify({ schemaVersion: 1, molecule: parseMolecule(molecule) }, null, 2)
}

/** Parse native JSON. A versioned envelope is required; unknown versions fail explicitly. */
export function parseMoleculeJson(text: string): Molecule {
  const value: unknown = JSON.parse(text)
  if (!value || typeof value !== 'object' || !('schemaVersion' in value) || value.schemaVersion !== 1) {
    throw new TypeError('Unsupported molecule JSON schemaVersion')
  }
  if (!('molecule' in value)) throw new TypeError('Missing molecule JSON payload')
  return parseMolecule(value.molecule)
}
