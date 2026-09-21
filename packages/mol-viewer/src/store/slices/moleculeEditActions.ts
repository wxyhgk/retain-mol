import { moleculesEqual } from '../../lib/model/equality'
import { reconcileAtomChirality } from '../../lib/stereo/perception'
import type { EditSlice } from './types'
import type { EditActionContext } from './editActionTypes'
import {
  applyActiveMoleculeEdit,
  applyActiveMoleculeEditWithSelection,
  applySceneObjectUpdatedResult,
  applySetMoleculeInSceneResult,
  getEditableObject,
} from './helpers'
import { runAutoInferBondsCommand } from '../../lib/builder/commands/bond'
import {
  runMoveAtomCommand,
  runSetAtomPositionsCommand,
} from '../../lib/builder/commands/geometry'
import {
  runCenterMoleculeCommand,
  runClearMoleculeCommand,
  runSetMoleculeInSceneCommand,
  runSetSceneObjectAtomPositionsCommand,
} from '../../lib/builder/commands/scene'
import { runClearSelectionCommand } from '../../lib/builder/commands/selection'
import { editChanged, editWithSelectionSets, type EditCommandResult } from '../../lib/builder/commands/shared'

type MoleculeEditActions = Pick<
  EditSlice,
  | 'setMolecule'
  | 'commitEditResult'
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
  const commitEditResult = (
    result: EditCommandResult,
    options: { selectionPolicy?: 'clear' | 'preserve'; bumpAtomPositionVersion?: boolean } = {},
  ) => {
    if (!result.ok || !result.changed) return
    set((s) => {
      if (s.activeObjectId && !getEditableObject(s, s.activeObjectId)) return {}
      const previous = s.activeObjectId ? s.objectsById[s.activeObjectId]?.molecule : undefined
      if (previous && moleculesEqual(previous, result.molecule)) return {}
      const sceneResult = runSetMoleculeInSceneCommand(
        s.objectsById,
        s.objectOrder,
        s.activeObjectId,
        result.molecule,
      )
      const patch = applySetMoleculeInSceneResult(s, sceneResult)
      if (options.selectionPolicy !== 'preserve') return patch

      const validAtomIds = new Set(result.molecule.atoms.map(atom => atom.id))
      const validBondIds = new Set(result.molecule.bonds.map(bond => bond.id))
      return {
        ...patch,
        selectedAtomIds: new Set([...s.selectedAtomIds].filter(id => validAtomIds.has(id))),
        selectedBondIds: new Set([...s.selectedBondIds].filter(id => validBondIds.has(id))),
        selectionVersion: s.selectionVersion + 1,
        ...(options.bumpAtomPositionVersion
          ? { atomPositionVersion: s.atomPositionVersion + 1 }
          : {}),
      }
    })
  }

  return {
    setMolecule: mol => commitEditResult(editChanged(reconcileAtomChirality(mol))),
    commitEditResult,

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
        if (!getEditableObject(s, objectId)) return {}
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
        applyActiveMoleculeEditWithSelection(s, (previousMolecule, selection) => {
          const molecule = runClearMoleculeCommand().molecule
          const cleared = runClearSelectionCommand(
            selection.selectedAtomIds,
            selection.selectedBondIds,
          )
          return editWithSelectionSets(
            molecule,
            cleared.selectedAtomIds,
            cleared.selectedBondIds,
            selection,
            { moleculeChanged: !moleculesEqual(previousMolecule, molecule) },
          )
        }),
      ),

    centerMolecule: () =>
      set((s) => applyActiveMoleculeEdit(s, runCenterMoleculeCommand)),
  }
}
