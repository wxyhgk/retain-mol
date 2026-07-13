import type { MoleculePositionWriter } from './viewer/positionWriter'
import { writeObjectAtomPositionsFromStore } from './appEditEffects'

export const moleculePositionWriter: MoleculePositionWriter = {
  setObjectAtomPositions: (objectId, positions) => {
    writeObjectAtomPositionsFromStore(objectId, positions)
  },
}
