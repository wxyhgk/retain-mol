import type { EditSlice } from './types'
import type { EditActionContext } from './editActionTypes'
import { applyActiveMoleculeSelectionCommand } from './helpers'
import { runRemoveSelectedCommand } from '../../lib/builder/commands/interaction'

type SelectionEditActions = Pick<EditSlice, 'removeSelected'>

export function createSelectionEditActions({
  get,
  set,
}: EditActionContext): SelectionEditActions {
  return {
    removeSelected: () => {
      const s = get()
      if (s.selectedAtomIds.size === 0 && s.selectedBondIds.size === 0) return
      applyActiveMoleculeSelectionCommand(get, set, runRemoveSelectedCommand)
    },
  }
}
