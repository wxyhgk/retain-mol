import type { EditSlice } from './types'
import type { EditActionContext } from './editActionTypes'
import {
  applyActiveMoleculeEditWithMeta,
  selectActiveMoleculeOrEmpty,
} from './helpers'
import { PLACEMENT } from '../../config/interaction.config'
import {
  runCopySelectionCommand,
  runPasteAtomsCommand,
} from '../../lib/builder/commands/clipboardStoreCommands'

type ClipboardEditActions = Pick<EditSlice, 'pasteAtoms' | 'copySelection'>

export function createClipboardEditActions({
  get,
  set,
}: EditActionContext): ClipboardEditActions {
  return {
    pasteAtoms: (clipboard) => {
      const result = applyActiveMoleculeEditWithMeta<{
        newAtomIds: string[]
      }>(
        get,
        set,
        (mol) => runPasteAtomsCommand(mol, clipboard, PLACEMENT.pasteOffsetX),
        (commandResult) => ({ newAtomIds: commandResult.newAtomIds ?? [] }),
      )
      return result.ok ? result.newAtomIds : []
    },

    copySelection: () => {
      const s = get()
      const mol = selectActiveMoleculeOrEmpty(s)
      return runCopySelectionCommand(mol, s.selectedAtomIds).clipboard
    },
  }
}
