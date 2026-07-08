import { useEffect } from 'react'
import { useStore } from 'zustand'
import { handleEditorShortcut } from '@/domain/editorCommands'
import { useMoleculeTemporal } from '@/domain/viewerAdapter'

export function useAppKeyboardShortcuts(openSearch: () => void) {
  const { undo, redo } = useStore(useMoleculeTemporal)

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      handleEditorShortcut(event, { undo, redo, openSearch })
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [undo, redo, openSearch])
}
