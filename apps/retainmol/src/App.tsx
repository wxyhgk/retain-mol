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
  jobPath,
  resolveAppRoute,
  resolveJobEditorRoute,
  resolveJobId,
  resolveJobsBucket,
  resolveWorkflowEditRoute,
  workflowPath,
} from '@/app/appRoute'
import {
  PlatformDashboard,
  PlatformJobsPage,
  PlatformShell,
  PlatformWorkflowsPage,
} from '@/features/platform'
import { ShelfWorkflowLab } from '@retainmol/jobs'
import { ComponentGalleryPage } from '@/dev/components-gallery/ComponentGalleryPage'

export type WorkspaceMode = 'build' | 'analyze' | 'simulate'

export default function App() {
  const uiTheme = useUiThemeStore(state => state.theme)
  const palette = useUiPaletteStore(state => state.palette)
  const [showInspector, setShowInspector] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>('build')
  const [location, setLocation] = useState(() => ({
    pathname: window.location.pathname,
    search: window.location.search,
  }))
  const openSearch = useCallback(() => setSearchOpen(true), [])
  const closeSearch = useCallback(() => setSearchOpen(false), [])
  const toggleInspector = useCallback(() => setShowInspector(value => !value), [])
  const navigate = useCallback((nextPath: string) => {
    window.history.pushState({}, '', nextPath)
    setLocation({ pathname: window.location.pathname, search: window.location.search })
  }, [])

  useEffect(() => {
    const onPopState = () => setLocation({
      pathname: window.location.pathname,
      search: window.location.search,
    })
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
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

  const route = resolveAppRoute(location.pathname)

  if (route === 'templates') {
    return <TemplateStudioPage onClose={() => navigate('/editor')} />
  }

  if (route === 'lab') {
    if (location.pathname.startsWith('/lab/components')) {
      return (
        <div className="h-screen overflow-y-auto bg-background text-foreground">
          <ComponentGalleryPage onBack={() => navigate('/jobs')} />
        </div>
      )
    }
    return (
      <div className="h-screen bg-background text-foreground">
        <ShelfWorkflowLab onBack={() => navigate('/jobs')} />
      </div>
    )
  }

  if (route === 'editor') {
    const workflowEditSession = resolveWorkflowEditRoute(location.search)
    const jobEditSession = resolveJobEditorRoute(location.search)
    return (
      <AppShell
        showInspector={showInspector}
        searchOpen={searchOpen}
        workspaceMode={workspaceMode}
        onToggleInspector={toggleInspector}
        onWorkspaceModeChange={setWorkspaceMode}
        onOpenTemplateStudio={() => navigate('/templates/new')}
        onOpenSearch={openSearch}
        onCloseSearch={closeSearch}
        workflowEditSession={workflowEditSession}
        jobEditSession={jobEditSession}
        onCloseWorkflowEdit={workflowId => navigate(workflowPath(workflowId))}
        onCloseJobEdit={jobId => navigate(jobPath(jobId))}
      />
    )
  }

  return <PlatformShell route={route} onNavigate={navigate}>
    {route === 'dashboard' && <PlatformDashboard onNavigate={navigate} />}
    {route === 'jobs' && <PlatformJobsPage jobId={resolveJobId(location.pathname)} initialBucket={resolveJobsBucket(location.search)} onNavigate={navigate} />}
    {route === 'workflows' && (
      <PlatformWorkflowsPage
        initialWorkflowId={new URLSearchParams(location.search).get('workflowId')}
        onNavigate={navigate}
      />
    )}
  </PlatformShell>
}
