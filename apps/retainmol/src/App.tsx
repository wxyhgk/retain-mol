import { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { AppShell } from '@/components/layout'
import { useAppClipboardShortcuts } from '@/hooks/useAppClipboardShortcuts'
import { useAppKeyboardShortcuts } from '@/hooks/useAppKeyboardShortcuts'
import {
  TemplateStudioPage,
} from '@/features/template-studio'
import { useUiThemeStore } from '@/domain/uiThemeStore'

export default function App() {
  const uiTheme = useUiThemeStore(state => state.theme)
  const [showInspector, setShowInspector] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [pathname, setPathname] = useState(() => window.location.pathname)
  const openSearch = useCallback(() => setSearchOpen(true), [])
  const closeSearch = useCallback(() => setSearchOpen(false), [])
  const toggleInspector = useCallback(() => setShowInspector(value => !value), [])
  const navigate = useCallback((nextPath: string) => {
    window.history.pushState({}, '', nextPath)
    setPathname(nextPath)
  }, [])

  useEffect(() => {
    const onPopState = () => setPathname(window.location.pathname)
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', uiTheme === 'night')
    document.documentElement.style.colorScheme = uiTheme === 'night' ? 'dark' : 'light'
  }, [uiTheme])

  useAppClipboardShortcuts()
  useAppKeyboardShortcuts(openSearch)

  if (pathname.startsWith('/templates')) {
    return <TemplateStudioPage onClose={() => navigate('/')} />
  }

  return (
    <AppShell
      showInspector={showInspector}
      searchOpen={searchOpen}
      onToggleInspector={toggleInspector}
      onOpenTemplateStudio={() => navigate('/templates/new')}
      onOpenSearch={openSearch}
      onCloseSearch={closeSearch}
    />
  )
}
