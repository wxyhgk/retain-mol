import { describe, expect, it } from 'vitest'
import type { StoreApi } from 'zustand'
import type { TemporalState } from 'zundo'
import type { MoleculeState } from './types'
import { UNDO_LIMIT } from './undoConfig'
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

  it('recovers temporal tracking when end is called without a matching begin', () => {
    const temporal = createTemporalMock()
    const controller = createUndoTransactionController(
      () => temporal,
      () => createState('stable'),
    )

    ;(temporal.getState() as unknown as { paused: boolean }).paused = true
    controller.end()

    expect(controller.getDepth()).toBe(0)
    expect((temporal.getState() as unknown as { paused: boolean }).paused).toBe(
      false,
    )
  })
})
