import { describe, expect, it } from 'vitest'
import { newAtom } from '../lib/molecule'
import { createViewerRuntime, getViewerRuntimeServices } from '../runtime/ViewerRuntime'
import {
  alignBondPair,
  createBondPairAlignmentEditSession,
  createObjectPositionWriteEditSession,
} from './editing'

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

describe('alignBondPair', () => {
  it('commits the complete rigid alignment as one undo record', () => {
    const runtime = createViewerRuntime()
    const store = getViewerRuntimeServices(runtime).moleculeStore
    store.getState().setMolecule({
      atoms: [
        { id: 'ref-1', symbol: 'C', x: -1, y: 0, z: 0 },
        { id: 'ref-2', symbol: 'C', x: 0, y: 0, z: 0 },
      ],
      bonds: [{ id: 'ref-bond', atomId1: 'ref-1', atomId2: 'ref-2', order: 1 }],
    })
    const movingObjectId = store.getState().addToScene({
      atoms: [
        { id: 'move-1', symbol: 'C', x: 0, y: 4, z: 1 },
        { id: 'move-2', symbol: 'C', x: 1, y: 4, z: 1 },
        { id: 'move-3', symbol: 'H', x: 0, y: 5, z: 1 },
      ],
      bonds: [
        { id: 'move-bond', atomId1: 'move-1', atomId2: 'move-2', order: 1 },
        { id: 'move-tail', atomId1: 'move-1', atomId2: 'move-3', order: 1 },
      ],
    }, false)
    const before = store.getState().objectsById[movingObjectId]!.molecule
    store.temporal.getState().clear()

    const result = alignBondPair({
      referenceBondId: 'ref-bond',
      movingBondId: 'move-bond',
      referenceAnchorAtomId: 'ref-2',
      movingAnchorAtomId: 'move-1',
      anchorDistance: 2,
      axisAngleDegrees: 75,
      azimuthDegrees: 20,
      coplanar: true,
      moveWholeFragment: true,
    }, runtime)

    expect(result.ok).toBe(true)
    expect(store.temporal.getState().pastStates).toHaveLength(1)
    expect(store.getState().objectsById[movingObjectId]!.molecule).not.toBe(before)

    store.temporal.getState().undo()
    expect(store.getState().objectsById[movingObjectId]!.molecule).toBe(before)
    runtime.dispose()
  })

  it('groups continuous control updates into one undo record', () => {
    const runtime = createViewerRuntime()
    const store = getViewerRuntimeServices(runtime).moleculeStore
    store.getState().setMolecule({
      atoms: [
        { id: 'axis-1', symbol: 'C', x: -1, y: 0, z: 0 },
        { id: 'axis-2', symbol: 'C', x: 0, y: 0, z: 0 },
      ],
      bonds: [{ id: 'axis-bond', atomId1: 'axis-1', atomId2: 'axis-2', order: 1 }],
    })
    const movingObjectId = store.getState().addToScene({
      atoms: [
        { id: 'group-1', symbol: 'C', x: 0, y: 3, z: 0 },
        { id: 'group-2', symbol: 'C', x: 1, y: 3, z: 0 },
      ],
      bonds: [{ id: 'group-bond', atomId1: 'group-1', atomId2: 'group-2', order: 1 }],
    }, false)
    const before = store.getState().objectsById[movingObjectId]!.molecule
    store.temporal.getState().clear()
    const session = createBondPairAlignmentEditSession(runtime)
    const base = {
      referenceBondId: 'axis-bond',
      movingBondId: 'group-bond',
      referenceAnchorAtomId: 'axis-2',
      movingAnchorAtomId: 'group-1',
      anchorDistance: 2,
      axisAngleDegrees: 45,
      coplanar: true,
      moveWholeFragment: true,
    } as const

    expect(session.update({ ...base, azimuthDegrees: 5 })).toMatchObject({
      ok: false,
      code: 'session-not-started',
    })
    session.start()
    for (let index = 1; index <= 100; index += 1) {
      expect(session.update({ ...base, azimuthDegrees: index * 0.08 }).ok).toBe(true)
    }
    session.end()

    expect(store.temporal.getState().pastStates).toHaveLength(1)
    const alignedAnchor = store.getState().objectsById[movingObjectId]!.molecule.atoms
      .find(atom => atom.id === 'group-1')!
    expect(Math.atan2(alignedAnchor.z, alignedAnchor.y) * 180 / Math.PI).toBeCloseTo(8, 10)
    store.temporal.getState().undo()
    expect(store.getState().objectsById[movingObjectId]!.molecule).toBe(before)

    store.temporal.getState().clear()
    session.start()
    expect(session.update({ ...base, azimuthDegrees: 35 }).ok).toBe(true)
    session.cancel()
    expect(store.getState().objectsById[movingObjectId]!.molecule).toBe(before)
    expect(store.temporal.getState().pastStates).toHaveLength(0)
    runtime.dispose()
  })
})
