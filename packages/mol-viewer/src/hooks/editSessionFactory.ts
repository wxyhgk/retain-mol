import {
  AtomDragCommandSession,
  ObjectPositionWriteSession,
  ObjectTransformCommandSession,
  type AtomPosition,
} from '../lib/builder/commands/moveCommands'
import { selectActiveMoleculeOrEmpty, useMoleculeStore } from '../store/moleculeStore'
import type { MoleculeStoreApi } from './builderPointerTypes'

export function createAtomDragEditSession(store: MoleculeStoreApi = useMoleculeStore) {
  return new AtomDragCommandSession({
    getMolecule: () => selectActiveMoleculeOrEmpty(store.getState()),
    getSelectedAtomIds: () => store.getState().selectedAtomIds,
    setAtomPositions: positions => store.getState().setAtomPositions(positions),
    startEditSession: () => store.getState().beginTransaction(),
    endEditSession: () => store.getState().endTransaction(),
  })
}

export function createObjectTransformEditSession(store: MoleculeStoreApi = useMoleculeStore) {
  return new ObjectTransformCommandSession({
    startEditSession: () => store.getState().beginTransaction(),
    endEditSession: () => store.getState().endTransaction(),
  })
}

export function createObjectPositionWriteEditSession(
  objectId: string,
  store: MoleculeStoreApi = useMoleculeStore,
) {
  return new ObjectPositionWriteSession(objectId, {
    startEditSession: () => store.getState().beginTransaction(),
    endEditSession: () => store.getState().endTransaction(),
    setObjectAtomPositions: (targetObjectId, positions: ReadonlyMap<string, AtomPosition>) => {
      store.getState().setObjectAtomPositions(targetObjectId, positions)
    },
  })
}
