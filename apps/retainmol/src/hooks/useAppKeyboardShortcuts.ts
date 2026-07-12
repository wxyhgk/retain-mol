import { useEffect } from 'react'
import { handleEditorShortcut } from '@/domain/editorCommands'
import { useMoleculeHistory } from '@/domain/viewer/history'

export function useAppKeyboardShortcuts(openSearch: () => void) {
  const { undo, redo } = useMoleculeHistory()

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      handleEditorShortcut(event, { undo, redo, openSearch })
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [undo, redo, openSearch])
}
