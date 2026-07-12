import type { MoleculePositionWriter } from '@/features/molecule-animation'
import { writeObjectAtomPositionsFromStore } from './appEditEffects'

export const moleculePositionWriter: MoleculePositionWriter = {
  setObjectAtomPositions: (objectId, positions) => {
    writeObjectAtomPositionsFromStore(objectId, positions)
  },
}
