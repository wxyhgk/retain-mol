import { useEffect } from 'react'
import { isWorkspaceShortcutBlocked } from '@/domain/shortcutScope'
import { isMoleculeHistoryTracking } from '@/domain/viewer/history'
import {
  copySelectionToEditorClipboard,
  pasteEditorClipboard,
} from '@/domain/editorCommands'
import { pasteMoleculeText } from '@/features/molecule-placement'

export function useAppClipboardShortcuts() {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (isWorkspaceShortcutBlocked(event) || !isMoleculeHistoryTracking()) return
      if (!(event.metaKey || event.ctrlKey) || event.key !== 'c') return
      if (!copySelectionToEditorClipboard()) return
      event.preventDefault()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    const handler = (event: ClipboardEvent) => {
      if (isWorkspaceShortcutBlocked(event) || !isMoleculeHistoryTracking()) return
      if (pasteEditorClipboard()) {
        event.preventDefault()
        return
      }
      if (pasteMoleculeText(event.clipboardData?.getData('text'))) {
        event.preventDefault()
      }
    }
    window.addEventListener('paste', handler)
    return () => window.removeEventListener('paste', handler)
  }, [])
}
