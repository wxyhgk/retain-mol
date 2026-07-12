import { useEffect } from 'react'
import {
  copySelectionToEditorClipboard,
  isTextEditingTarget,
  pasteEditorClipboard,
} from '@/domain/editorCommands'
import { pasteMoleculeText } from '@/features/molecule-placement'

export function useAppClipboardShortcuts() {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (isTextEditingTarget(event.target)) return
      if (!(event.metaKey || event.ctrlKey) || event.key !== 'c') return
      if (!copySelectionToEditorClipboard()) return
      event.preventDefault()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    const handler = (event: ClipboardEvent) => {
      if (isTextEditingTarget(event.target)) return
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
