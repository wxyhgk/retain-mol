import type { EditSlice } from './types'
import type { EditActionContext } from './editActionTypes'
import {
  applyActiveMoleculeEdit,
  applyActiveMoleculeEditWithSelection,
  applySceneObjectUpdatedResult,
  applySetMoleculeInSceneResult,
} from './helpers'
import {
  runAutoInferBondsCommand,
  runCenterMoleculeCommand,
  runMoveAtomCommand,
  runSetAtomPositionsCommand,
} from '../../lib/builder/commands/moleculeStoreCommands'
import {
  runSetMoleculeInSceneCommand,
  runSetSceneObjectAtomPositionsCommand,
} from '../../lib/builder/commands/sceneStoreCommands'
import { runClearMoleculeWithSelectionCommand } from '../../lib/builder/commands/selectionCommands'

type MoleculeEditActions = Pick<
  EditSlice,
  | 'setMolecule'
  | 'moveAtom'
  | 'setAtomPositions'
  | 'setObjectAtomPositions'
  | 'autoInferBonds'
  | 'clearMolecule'
  | 'centerMolecule'
>

export function createMoleculeEditActions({
  set,
}: EditActionContext): MoleculeEditActions {
  return {
    setMolecule: (mol) =>
      set((s) => {
        const result = runSetMoleculeInSceneCommand(
          s.objectsById,
          s.objectOrder,
          s.activeObjectId,
          mol,
        )
        return applySetMoleculeInSceneResult(s, result)
      }),

    moveAtom: (id, x, y, z) =>
      set((s) =>
        applyActiveMoleculeEdit(
          s,
          (mol) => runMoveAtomCommand(mol, id, x, y, z),
          {
            bumpAtomPositionVersion: true,
          },
        ),
      ),

    setAtomPositions: (positions) =>
      set((s) =>
        applyActiveMoleculeEdit(
          s,
          (mol) => runSetAtomPositionsCommand(mol, positions),
          {
            bumpAtomPositionVersion: true,
          },
        ),
      ),

    setObjectAtomPositions: (objectId, positions) =>
      set((s) => {
        const result = runSetSceneObjectAtomPositionsCommand(
          s.objectsById,
          objectId,
          positions,
        )
        return applySceneObjectUpdatedResult(s, result, {
          bumpAtomPositionVersion: true,
        })
      }),

    autoInferBonds: () =>
      set((s) => applyActiveMoleculeEdit(s, runAutoInferBondsCommand)),

    clearMolecule: () =>
      set((s) =>
        applyActiveMoleculeEditWithSelection(s, () =>
          runClearMoleculeWithSelectionCommand(),
        ),
      ),

    centerMolecule: () =>
      set((s) => applyActiveMoleculeEdit(s, runCenterMoleculeCommand)),
  }
}
