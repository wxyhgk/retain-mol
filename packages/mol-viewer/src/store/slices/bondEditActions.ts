import type { EditSlice } from './types'
import type { EditActionContext } from './editActionTypes'
import {
  applyActiveMoleculeEdit,
  applyActiveMoleculeEditWithSelection,
  applyActiveMoleculeSelectionCommand,
} from './helpers'
import {
  runAddBondCommand,
  runCycleBondOrderCommand,
} from '../../lib/builder/commands/bondTopologyCommands'
import { runRemoveBondCommand } from '../../lib/builder/commands/removalStoreCommands'
import {
  runBondSelectedAtomsWithSelectionCommand,
  runBondViaHydrogenWithSelectionCommand,
} from '../../lib/builder/commands/selectionCommands'

type BondEditActions = Pick<
  EditSlice,
  | 'addBond'
  | 'removeBond'
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

    cycleBondOrder: (id) =>
      set((s) =>
        applyActiveMoleculeEdit(s, (mol) => runCycleBondOrderCommand(mol, id)),
      ),

    bondViaHydrogen: (sourceHId, targetId) =>
      applyActiveMoleculeSelectionCommand(get, set, (mol, selection) =>
        runBondViaHydrogenWithSelectionCommand(
          mol,
          { sourceHId, targetId },
          selection,
        ),
      ),

    bondSelectedAtoms: () =>
      applyActiveMoleculeSelectionCommand(
        get,
        set,
        runBondSelectedAtomsWithSelectionCommand,
        {
          bumpSelectionVersion: (commandResult) =>
            commandResult.selectionChanged ?? true,
        },
      ),
  }
}
