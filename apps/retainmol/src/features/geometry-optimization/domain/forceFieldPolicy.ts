import type { Molecule } from '@retainmol/mol-viewer/core'

export type FastForceField = 'MMFF94' | 'UFF'

const MMFF94_ELEMENTS = new Set([
  'H', 'C', 'N', 'O', 'F', 'Si', 'P', 'S', 'Cl', 'Br', 'I',
])

const MMFF94_INTERACTIVE_ATOM_LIMIT = 80

export function selectFastForceField(molecule: Molecule): FastForceField {
  const supportsMmff = molecule.atoms.length < MMFF94_INTERACTIVE_ATOM_LIMIT
    && molecule.atoms.every(atom => MMFF94_ELEMENTS.has(atom.symbol))
  return supportsMmff ? 'MMFF94' : 'UFF'
}
