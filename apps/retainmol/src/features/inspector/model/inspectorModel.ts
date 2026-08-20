import {
  calculateMolecularWeight,
  getMolecularFormula,
  inferHybridization,
  type Atom,
  type Bond,
  type Molecule,
} from '@retainmol/mol-viewer/core'
import { calcAngle, calcDihedral, calcDistance } from '@/domain/viewer/geometry'
import { splitConnectedComponents } from '@retainmol/mol-viewer/graph'

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

export type EditableLiveGeometry =
  | {
      kind: 'distance'
      atomIds: readonly [string, string]
      atoms: readonly [IndexedAtom, IndexedAtom]
      value: number
      unit: 'Å'
      label: string
      editHint: string
    }
  | {
      kind: 'angle'
      atomIds: readonly [string, string, string]
      atoms: readonly [IndexedAtom, IndexedAtom, IndexedAtom]
      value: number
      unit: '°'
      label: string
      editHint: string
    }
  | {
      kind: 'dihedral'
      atomIds: readonly [string, string, string, string]
      atoms: readonly [IndexedAtom, IndexedAtom, IndexedAtom, IndexedAtom]
      value: number
      unit: '°'
      label: string
      editHint: string
    }

// Backward compat alias for consumers still importing EditableGeometry
export type EditableGeometry = EditableLiveGeometry

export type InspectorModel =
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
      geometry: EditableLiveGeometry | null
    }

// Keep SelectionInspectorModel alias for migration
export type SelectionInspectorModel = InspectorModel

export function buildInspectorModel(
  molecule: Molecule,
  selectedAtomIds: Iterable<string>,
  selectedBondIds: Iterable<string>,
): InspectorModel {
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
    geometry: buildEditableLiveGeometry(atoms),
  }
}

// Alias for existing call sites
export const buildSelectionInspectorModel = buildInspectorModel

function orderedExisting<T>(ids: Iterable<string>, byId: ReadonlyMap<string, T>): T[] {
  const result: T[] = []
  for (const id of ids) {
    const value = byId.get(id)
    if (value !== undefined) result.push(value)
  }
  return result
}

function buildEditableLiveGeometry(atoms: readonly IndexedAtom[]): EditableLiveGeometry | null {
  const label = atoms.map(({ atom }) => atom.symbol).join('—')
  if (atoms.length === 2) {
    const pair = atoms as [IndexedAtom, IndexedAtom]
    return {
      kind: 'distance',
      atomIds: [pair[0].atom.id, pair[1].atom.id],
      atoms: pair,
      value: calcDistance(pair[0].atom, pair[1].atom),
      unit: 'Å',
      label,
      editHint: '修改距离将平移后选原子一侧',
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
      label,
      editHint: '键角顶点 = 第 2 个选中原子 · 转动末端一侧',
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
      label,
      editHint: '二面角绕 2–3 号原子轴转动末端一侧',
    }
  }
  return null
}

// ── Scene panel rows (moved from domain/moleculePanelSelectors for inspector family) ──
export type ScenePanelRow = {
  readonly id: string
  readonly name: string
  readonly visible: boolean
  readonly locked: boolean
  readonly componentCount: number
  readonly topologyKey: string
}

type SceneObjectLike = {
  readonly id: string
  readonly name: string
  readonly visible: boolean
  readonly locked: boolean
  readonly molecule: Molecule
}

type ScenePanelState = {
  readonly objectsById: Readonly<Record<string, SceneObjectLike>>
  readonly objectOrder: readonly string[]
  readonly activeObjectId: string | null
}

let previousSceneRows: readonly ScenePanelRow[] = []

function moleculeTopologyKey(molecule: Molecule): string {
  return `${molecule.atoms.map(atom => atom.id).join(',')}|${molecule.bonds
    .map(bond => `${bond.id}:${bond.atomId1}:${bond.atomId2}:${bond.order}`)
    .join(',')}`
}

export function selectScenePanelRows(state: ScenePanelState): readonly ScenePanelRow[] {
  const previousById = new Map(previousSceneRows.map(row => [row.id, row]))
  const next = state.objectOrder.flatMap(id => {
    const object = state.objectsById[id]
    if (!object) return []
    const topologyKey = moleculeTopologyKey(object.molecule)
    const previous = previousById.get(id)
    if (
      previous
      && previous.name === object.name
      && previous.visible === object.visible
      && previous.locked === object.locked
      && previous.topologyKey === topologyKey
    ) return [previous]
    return [{
      id,
      name: object.name,
      visible: object.visible,
      locked: object.locked,
      topologyKey,
      componentCount: splitConnectedComponents(object.molecule).length,
    }]
  })
  if (
    next.length === previousSceneRows.length
    && next.every((row, index) => row === previousSceneRows[index])
  ) return previousSceneRows
  previousSceneRows = next
  return next
}

export function selectActiveMoleculeName(state: ScenePanelState): string {
  const id = state.activeObjectId
  if (!id) return 'New Molecule'
  return state.objectsById[id]?.molecule.name || 'New Molecule'
}
