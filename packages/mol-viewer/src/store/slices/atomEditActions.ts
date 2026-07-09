import type { EditSlice } from './types'
import type { EditActionContext } from './editActionTypes'
import {
  applyActiveMoleculeEdit,
  applyActiveMoleculeEditWithMeta,
  applyActiveMoleculeEditWithSelection,
  getActiveMol,
} from './helpers'
import { runAddAtomCommand } from '../../lib/builder/commands/moleculeStoreCommands'
import {
  getAddOneHydrogenAvailabilityCommand,
  getAddOneHydrogensAvailabilityCommand,
  runAddHydrogensCommand,
  runAddOneHydrogenCommand,
  runAddOneHydrogensCommand,
  runGrowFromHydrogenCommand,
  runReplaceAtomCommand,
  runReplaceAtomsCommand,
} from '../../lib/builder/commands/atomTopologyCommands'
import {
  runRemoveAtomCommand,
  runRemoveAtomsCommand,
} from '../../lib/builder/commands/removalStoreCommands'
import {
  runSetAtomChargeCommand,
  runSetAtomRadicalCommand,
} from '../../lib/builder/commands/geometryStoreCommands'

type AtomEditActions = Pick<
  EditSlice,
  | 'addAtom'
  | 'removeAtom'
  | 'addHydrogens'
  | 'canAddOneHydrogen'
  | 'canAddOneHydrogens'
  | 'addOneHydrogen'
  | 'addOneHydrogens'
  | 'replaceAtom'
  | 'replaceAtoms'
  | 'removeAtoms'
  | 'setAtomCharge'
  | 'setAtomRadical'
  | 'growFromHydrogen'
>

export function createAtomEditActions({
  get,
  set,
}: EditActionContext): AtomEditActions {
  return {
    addAtom: (symbol, x, y, z) => {
      const result = applyActiveMoleculeEditWithMeta<{ atomId: string }>(
        get,
        set,
        (mol) => runAddAtomCommand(mol, symbol, x, y, z),
        (commandResult) => ({ atomId: commandResult.atomId }),
      )
      return result.ok ? result.atomId : ''
    },

    removeAtom: (id) =>
      set((s) =>
        applyActiveMoleculeEditWithSelection(s, (mol, selection) =>
          runRemoveAtomCommand(mol, id, selection),
        ),
      ),

    addHydrogens: (atomId) =>
      set((s) =>
        applyActiveMoleculeEdit(s, (mol) =>
          runAddHydrogensCommand(mol, atomId),
        ),
      ),

    canAddOneHydrogen: (atomId) => {
      const mol = getActiveMol(get())
      if (!mol) return { ok: false, reason: '没有活跃分子' }
      return getAddOneHydrogenAvailabilityCommand(mol, atomId)
    },

    canAddOneHydrogens: (atomIds) => {
      const mol = getActiveMol(get())
      if (!mol) return { ok: false, allowedAtomIds: [], reason: '没有活跃分子' }
      return getAddOneHydrogensAvailabilityCommand(mol, atomIds)
    },

    addOneHydrogen: (atomId) =>
      set((s) =>
        applyActiveMoleculeEdit(s, (mol) =>
          runAddOneHydrogenCommand(mol, atomId),
        ),
      ),

    addOneHydrogens: (atomIds) =>
      set((s) =>
        applyActiveMoleculeEdit(s, (mol) =>
          runAddOneHydrogensCommand(mol, atomIds),
        ),
      ),

    replaceAtom: (atomId, symbol) =>
      set((s) =>
        applyActiveMoleculeEdit(s, (mol) =>
          runReplaceAtomCommand(mol, atomId, symbol),
        ),
      ),

    replaceAtoms: (atomIds, symbol) =>
      set((s) =>
        applyActiveMoleculeEdit(s, (mol) =>
          runReplaceAtomsCommand(mol, atomIds, symbol),
        ),
      ),

    removeAtoms: (atomIds) =>
      set((s) =>
        applyActiveMoleculeEditWithSelection(s, (mol, selection) =>
          runRemoveAtomsCommand(mol, atomIds, selection),
        ),
      ),

    setAtomCharge: (atomId, charge) =>
      set((s) =>
        applyActiveMoleculeEdit(s, (mol) =>
          runSetAtomChargeCommand(mol, atomId, charge),
        ),
      ),

    setAtomRadical: (atomId, radical) =>
      set((s) =>
        applyActiveMoleculeEdit(s, (mol) =>
          runSetAtomRadicalCommand(mol, atomId, radical),
        ),
      ),

    growFromHydrogen: (atomId, symbol) =>
      set((s) =>
        applyActiveMoleculeEdit(s, (mol) =>
          runGrowFromHydrogenCommand(mol, atomId, symbol),
        ),
      ),
  }
}
