import { useMoleculeStore } from '@/domain/viewerAdapter'
import type { MoleculePositionWriter } from '@/lib/moleculeOpt'

export const moleculePositionWriter: MoleculePositionWriter = {
  beginTransaction: () => useMoleculeStore.getState().beginTransaction(),
  endTransaction: () => useMoleculeStore.getState().endTransaction(),
  setObjectAtomPositions: (objectId, positions) => {
    useMoleculeStore.getState().setObjectAtomPositions(objectId, positions)
  },
}
