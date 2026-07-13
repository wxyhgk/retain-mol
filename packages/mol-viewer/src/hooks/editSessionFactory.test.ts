import { describe, expect, it } from 'vitest'
import { newAtom } from '../lib/molecule'
import { createSceneObject } from '../lib/sceneObject'
import type { MoleculeState } from '../store/slices/types'
import type { BuilderMoleculeStoreApi } from './builderPointerTypes'
import {
  createAtomDragEditSession,
  createBondLengthEditSession,
  createObjectPositionWriteEditSession,
  createObjectTransformEditSession,
} from './editSessionFactory'

function makeStore(state: MoleculeState): BuilderMoleculeStoreApi {
  return {
    getState: () => state,
  } as BuilderMoleculeStoreApi
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

  it('wraps a bond-length drag in one cancellable edit session', () => {
    const calls: string[] = []
    const store = makeStore({
      beginTransaction: () => ({
        owner: 'bond-length-gizmo',
        active: true,
        commit: () => calls.push('commit'),
        cancel: () => calls.push('cancel'),
      }),
      endTransaction: () => calls.push('legacy-end'),
    } as unknown as MoleculeState)

    const committed = createBondLengthEditSession(store)
    committed.start()
    committed.start()
    committed.end()

    const cancelled = createBondLengthEditSession(store)
    cancelled.start()
    cancelled.cancel()

    expect(calls).toEqual(['commit', 'cancel'])
  })

  it('rolls atom and object edits back through their transaction handles', () => {
    const atom = newAtom('C', 0, 0, 0)
    const object = createSceneObject({ atoms: [atom], bonds: [], name: 'mol' }, 'mol')
    const calls: string[] = []
    const store = makeStore({
      activeObjectId: object.id,
      objectsById: { [object.id]: object },
      objectOrder: [object.id],
      selectedAtomIds: new Set([atom.id]),
      selectedBondIds: new Set(),
      setAtomPositions: () => calls.push('move'),
      beginTransaction: owner => ({
        owner,
        active: true,
        commit: () => calls.push(`commit:${owner}`),
        cancel: () => calls.push(`cancel:${owner}`),
      }),
      endTransaction: () => calls.push('legacy-end'),
    } as unknown as MoleculeState)

    const atomDrag = createAtomDragEditSession(store)
    atomDrag.start(atom.id)
    atomDrag.move(atom.id, { x: 2, y: 0, z: 0 })
    atomDrag.cancel()
    atomDrag.cancel()

    const transform = createObjectTransformEditSession(store)
    transform.start()
    transform.cancel()
    transform.cancel()

    expect(calls).toEqual(['move', 'cancel:atom-drag', 'cancel:object-transform'])
  })
})
