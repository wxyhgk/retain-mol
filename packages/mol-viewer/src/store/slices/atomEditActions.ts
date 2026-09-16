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
  runRemoveHydrogensCommand,
  runAddAtomCommand,
  runGrowFromHydrogenCommand,
  runRemoveAtomCommand,
  runRemoveAtomsCommand,
  runReplaceAtomCommand,
  runReplaceAtomsCommand,
  runSetAtomChargeCommand,
  runSetAtomChargesCommand,
  runSetAtomRadicalCommand,
  runSetChiralityCommand,
  runFlipChiralityCommand,
  getFlipChiralityAvailabilityCommand,
} from '../../lib/builder/commands/atom'

type AtomEditActions = Pick<
  EditSlice,
  | 'addAtom'
  | 'removeAtom'
  | 'addHydrogens'
  | 'removeHydrogens'
  | 'canAddOneHydrogen'
  | 'canAddOneHydrogens'
  | 'addOneHydrogen'
  | 'addOneHydrogens'
  | 'replaceAtom'
  | 'replaceAtoms'
  | 'removeAtoms'
  | 'setAtomCharge'
  | 'setAtomCharges'
  | 'setAtomRadical'
  | 'setChirality'
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

    removeHydrogens: (options) => {
      const state = get()
      const mol = getActiveMol(state)
      if (!mol) return
      // onlySelected 且有选中：只去选中原子上的 H；否则全部分子
      const selected = [...state.selectedAtomIds]
      const targets = options?.onlySelected === true && selected.length > 0
        ? selected
        : undefined
      set((s) =>
        applyActiveMoleculeEdit(s, (current) =>
          runRemoveHydrogensCommand(current, targets),
        ),
      )
    },

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

    setAtomCharges: (atomIds, charge) =>
      set((s) =>
        applyActiveMoleculeEdit(s, (mol) =>
          runSetAtomChargesCommand(mol, atomIds, charge),
        ),
      ),

    setChirality: (atomId, chirality) =>
      applyActiveMoleculeEditWithMeta(
        get,
        set,
        (mol) => runSetChiralityCommand(mol, atomId, chirality),
        () => ({}),
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
