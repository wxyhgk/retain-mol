import {
  calculateMolecularWeight,
  getMolecularFormula,
  inferHybridization,
  type Atom,
  type Bond,
  type Molecule,
} from '@retainmol/mol-viewer/core'
import { calcAngle, calcDihedral, calcDistance } from '@/domain/viewer/geometry'

export interface IndexedAtom {
  atom: Atom
  number: number
}

export interface NeighborBond {
  atom: Atom
  atomNumber: number
  bond: Bond
  length: number
}

export type EditableGeometry =
  | {
      kind: 'distance'
      atomIds: readonly [string, string]
      atoms: readonly [IndexedAtom, IndexedAtom]
      value: number
      unit: 'Å'
    }
  | {
      kind: 'angle'
      atomIds: readonly [string, string, string]
      atoms: readonly [IndexedAtom, IndexedAtom, IndexedAtom]
      value: number
      unit: '°'
    }
  | {
      kind: 'dihedral'
      atomIds: readonly [string, string, string, string]
      atoms: readonly [IndexedAtom, IndexedAtom, IndexedAtom, IndexedAtom]
      value: number
      unit: '°'
    }

export type SelectionInspectorModel =
  | {
      mode: 'molecule'
      formula: string
      molecularWeight: number | null
      atomCount: number
      bondCount: number
    }
  | {
      mode: 'atom'
      selectedAtomCount: 1
      selectedBondCount: 0
      atom: IndexedAtom
      hybridization: ReturnType<typeof inferHybridization>
      neighbors: readonly NeighborBond[]
    }
  | {
      mode: 'bond'
      selectedAtomCount: 0
      selectedBondCount: 1
      bond: Bond
      first: IndexedAtom
      second: IndexedAtom
      length: number
    }
  | {
      mode: 'multi'
      selectedAtomCount: number
      selectedBondCount: number
      atoms: readonly IndexedAtom[]
      bonds: readonly Bond[]
      geometry: EditableGeometry | null
    }

export function buildSelectionInspectorModel(
  molecule: Molecule,
  selectedAtomIds: Iterable<string>,
  selectedBondIds: Iterable<string>,
): SelectionInspectorModel {
  const atomById = new Map(molecule.atoms.map((atom, index) => [
    atom.id,
    { atom, number: index + 1 } satisfies IndexedAtom,
  ]))
  const bondById = new Map(molecule.bonds.map(bond => [bond.id, bond]))
  const atoms = orderedExisting(selectedAtomIds, atomById)
  const bonds = orderedExisting(selectedBondIds, bondById)

  if (atoms.length === 0 && bonds.length === 0) {
    return {
      mode: 'molecule',
      formula: getMolecularFormula(molecule.atoms),
      molecularWeight: calculateMolecularWeight(molecule.atoms),
      atomCount: molecule.atoms.length,
      bondCount: molecule.bonds.length,
    }
  }

  if (atoms.length === 1 && bonds.length === 0) {
    const selected = atoms[0]
    const neighbors = molecule.bonds.flatMap((bond): NeighborBond[] => {
      const neighborId = bond.atomId1 === selected.atom.id
        ? bond.atomId2
        : bond.atomId2 === selected.atom.id
          ? bond.atomId1
          : null
      if (neighborId === null) return []
      const neighbor = atomById.get(neighborId)
      if (!neighbor) return []
      return [{
        atom: neighbor.atom,
        atomNumber: neighbor.number,
        bond,
        length: calcDistance(selected.atom, neighbor.atom),
      }]
    })

    return {
      mode: 'atom',
      selectedAtomCount: 1,
      selectedBondCount: 0,
      atom: selected,
      hybridization: inferHybridization(molecule.bonds, selected.atom.id),
      neighbors,
    }
  }

  if (atoms.length === 0 && bonds.length === 1) {
    const bond = bonds[0]
    const first = atomById.get(bond.atomId1)
    const second = atomById.get(bond.atomId2)
    if (first && second) {
      return {
        mode: 'bond',
        selectedAtomCount: 0,
        selectedBondCount: 1,
        bond,
        first,
        second,
        length: calcDistance(first.atom, second.atom),
      }
    }
  }

  return {
    mode: 'multi',
    selectedAtomCount: atoms.length,
    selectedBondCount: bonds.length,
    atoms,
    bonds,
    geometry: buildEditableGeometry(atoms),
  }
}

function orderedExisting<T>(ids: Iterable<string>, byId: ReadonlyMap<string, T>): T[] {
  const result: T[] = []
  for (const id of ids) {
    const value = byId.get(id)
    if (value !== undefined) result.push(value)
  }
  return result
}

function buildEditableGeometry(atoms: readonly IndexedAtom[]): EditableGeometry | null {
  if (atoms.length === 2) {
    const pair = atoms as [IndexedAtom, IndexedAtom]
    return {
      kind: 'distance',
      atomIds: [pair[0].atom.id, pair[1].atom.id],
      atoms: pair,
      value: calcDistance(pair[0].atom, pair[1].atom),
      unit: 'Å',
    }
  }
  if (atoms.length === 3) {
    const triple = atoms as [IndexedAtom, IndexedAtom, IndexedAtom]
    return {
      kind: 'angle',
      atomIds: [triple[0].atom.id, triple[1].atom.id, triple[2].atom.id],
      atoms: triple,
      value: calcAngle(triple[0].atom, triple[1].atom, triple[2].atom),
      unit: '°',
    }
  }
  if (atoms.length === 4) {
    const quartet = atoms as [IndexedAtom, IndexedAtom, IndexedAtom, IndexedAtom]
    return {
      kind: 'dihedral',
      atomIds: [quartet[0].atom.id, quartet[1].atom.id, quartet[2].atom.id, quartet[3].atom.id],
      atoms: quartet,
      value: calcDihedral(quartet[0].atom, quartet[1].atom, quartet[2].atom, quartet[3].atom),
      unit: '°',
    }
  }
  return null
}
