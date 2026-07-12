import {
  AtomDragCommandSession,
  ObjectPositionWriteSession,
  ObjectTransformCommandSession,
  type AtomPosition,
} from '../lib/builder/commands/scene'
import { selectActiveMoleculeOrEmpty, useMoleculeStore } from '../store/moleculeStore'
import type { MoleculeStoreApi } from './builderPointerTypes'
import type { UndoTransactionHandle } from '../store/slices/transactionController'

function finishEditTransaction(
  store: MoleculeStoreApi,
  transaction: UndoTransactionHandle | null,
) {
  if (transaction && typeof transaction.commit === 'function') transaction.commit()
  else store.getState().endTransaction()
}

export function createAtomDragEditSession(store: MoleculeStoreApi = useMoleculeStore) {
  let transaction: UndoTransactionHandle | null = null
  return new AtomDragCommandSession({
    getMolecule: () => selectActiveMoleculeOrEmpty(store.getState()),
    getSelectedAtomIds: () => store.getState().selectedAtomIds,
    setAtomPositions: positions => store.getState().setAtomPositions(positions),
    startEditSession: () => { transaction = store.getState().beginTransaction('atom-drag') },
    endEditSession: () => { finishEditTransaction(store, transaction); transaction = null },
  })
}

export function createObjectTransformEditSession(store: MoleculeStoreApi = useMoleculeStore) {
  let transaction: UndoTransactionHandle | null = null
  return new ObjectTransformCommandSession({
    startEditSession: () => { transaction = store.getState().beginTransaction('object-transform') },
    endEditSession: () => { finishEditTransaction(store, transaction); transaction = null },
  })
}

export function createBondLengthEditSession(store: MoleculeStoreApi = useMoleculeStore) {
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
  store: MoleculeStoreApi = useMoleculeStore,
) {
  let transaction: UndoTransactionHandle | null = null
  return new ObjectPositionWriteSession(objectId, {
    startEditSession: () => { transaction = store.getState().beginTransaction(`object-position:${objectId}`) },
    endEditSession: () => { finishEditTransaction(store, transaction); transaction = null },
    setObjectAtomPositions: (targetObjectId, positions: ReadonlyMap<string, AtomPosition>) => {
      store.getState().setObjectAtomPositions(targetObjectId, positions)
    },
  })
}
