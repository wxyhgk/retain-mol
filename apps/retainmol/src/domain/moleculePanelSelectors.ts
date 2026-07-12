import type { Molecule } from '@retainmol/mol-viewer/core'
import { splitConnectedComponents } from '@/domain/viewer/moleculeState'

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

export type ScenePanelRow = {
  readonly id: string
  readonly name: string
  readonly visible: boolean
  readonly locked: boolean
  readonly componentCount: number
  readonly topologyKey: string
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
