import type { EditSlice } from './types'
import type { EditActionContext } from './editActionTypes'
import {
  applyActiveMoleculeEdit,
  applyActiveMoleculeEditWithMeta,
  applyActiveMoleculeEditWithSelection,
  getActiveMol,
} from './helpers'
import {
  getAddOneHydrogenAvailabilityCommand,
  getAddOneHydrogensAvailabilityCommand,
  runAddHydrogensCommand,
  runAddOneHydrogenCommand,
  runAddOneHydrogensCommand,
  runAddAtomCommand,
  runGrowFromHydrogenCommand,
  runRemoveAtomCommand,
  runRemoveAtomsCommand,
  runReplaceAtomCommand,
  runReplaceAtomsCommand,
  runSetAtomChargeCommand,
  runSetAtomRadicalCommand,
  runFlipChiralityCommand,
  getFlipChiralityAvailabilityCommand,
} from '../../lib/builder/commands/atom'

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
  | 'flipChirality'
  | 'canFlipChirality'
  | 'growFromHydrogen'
>

export function createAtomEditActions({
  get,
  set,
}: EditActionContext): AtomEditActions {
  return {
    addAtom: (symbol, x, y, z) => {
      const result = applyActiveMoleculeEditWithMeta(
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

    flipChirality: (atomId) =>
      set((s) =>
        applyActiveMoleculeEdit(s, (mol) =>
          runFlipChiralityCommand(mol, atomId),
        ),
      ),

    canFlipChirality: (atomId) => {
      const mol = getActiveMol(get())
      if (!mol) return { ok: false, reason: '没有活跃分子' }
      return getFlipChiralityAvailabilityCommand(mol, atomId)
    },

    growFromHydrogen: (atomId, symbol) =>
      set((s) =>
        applyActiveMoleculeEdit(s, (mol) =>
          runGrowFromHydrogenCommand(mol, atomId, symbol),
        ),
      ),
  }
}
