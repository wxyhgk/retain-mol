import { describe, expect, it } from 'vitest'
import { newAtom } from '../lib/molecule'
import { createSceneObject } from '../lib/sceneObject'
import type { MoleculeState } from '../store/slices/types'
import type { MoleculeStoreApi } from './builderPointerTypes'
import {
  createAtomDragEditSession,
  createObjectPositionWriteEditSession,
  createObjectTransformEditSession,
} from './editSessionFactory'

function makeStore(state: MoleculeState): MoleculeStoreApi {
  return {
    getState: () => state,
  } as MoleculeStoreApi
}

describe('edit session factories', () => {
  it('creates atom drag sessions from an injected store', () => {
    const c1 = newAtom('C', 0, 0, 0)
    const c2 = newAtom('C', 1, 0, 0)
    const object = createSceneObject({ atoms: [c1, c2], bonds: [], name: 'mol' }, 'mol')
    const calls: string[] = []
    const state = {
      activeObjectId: object.id,
      objectsById: { [object.id]: object },
      objectOrder: [object.id],
      selectedAtomIds: new Set([c1.id, c2.id]),
      selectedBondIds: new Set(),
      setAtomPositions: positions => calls.push(`set:${positions.get(c1.id)?.x}:${positions.get(c2.id)?.x}`),
      beginTransaction: () => calls.push('begin'),
      endTransaction: () => calls.push('end'),
    } as unknown as MoleculeState

    const session = createAtomDragEditSession(makeStore(state))
    session.start(c1.id)
    session.move(c1.id, { x: 2, y: 0, z: 0 })
    session.end()

    expect(calls).toEqual(['begin', 'set:2:3', 'end'])
  })

  it('creates object transform sessions from an injected store', () => {
    const calls: string[] = []
    const store = makeStore({
      beginTransaction: () => calls.push('begin'),
      endTransaction: () => calls.push('end'),
      setObjectAtomPositions: (objectId, positions) => {
        calls.push(`write:${objectId}:${positions.get('a1')?.x}`)
      },
    } as unknown as MoleculeState)

    const transform = createObjectTransformEditSession(store)
    transform.start()
    transform.end()

    const writer = createObjectPositionWriteEditSession('obj-1', store)
    writer.start()
    writer.write(new Map([['a1', { x: 1, y: 2, z: 3 }]]))
    writer.end()

    expect(calls).toEqual(['begin', 'end', 'begin', 'write:obj-1:1', 'end'])
  })
})
