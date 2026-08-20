import type { MoleculeState } from '../../store/slices/types'
import type { Molecule } from '../../lib/molecule'
import type { GizmoCallbacks } from '../../viewer/gizmo/controllers/RotateGizmoController'

export interface RotateGizmoEditSession {
  readonly start: () => void
  readonly end: () => void
}

export type RotateGizmoStoreGetter = () => Pick<
  MoleculeState,
  'objectsById' | 'objectOrder' | 'activeObjectId' | 'setAtomPositions'
>

export function getActiveMoleculeForGizmo(
  state: Pick<MoleculeState, 'objectsById' | 'activeObjectId'>,
): Molecule {
  return state.activeObjectId
    ? (state.objectsById[state.activeObjectId]?.molecule ?? { atoms: [], bonds: [], name: 'New Molecule' })
    : { atoms: [], bonds: [], name: 'New Molecule' }
}

export function createRotateGizmoCallbacks(
  getState: RotateGizmoStoreGetter,
  editSession: RotateGizmoEditSession,
): GizmoCallbacks {
  return {
    getMolecule: () => getActiveMoleculeForGizmo(getState()),
    setAtomPositions: positions => getState().setAtomPositions(positions),
    startEditSession: () => editSession.start(),
    endEditSession: () => editSession.end(),
  }
}
