import { beforeEach, describe, expect, it } from 'vitest'
import type { Atom, Molecule } from '../lib/molecule'
import { useMoleculeStore } from '../store/moleculeStore'
import { createAtomDragEditSession } from './editSessionFactory'

const store = () => useMoleculeStore.getState()
const temporal = () => useMoleculeStore.temporal.getState()

function activeMolecule(): Molecule {
  const state = store()
  return state.objectsById[state.activeObjectId!].molecule
}

function atom(atomId: string): Atom {
  return activeMolecule().atoms.find(candidate => candidate.id === atomId)!
}

beforeEach(() => {
  temporal().resume()
  const objectIds = [...store().objectOrder]
  for (const objectId of objectIds.slice(1)) store().removeSceneObject(objectId)

  const objectId = store().objectOrder[0]
  if (objectId) {
    store().setObjectVisible(objectId, true)
    store().setObjectLocked(objectId, false)
    store().setActiveObject(objectId)
  }
  store().clearMolecule()
  store().clearSelection()
  temporal().clear()
})

describe('edit session with the real molecule store', () => {
  it('commits a selected-atom drag as one undoable transaction', () => {
    const firstId = 'workflow-a1'
    const secondId = 'workflow-a2'
    store().setMolecule({
      name: 'drag workflow',
      atoms: [
        { id: firstId, symbol: 'C', x: 0, y: 0, z: 0 },
        { id: secondId, symbol: 'C', x: 1, y: 0, z: 0 },
      ],
      bonds: [],
    })
    store().selectAtoms([firstId, secondId])
    temporal().clear()
    const versionBeforeDrag = store().atomPositionVersion

    const session = createAtomDragEditSession()
    session.start(firstId)
    try {
      session.move(firstId, { x: 2, y: 0, z: 0 })
      session.move(firstId, { x: 3, y: 1, z: 0 })
    } finally {
      session.end()
    }

    expect(session.isActive).toBe(false)
    expect(atom(firstId)).toMatchObject({ x: 3, y: 1, z: 0 })
    expect(atom(secondId)).toMatchObject({ x: 4, y: 1, z: 0 })
    expect(store().selectedAtomIds).toEqual(new Set([firstId, secondId]))
    expect(store().atomPositionVersion).toBe(versionBeforeDrag + 1)
    expect(temporal().isTracking).toBe(true)
    expect(temporal().pastStates).toHaveLength(1)
    expect(temporal().futureStates).toHaveLength(0)

    const versionBeforeUndo = store().atomPositionVersion
    temporal().undo()

    expect(atom(firstId)).toMatchObject({ x: 0, y: 0, z: 0 })
    expect(atom(secondId)).toMatchObject({ x: 1, y: 0, z: 0 })
    expect(store().selectedAtomIds).toEqual(new Set([firstId, secondId]))
    expect(store().atomPositionVersion).toBe(versionBeforeUndo + 1)
    expect(temporal().pastStates).toHaveLength(0)
    expect(temporal().futureStates).toHaveLength(1)

    temporal().redo()

    expect(atom(firstId)).toMatchObject({ x: 3, y: 1, z: 0 })
    expect(atom(secondId)).toMatchObject({ x: 4, y: 1, z: 0 })
    expect(store().selectedAtomIds).toEqual(new Set([firstId, secondId]))
    expect(temporal().pastStates).toHaveLength(1)
    expect(temporal().futureStates).toHaveLength(0)
  })

  it('restores a cancelled drag with one position-version invalidation', () => {
    const atomId = 'cancelled-a1'
    store().setMolecule({
      name: 'cancelled drag',
      atoms: [{ id: atomId, symbol: 'C', x: 0, y: 0, z: 0 }],
      bonds: [],
    })
    temporal().clear()
    const versionBeforeDrag = store().atomPositionVersion

    const session = createAtomDragEditSession()
    session.start(atomId)
    session.move(atomId, { x: 1, y: 0, z: 0 })
    session.move(atomId, { x: 2, y: 1, z: 0 })
    session.cancel()

    expect(atom(atomId)).toMatchObject({ x: 0, y: 0, z: 0 })
    expect(store().atomPositionVersion).toBe(versionBeforeDrag + 1)
    expect(temporal().pastStates).toHaveLength(0)
    expect(temporal().futureStates).toHaveLength(0)
  })
})
