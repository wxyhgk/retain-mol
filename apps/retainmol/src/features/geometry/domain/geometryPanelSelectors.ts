import type { Atom, Bond, Molecule } from '@retainmol/mol-viewer/core'
import {
  calculateMolecularWeight,
  getMolecularFormula,
} from '@retainmol/mol-viewer/core'

export interface MoleculeSummary {
  readonly formula: string
  readonly molecularWeight: number | null
}

export interface GeometrySelection {
  readonly atomById: Map<string, Atom>
  readonly selectedAtoms: Atom[]
  readonly selectedBonds: Bond[]
  readonly orderedAtoms: Atom[]
}

export interface GeometrySelectionIds {
  readonly selectedAtomIds: ReadonlySet<string>
  readonly selectedBondIds: ReadonlySet<string>
}

export function selectMoleculeSummary(molecule: Molecule): MoleculeSummary {
  return {
    formula: getMolecularFormula(molecule.atoms),
    molecularWeight: calculateMolecularWeight(molecule.atoms),
  }
}

export function selectGeometrySelection(
  molecule: Molecule,
  selection: GeometrySelectionIds,
): GeometrySelection {
  const atomById = new Map(molecule.atoms.map(atom => [atom.id, atom]))

  return {
    atomById,
    selectedAtoms: molecule.atoms.filter(atom => selection.selectedAtomIds.has(atom.id)),
    selectedBonds: molecule.bonds.filter(bond => selection.selectedBondIds.has(bond.id)),
    orderedAtoms: [...selection.selectedAtomIds]
      .map(id => atomById.get(id))
      .filter((atom): atom is Atom => atom !== undefined),
  }
}
