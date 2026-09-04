import {
  AtomDragCommandSession,
  ObjectPositionWriteSession,
  ObjectTransformCommandSession,
  type AtomPosition,
} from '../lib/builder/commands/scene'
import { selectActiveMoleculeOrEmpty, useMoleculeStore } from '../store/moleculeStore'
import type { BuilderMoleculeStoreApi } from './builderPointerTypes'
import type { UndoTransactionHandle } from '../store/contracts/transaction'
import type {
  AlignBondPairDiagnostics,
  AlignBondPairFailureCode,
  AlignBondPairInput,
} from '../lib/builder/geometry/bondPairAlignment'

function finishEditTransaction(
  store: BuilderMoleculeStoreApi,
  transaction: UndoTransactionHandle | null,
) {
  if (transaction && typeof transaction.commit === 'function') transaction.commit()
  else store.getState().endTransaction()
}

function cancelEditTransaction(
  store: BuilderMoleculeStoreApi,
  transaction: UndoTransactionHandle | null,
) {
  if (transaction && typeof transaction.cancel === 'function') transaction.cancel()
  else store.getState().endTransaction()
}

export function createAtomDragEditSession(store: BuilderMoleculeStoreApi = useMoleculeStore) {
  let transaction: UndoTransactionHandle | null = null
  return new AtomDragCommandSession({
    getMolecule: () => selectActiveMoleculeOrEmpty(store.getState()),
    getSelectedAtomIds: () => store.getState().selectedAtomIds,
    setAtomPositions: positions => store.getState().setAtomPositions(positions),
    startEditSession: () => { transaction = store.getState().beginTransaction('atom-drag') },
    endEditSession: () => { finishEditTransaction(store, transaction); transaction = null },
    cancelEditSession: () => { cancelEditTransaction(store, transaction); transaction = null },
  })
}

export function createObjectTransformEditSession(store: BuilderMoleculeStoreApi = useMoleculeStore) {
  let transaction: UndoTransactionHandle | null = null
  return new ObjectTransformCommandSession({
    startEditSession: () => { transaction = store.getState().beginTransaction('object-transform') },
    endEditSession: () => { finishEditTransaction(store, transaction); transaction = null },
    cancelEditSession: () => { cancelEditTransaction(store, transaction); transaction = null },
  })
}

export function createBondLengthEditSession(store: BuilderMoleculeStoreApi = useMoleculeStore) {
  let transaction: UndoTransactionHandle | null = null
  let started = false
  return {
    get active() { return started && (transaction?.active ?? true) },
    start() {
      if (started) return
      started = true
      transaction = store.getState().beginTransaction('bond-length-gizmo')
    },
    end() {
      if (!started) return
      finishEditTransaction(store, transaction)
      transaction = null
      started = false
    },
    cancel() {
      if (!started) return
      if (transaction?.cancel) transaction.cancel()
      else store.getState().endTransaction()
      transaction = null
      started = false
    },
  }
}

export function createObjectPositionWriteEditSession(
  objectId: string,
  store: BuilderMoleculeStoreApi = useMoleculeStore,
) {
  let transaction: UndoTransactionHandle | null = null
  return new ObjectPositionWriteSession(objectId, {
    startEditSession: () => { transaction = store.getState().beginTransaction(`object-position:${objectId}`) },
    endEditSession: () => { finishEditTransaction(store, transaction); transaction = null },
    cancelEditSession: () => { cancelEditTransaction(store, transaction); transaction = null },
    setObjectAtomPositions: (targetObjectId, positions: ReadonlyMap<string, AtomPosition>) => {
      store.getState().setObjectAtomPositions(targetObjectId, positions)
    },
  })
}

export type InternalAlignBondPairResult =
  | { readonly ok: true; readonly diagnostics: AlignBondPairDiagnostics }
  | { readonly ok: false; readonly code: AlignBondPairFailureCode; readonly reason: string }

export function runBondPairAlignmentEdit(
  input: AlignBondPairInput,
  store: BuilderMoleculeStoreApi = useMoleculeStore,
): InternalAlignBondPairResult {
  return store.getState().alignBondPair(input)
}

export interface InternalBondPairAlignmentEditSession {
  readonly isActive: boolean
  start(): void
  update(input: AlignBondPairInput): InternalAlignBondPairResult
  end(): void
  cancel(): void
}

export function createBondPairAlignmentEditSession(
  store: BuilderMoleculeStoreApi = useMoleculeStore,
): InternalBondPairAlignmentEditSession {
  let transaction: UndoTransactionHandle | null = null
  let active = false
  let previousAzimuthDegrees = 0

  return {
    get isActive() {
      return active && Boolean(transaction?.active)
    },
    start() {
      if (active) return
      transaction = store.getState().beginTransaction('bond-pair-alignment')
      previousAzimuthDegrees = 0
      active = true
    },
    update(input) {
      if (!active) {
        return {
          ok: false,
          code: 'session-not-started',
          reason: '键对齐编辑会话尚未开始',
        }
      }
      const result = store.getState().alignBondPair({
        ...input,
        azimuthDegrees: input.azimuthDegrees - previousAzimuthDegrees,
      })
      if (result.ok) previousAzimuthDegrees = input.azimuthDegrees
      return result
    },
    end() {
      if (!active) return
      finishEditTransaction(store, transaction)
      transaction = null
      active = false
    },
    cancel() {
      if (!active) return
      cancelEditTransaction(store, transaction)
      transaction = null
      active = false
    },
  }
}
