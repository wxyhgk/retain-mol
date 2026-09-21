import { describe, expect, it } from 'vitest'
import type { StoreApi } from 'zustand'
import type { TemporalState } from 'zundo'
import type { MoleculeState } from './types'
import { partializeForUndo, UNDO_LIMIT } from './undoConfig'
import { createUndoTransactionController } from './transactionController'

function createState(id: string): MoleculeState {
  return {
    objectsById: {
      [id]: {
        id,
        name: id,
        molecule: { atoms: [], bonds: [], name: id },
        visible: true,
        locked: false,
        offset: { x: 0, y: 0, z: 0 },
        createdAt: 0,
      },
    },
    objectOrder: [id],
    activeObjectId: id,
  } as unknown as MoleculeState
}

function createTemporalMock(): StoreApi<TemporalState<MoleculeState>> {
  let state = {
    pastStates: [] as unknown[],
    futureStates: [] as unknown[],
    paused: false,
    pause: () => {
      state.paused = true
    },
    resume: () => {
      state.paused = false
    },
  }

  return {
    getState: () => state as unknown as TemporalState<MoleculeState>,
    setState: (next) => {
      state = {
        ...state,
        ...(typeof next === 'function'
          ? next(state as unknown as TemporalState<MoleculeState>)
          : next),
      }
    },
  } as StoreApi<TemporalState<MoleculeState>>
}

describe('createUndoTransactionController', () => {
  it('pauses temporal and records one starting snapshot for nested transactions', () => {
    let current = createState('start')
    const temporal = createTemporalMock()
    const controller = createUndoTransactionController(
      () => temporal,
      () => current,
    )

    controller.begin()
    controller.begin()
    current = createState('changed')
    controller.end()

    expect(controller.getDepth()).toBe(1)
    expect(temporal.getState().pastStates).toHaveLength(1)
    expect((temporal.getState() as unknown as { paused: boolean }).paused).toBe(
      true,
    )

    controller.end()

    expect(controller.getDepth()).toBe(0)
    expect((temporal.getState() as unknown as { paused: boolean }).paused).toBe(
      false,
    )
    expect(temporal.getState().pastStates).toHaveLength(1)
  })

  it('drops the starting snapshot for an empty transaction', () => {
    const current = createState('stable')
    const temporal = createTemporalMock()
    const controller = createUndoTransactionController(
      () => temporal,
      () => current,
    )

    controller.begin()
    controller.end()

    expect(controller.getDepth()).toBe(0)
    expect(temporal.getState().pastStates).toHaveLength(0)
  })

  it('preserves redo and the full past history for an empty transaction', () => {
    const current = createState('stable')
    const temporal = createTemporalMock()
    const past = Array.from({ length: UNDO_LIMIT }, (_, index) => (
      partializeForUndo(createState(`past-${index}`))
    ))
    const future = [partializeForUndo(createState('future'))]
    temporal.setState({ pastStates: past, futureStates: future })
    const controller = createUndoTransactionController(
      () => temporal,
      () => current,
    )

    controller.begin()
    controller.end()

    expect(temporal.getState().pastStates).toEqual(past)
    expect(temporal.getState().futureStates).toEqual(future)
  })

  it('clears redo and retains the transaction start for a changed transaction', () => {
    let current = createState('start')
    const temporal = createTemporalMock()
    temporal.setState({
      futureStates: [partializeForUndo(createState('future'))],
    })
    const controller = createUndoTransactionController(
      () => temporal,
      () => current,
    )

    controller.begin()
    current = createState('changed')
    controller.end()

    expect(temporal.getState().pastStates).toEqual([
      partializeForUndo(createState('start')),
    ])
    expect(temporal.getState().futureStates).toEqual([])
  })

  it('limits stored transaction snapshots to the undo limit', () => {
    let current = createState('state-0')
    const temporal = createTemporalMock()
    const controller = createUndoTransactionController(
      () => temporal,
      () => current,
    )

    for (let i = 1; i <= UNDO_LIMIT + 2; i += 1) {
      controller.begin()
      current = createState(`state-${i}`)
      controller.end()
    }

    expect(temporal.getState().pastStates).toHaveLength(UNDO_LIMIT)
  })

  it('does not resume tracking owned outside the controller on unmatched end', () => {
    const temporal = createTemporalMock()
    const controller = createUndoTransactionController(
      () => temporal,
      () => createState('stable'),
    )

    ;(temporal.getState() as unknown as { paused: boolean }).paused = true
    controller.end()

    expect(controller.getDepth()).toBe(0)
    expect((temporal.getState() as unknown as { paused: boolean }).paused).toBe(true)
  })

  it('rejects a concurrent transaction owned by another interaction', () => {
    const temporal = createTemporalMock()
    const controller = createUndoTransactionController(
      () => temporal,
      () => createState('stable'),
    )

    const atomDrag = controller.begin('atom-drag')
    expect(controller.getOwner()).toBe('atom-drag')
    expect(() => controller.begin('geometry-optimization')).toThrow(/atom-drag/)
    atomDrag.commit()
    expect(controller.getOwner()).toBeNull()
  })

  it('rolls state and history back when an owned transaction is cancelled', () => {
    let current = createState('start')
    const temporal = createTemporalMock()
    const controller = createUndoTransactionController(
      () => temporal,
      () => current,
      snapshot => { current = snapshot as MoleculeState },
    )

    const handle = controller.begin('atom-drag')
    current = createState('changed')
    handle.cancel()

    expect(current.activeObjectId).toBe('start')
    expect(temporal.getState().pastStates).toHaveLength(0)
    expect(controller.getOwner()).toBeNull()
    expect(handle.active).toBe(false)
  })

  it('cancels and rethrows when runTransaction fails', () => {
    let current = createState('start')
    const temporal = createTemporalMock()
    const controller = createUndoTransactionController(
      () => temporal,
      () => current,
      snapshot => { current = snapshot as MoleculeState },
    )

    expect(() => controller.run('command', () => {
      current = createState('changed')
      throw new Error('failed')
    })).toThrow('failed')
    expect(current.activeObjectId).toBe('start')
    expect(controller.getDepth()).toBe(0)
  })
})
