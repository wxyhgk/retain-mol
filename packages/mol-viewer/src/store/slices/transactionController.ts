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

export interface UndoTransactionHandle {
  readonly owner: string
  readonly active: boolean
  commit(): void
  cancel(): void
}

export interface UndoTransactionController {
  readonly begin: (owner?: string) => UndoTransactionHandle
  readonly end: (owner?: string) => void
  readonly run: <T>(owner: string, operation: () => T) => T
  readonly getDepth: () => number
  readonly getOwner: () => string | null
}

export function createUndoTransactionController(
  getTemporal: GetTemporal,
  getState: GetMoleculeState,
  restoreState: (snapshot: UndoSnapshot) => void = () => undefined,
): UndoTransactionController {
  let depth = 0
  let owner: string | null = null
  let generation = 0
  let snapshotBeforeTransaction: UndoSnapshot | null = null
  let pastBeforeTransaction: TemporalState<MoleculeState>['pastStates'] | null = null
  let futureBeforeTransaction: TemporalState<MoleculeState>['futureStates'] | null = null

  const reset = () => {
    depth = 0
    owner = null
    snapshotBeforeTransaction = null
    pastBeforeTransaction = null
    futureBeforeTransaction = null
  }

  const commitOne = (expectedOwner: string) => {
    if (owner !== expectedOwner || depth <= 0) {
      throw new Error(`事务所有权不匹配：当前 ${owner ?? '无'}，提交者 ${expectedOwner}`)
    }
    depth -= 1
    if (depth > 0) return

    const temporal = getTemporal()
    temporal.getState().resume()
    const past = temporal.getState().pastStates as UndoSnapshot[]
    const top = past[past.length - 1]
    if (top && undoSnapshotEqual(top, partializeForUndo(getState()))) {
      temporal.setState({
        pastStates: pastBeforeTransaction ?? [],
        futureStates: futureBeforeTransaction ?? [],
      })
    }
    reset()
  }

  const cancelAll = (expectedOwner: string) => {
    if (owner !== expectedOwner || depth <= 0) {
      throw new Error(`事务所有权不匹配：当前 ${owner ?? '无'}，取消者 ${expectedOwner}`)
    }
    const temporal = getTemporal()
    if (snapshotBeforeTransaction) restoreState(snapshotBeforeTransaction)
    temporal.setState({
      pastStates: pastBeforeTransaction ?? [],
      futureStates: futureBeforeTransaction ?? [],
    })
    temporal.getState().resume()
    generation += 1
    reset()
  }

  const begin = (requestedOwner = 'legacy'): UndoTransactionHandle => {
    if (owner !== null && owner !== requestedOwner) {
      throw new Error(`事务已由 ${owner} 持有，${requestedOwner} 不能并发开启`)
    }

    if (depth === 0) {
      const temporal = getTemporal()
      const temporalState = temporal.getState()
      snapshotBeforeTransaction = partializeForUndo(getState())
      pastBeforeTransaction = [...temporalState.pastStates]
      futureBeforeTransaction = [...temporalState.futureStates]
      const past = [
        ...(temporalState.pastStates as UndoSnapshot[]),
        snapshotBeforeTransaction,
      ]
      if (past.length > UNDO_LIMIT) past.shift()
      temporal.setState({
        pastStates: past as TemporalState<MoleculeState>['pastStates'],
        futureStates: [],
      })
      temporal.getState().pause()
      owner = requestedOwner
    }
    depth += 1
    const handleGeneration = generation
    let settled = false

    return {
      owner: requestedOwner,
      get active() {
        return !settled && handleGeneration === generation && owner === requestedOwner
      },
      commit() {
        if (settled || handleGeneration !== generation) return
        settled = true
        commitOne(requestedOwner)
      },
      cancel() {
        if (settled || handleGeneration !== generation) return
        settled = true
        cancelAll(requestedOwner)
      },
    }
  }

  return {
    begin,
    end: (expectedOwner = 'legacy') => {
      // Compatibility no-op: an unmatched legacy end must never resume or alter
      // a transaction owned by another interaction.
      if (depth === 0) return
      commitOne(expectedOwner)
    },
    run: (transactionOwner, operation) => {
      const handle = begin(transactionOwner)
      try {
        const result = operation()
        handle.commit()
        return result
      } catch (error) {
        handle.cancel()
        throw error
      }
    },
    getDepth: () => depth,
    getOwner: () => owner,
  }
}
