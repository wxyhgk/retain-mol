import { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { AppShell } from '@/components/layout'
import { useAppClipboardShortcuts } from '@/hooks/useAppClipboardShortcuts'
import { useAppKeyboardShortcuts } from '@/hooks/useAppKeyboardShortcuts'
import {
  TemplateStudioPage,
} from '@/features/template-studio'
import { useUiThemeStore } from '@/domain/uiThemeStore'
import { useUiPaletteStore } from '@/domain/uiPaletteStore'
import {
  resolveJobEditorRoute,
  resolveWorkflowEditRoute,
} from '@/app/appRoute'

export default function App() {
  const uiTheme = useUiThemeStore(state => state.theme)
  const palette = useUiPaletteStore(state => state.palette)
  const [showInspector, setShowInspector] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [location, setLocation] = useState(() => ({
    pathname: window.location.pathname,
    search: window.location.search,
  }))
  const [templateStudioOpen, setTemplateStudioOpen] = useState(false)
  const openSearch = useCallback(() => setSearchOpen(true), [])
  const closeSearch = useCallback(() => setSearchOpen(false), [])
  const toggleInspector = useCallback(() => setShowInspector(value => !value), [])
  const navigate = useCallback((nextPath: string) => {
    window.history.pushState({}, '', nextPath)
    setLocation({ pathname: window.location.pathname, search: window.location.search })
  }, [])

  // 单页：一切非 / 访问归一化到 /，编辑会话 query 原样保留
  useEffect(() => {
    const syncLocation = () => {
      if (window.location.pathname !== '/') {
        window.history.replaceState({}, '', `/${window.location.search}`)
      }
      setLocation({ pathname: window.location.pathname, search: window.location.search })
    }
    syncLocation()
    window.addEventListener('popstate', syncLocation)
    return () => window.removeEventListener('popstate', syncLocation)
  }, [])

  useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', uiTheme === 'night')
    document.documentElement.style.colorScheme = uiTheme === 'night' ? 'dark' : 'light'
  }, [uiTheme])

  useLayoutEffect(() => {
    document.documentElement.classList.toggle('heritage', palette === 'heritage')
  }, [palette])

  useAppClipboardShortcuts()
  useAppKeyboardShortcuts(openSearch)

  const workflowEditSession = resolveWorkflowEditRoute(location.search)
  const jobEditSession = resolveJobEditorRoute(location.search)
  return (
    <>
      <AppShell
        showInspector={showInspector}
        searchOpen={searchOpen}
        onToggleInspector={toggleInspector}
        onOpenTemplateStudio={() => setTemplateStudioOpen(true)}
        onOpenSearch={openSearch}
        onCloseSearch={closeSearch}
        workflowEditSession={workflowEditSession}
        jobEditSession={jobEditSession}
        onCloseWorkflowEdit={() => navigate('/')}
        onCloseJobEdit={() => navigate('/')}
      />
      {templateStudioOpen && (
        <div className="fixed inset-0 z-[100]">
          <TemplateStudioPage onClose={() => setTemplateStudioOpen(false)} />
        </div>
      )}
    </>
  )
}
