import { describe, expect, it } from 'vitest'
import { newAtom } from '../lib/molecule'
import { createViewerRuntime, getViewerRuntimeServices } from '../runtime/ViewerRuntime'
import { createObjectPositionWriteEditSession } from './editing'

describe('public editing sessions', () => {
  it('writes through the supplied isolated viewer runtime', () => {
    const first = createViewerRuntime()
    const second = createViewerRuntime()
    const firstStore = getViewerRuntimeServices(first).moleculeStore
    const secondStore = getViewerRuntimeServices(second).moleculeStore
    const atom = newAtom('C', 0, 0, 0)

    firstStore.getState().setMolecule({ atoms: [atom], bonds: [], name: 'first' })
    const objectId = firstStore.getState().activeObjectId
    expect(objectId).not.toBeNull()
    if (!objectId) return

    const session = createObjectPositionWriteEditSession(objectId, first)
    session.start()
    session.write(new Map([[atom.id, { x: 4, y: 5, z: 6 }]]))
    session.end()

    const updated = firstStore.getState().objectsById[objectId].molecule.atoms[0]
    expect(updated).toMatchObject({ x: 4, y: 5, z: 6 })
    const secondObjectId = secondStore.getState().activeObjectId
    expect(secondObjectId).not.toBeNull()
    expect(secondStore.getState().objectsById[secondObjectId!].molecule.atoms).toHaveLength(0)

    first.dispose()
    second.dispose()
  })
})
