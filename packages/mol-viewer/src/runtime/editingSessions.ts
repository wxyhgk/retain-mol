import * as sessions from '../application/editing/sessions'
import type { EditSessionPort } from '../application/editing/sessions'
import { selectActiveMoleculeOrEmpty, useMoleculeStore, type MoleculeStoreApi } from '../store/moleculeStore'
import type { AlignBondPairInput } from '../lib/builder/geometry/bondPairAlignment'

export type { InternalAlignBondPairResult, InternalBondPairAlignmentEditSession } from '../application/editing/sessions'

type SessionStore = Pick<MoleculeStoreApi, 'getState'>

function sessionPort(store: SessionStore): EditSessionPort {
  return {
    getMolecule: () => selectActiveMoleculeOrEmpty(store.getState()),
    getSelectedAtomIds: () => store.getState().selectedAtomIds,
    setAtomPositions: positions => store.getState().setAtomPositions(positions),
    setObjectAtomPositions: (objectId, positions) => store.getState().setObjectAtomPositions(objectId, positions),
    alignBondPair: input => store.getState().alignBondPair(input),
    openTransaction: owner => store.getState().beginTransaction(owner),
    finishLegacyTransaction: () => store.getState().endTransaction(),
  }
}

export function createAtomDragEditSession(store: SessionStore = useMoleculeStore) {
  return sessions.createAtomDragEditSession(sessionPort(store))
}

export function createObjectTransformEditSession(store: SessionStore = useMoleculeStore) {
  return sessions.createObjectTransformEditSession(sessionPort(store))
}

export function createBondLengthEditSession(store: SessionStore = useMoleculeStore) {
  return sessions.createBondLengthEditSession(sessionPort(store))
}

export function createObjectPositionWriteEditSession(objectId: string, store: SessionStore = useMoleculeStore) {
  return sessions.createObjectPositionWriteEditSession(objectId, sessionPort(store))
}

export function createBondPairAlignmentEditSession(store: SessionStore = useMoleculeStore) {
  return sessions.createBondPairAlignmentEditSession(sessionPort(store))
}

export function runBondPairAlignmentEdit(input: AlignBondPairInput, store: SessionStore = useMoleculeStore) {
  return sessions.runBondPairAlignmentEdit(input, sessionPort(store))
}
