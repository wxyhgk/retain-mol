import type { StoreApi } from 'zustand'
import type { TemporalState } from 'zundo'
import type { MoleculeState } from './types'
import {
  UNDO_LIMIT,
  partializeForUndo,
  undoSnapshotEqual,
  type UndoSnapshot,
} from './undoConfig'

export type GetTemporal = () => StoreApi<TemporalState<MoleculeState>>
export type GetMoleculeState = () => MoleculeState

export interface UndoTransactionController {
  readonly begin: () => void
  readonly end: () => void
  readonly getDepth: () => number
}

export function createUndoTransactionController(
  getTemporal: GetTemporal,
  getState: GetMoleculeState,
): UndoTransactionController {
  let depth = 0

  return {
    begin: () => {
      if (depth > 0) {
        depth += 1
        return
      }

      const temporal = getTemporal()
      const past = [
        ...(temporal.getState().pastStates as UndoSnapshot[]),
        partializeForUndo(getState()),
      ]
      if (past.length > UNDO_LIMIT) past.shift()

      temporal.setState({
        pastStates: past as TemporalState<MoleculeState>['pastStates'],
        futureStates: [],
      })
      temporal.getState().pause()
      depth = 1
    },

    end: () => {
      const temporal = getTemporal()
      if (depth <= 0) {
        temporal.getState().resume()
        return
      }

      depth -= 1
      if (depth > 0) return

      temporal.getState().resume()

      const past = temporal.getState().pastStates as UndoSnapshot[]
      const top = past[past.length - 1]
      if (top && undoSnapshotEqual(top, partializeForUndo(getState()))) {
        temporal.setState({
          pastStates: past.slice(
            0,
            -1,
          ) as TemporalState<MoleculeState>['pastStates'],
        })
      }
    },

    getDepth: () => depth,
  }
}
