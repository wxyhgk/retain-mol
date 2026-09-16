import type { EditSlice } from './types'
import type { EditActionContext } from './editActionTypes'
import type { Molecule } from '../../lib/molecule'
import {
  applyActiveMoleculeEdit,
  applyActiveMoleculeEditWithMeta,
  applyActiveMoleculeEditWithSelection,
  applyActiveMoleculeSelectionCommand,
} from './helpers'
import {
  runAddBondCommand,
  runBondSelectedAtomsCommand,
  runBondViaHydrogenCommand,
  runCycleBondOrderCommand,
  runNormalizeAromaticityCommand,
  runRemoveBondCommand,
  runSetBondOrderCommand,
  runSetBondOrdersCommand,
  runSetBondWedgeCommand,
  runSetEZCommand,
} from '../../lib/builder/commands/bond'
import {
  runSyncSelectionToMoleculeCommand,
} from '../../lib/builder/commands/selection'
import {
  editWithSelection,
  editWithSelectionSets,
  type CommandSelectionState,
  type EditCommandResult,
  type EditCommandWithSelectionResult,
} from '../../lib/builder/commands/shared'

function combineBondEditWithSelection(
  molecule: Molecule,
  selection: CommandSelectionState,
  result: EditCommandResult,
  atomIdsToDeselect: readonly string[],
): EditCommandWithSelectionResult | { readonly ok: false; readonly reason: string } {
  if (result.ok === false) return result
  if (!result.changed) {
    return editWithSelection(molecule, selection, { moleculeChanged: false })
  }
  const synced = runSyncSelectionToMoleculeCommand({
    selectedAtomIds: selection.selectedAtomIds,
    selectedBondIds: selection.selectedBondIds,
    molecule: result.molecule,
    removeAtomIds: atomIdsToDeselect,
  })
  return editWithSelectionSets(
    result.molecule,
    synced.selectedAtomIds,
    synced.selectedBondIds,
    selection,
    { moleculeChanged: true },
  )
}

type BondEditActions = Pick<
  EditSlice,
  | 'addBond'
  | 'removeBond'
  | 'setBondOrder'
  | 'setBondOrders'
  | 'setBondWedge'
  | 'setEZ'
  | 'normalizeAromaticity'
  | 'cycleBondOrder'
  | 'bondViaHydrogen'
  | 'bondSelectedAtoms'
>

export function createBondEditActions({
  get,
  set,
}: EditActionContext): BondEditActions {
  return {
    addBond: (atomId1, atomId2, order: 1 | 2 | 3 = 1) => {
      set((s) =>
        applyActiveMoleculeEdit(s, (mol) =>
          runAddBondCommand(mol, { atomId1, atomId2, order }),
        ),
      )
    },

    removeBond: (id) =>
      set((s) =>
        applyActiveMoleculeEditWithSelection(s, (mol, selection) =>
          runRemoveBondCommand(mol, id, selection),
        ),
      ),


    setBondOrders: (ids, order) =>
      set((s) =>
        applyActiveMoleculeEdit(s, (mol) => runSetBondOrdersCommand(mol, ids, order)),
      ),

    setBondWedge: (id, wedge) =>
      set((s) =>
        applyActiveMoleculeEdit(s, (mol) => runSetBondWedgeCommand(mol, id, wedge)),
      ),

    setEZ: (bondId, ez) =>
      applyActiveMoleculeEditWithMeta(
        get,
        set,
        (mol) => runSetEZCommand(mol, bondId, ez),
        () => ({}),
      ),

    normalizeAromaticity: () =>
      set((s) =>
        applyActiveMoleculeEdit(s, (mol) => runNormalizeAromaticityCommand(mol)),
      ),
    setBondOrder: (id, order) =>
      set((s) =>
        applyActiveMoleculeEdit(s, (mol) => runSetBondOrderCommand(mol, id, order)),
      ),

    cycleBondOrder: (id) =>
      set((s) =>
        applyActiveMoleculeEdit(s, (mol) => runCycleBondOrderCommand(mol, id)),
      ),

    bondViaHydrogen: (sourceHId, targetId) =>
      applyActiveMoleculeSelectionCommand(get, set, (mol, selection) => {
        const result = runBondViaHydrogenCommand(mol, sourceHId, targetId)
        return combineBondEditWithSelection(
          mol,
          selection,
          result,
          [sourceHId, targetId],
        )
      }),

    bondSelectedAtoms: () =>
      applyActiveMoleculeSelectionCommand(
        get,
        set,
        (mol, selection) => {
          const result = runBondSelectedAtomsCommand(mol, {
            atomIds: [...selection.selectedAtomIds],
          })
          return combineBondEditWithSelection(
            mol,
            selection,
            result,
            result.ok ? result.atomIdsToDeselect : [],
          )
        },
      ),
  }
}
