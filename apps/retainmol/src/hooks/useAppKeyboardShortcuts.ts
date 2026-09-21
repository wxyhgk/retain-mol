import { useEffect } from 'react'
import { handleEditorShortcut } from '@/domain/editorCommands'
import { useMoleculeHistory } from '@/domain/viewer/history'

export function useAppKeyboardShortcuts() {
  const { undo, redo } = useMoleculeHistory()

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      handleEditorShortcut(event, { undo, redo })
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [undo, redo])
}
