import { useShallow } from 'zustand/react/shallow'
import { useMoleculeStore } from '@/domain/viewer/moleculeState'
import { selectGeometryEditActions } from './geometryEditModel'

export function useGeometryEditActions() {
  return useMoleculeStore(useShallow(selectGeometryEditActions))
}
