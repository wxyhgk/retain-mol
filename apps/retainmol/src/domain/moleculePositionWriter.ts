import type { MoleculePositionWriter } from '@/lib/moleculeOpt'
import { writeObjectAtomPositionsFromStore } from './appEditEffects'

export const moleculePositionWriter: MoleculePositionWriter = {
  setObjectAtomPositions: (objectId, positions) => {
    writeObjectAtomPositionsFromStore(objectId, positions)
  },
}
