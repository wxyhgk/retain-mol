import { useCallback, useState } from 'react'
import { AppShell } from '@/components/layout'
import { useAppClipboardShortcuts } from '@/hooks/useAppClipboardShortcuts'
import { useAppKeyboardShortcuts } from '@/hooks/useAppKeyboardShortcuts'

export default function App() {
  const [showInspector, setShowInspector] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const openSearch = useCallback(() => setSearchOpen(true), [])
  const closeSearch = useCallback(() => setSearchOpen(false), [])
  const toggleInspector = useCallback(() => setShowInspector(value => !value), [])

  useAppClipboardShortcuts()
  useAppKeyboardShortcuts(openSearch)

  return (
    <AppShell
      showInspector={showInspector}
      searchOpen={searchOpen}
      onToggleInspector={toggleInspector}
      onOpenSearch={openSearch}
      onCloseSearch={closeSearch}
    />
  )
}
