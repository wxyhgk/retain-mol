import { describe, expect, it } from 'vitest'
import { createSceneObject } from '../../lib/sceneObject'
import { undoSnapshotEqual, type UndoSnapshot } from './undoConfig'

const object = createSceneObject({ atoms: [{ id: 'a', symbol: 'C', x: 0, y: 0, z: 0 }], bonds: [] })
const snapshot: UndoSnapshot = { objectsById: { [object.id]: object }, objectOrder: [object.id], activeObjectId: object.id }

describe('undo snapshot content equality', () => {
  it('recognizes reconstructed equal content but keeps real scene/property changes undoable', () => {
    expect(undoSnapshotEqual(snapshot, structuredClone(snapshot))).toBe(true)
    for (const patch of [
      { name: 'renamed' }, { visible: false }, { locked: true }, { offset: { x: 1, y: 0, z: 0 } },
      { createdAt: object.createdAt + 1 },
      { molecule: { ...object.molecule, atoms: [{ ...object.molecule.atoms[0]!, isotope: 13 }] } },
    ]) {
      expect(undoSnapshotEqual(snapshot, { ...snapshot, objectsById: { [object.id]: { ...object, ...patch } } })).toBe(false)
    }
    expect(undoSnapshotEqual(snapshot, { ...snapshot, activeObjectId: null })).toBe(false)
  })
})
