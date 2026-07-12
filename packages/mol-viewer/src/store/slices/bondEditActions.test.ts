import { beforeEach, describe, expect, it } from 'vitest'
import type { Molecule } from '../../lib/molecule'
import { useMoleculeStore } from '../moleculeStore'

const store = () => useMoleculeStore.getState()
const temporal = () => useMoleculeStore.temporal.getState()
const activeMolecule = () => {
  const state = store()
  return state.objectsById[state.activeObjectId!].molecule
}

const moleculeWithAromaticMetadata: Molecule = {
  atoms: [
    { id: 'c1', symbol: 'C', x: 0, y: 0, z: 0 },
    { id: 'c2', symbol: 'C', x: 1.54, y: 0, z: 0 },
  ],
  bonds: [
    { id: 'c1-c2', atomId1: 'c1', atomId2: 'c2', order: 1, aromatic: true },
  ],
}

beforeEach(() => {
  temporal().resume()
  const objectIds = [...store().objectOrder]
  for (const id of objectIds.slice(1)) store().removeSceneObject(id)
  if (objectIds[0]) {
    store().setObjectVisible(objectIds[0], true)
    store().setObjectLocked(objectIds[0], false)
    store().setActiveObject(objectIds[0])
  }
  store().setMolecule(moleculeWithAromaticMetadata)
  store().clearSelection()
  temporal().clear()
})

describe('bond edit actions', () => {
  it('sets bond order as one undo step and restores aromatic metadata on undo', () => {
    store().setBondOrder('c1-c2', 2)

    expect(activeMolecule().bonds[0]).toMatchObject({ order: 2 })
    expect(activeMolecule().bonds[0].aromatic).toBeUndefined()
    expect(temporal().pastStates).toHaveLength(1)

    temporal().undo()

    expect(activeMolecule().bonds[0]).toMatchObject({ order: 1, aromatic: true })
  })

  it('does not create history for missing or invalid bond-order requests', () => {
    const molecule = activeMolecule()

    store().setBondOrder('missing-bond', 2)
    store().setBondOrder('c1-c2', 4 as 1 | 2 | 3)

    expect(activeMolecule()).toBe(molecule)
    expect(temporal().pastStates).toHaveLength(0)
  })
})
