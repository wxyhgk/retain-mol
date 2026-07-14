import { AppShellView } from './AppShellView'
import { useAppShellModel } from './useAppShellModel'
import type { WorkspaceMode } from '@/App'

export interface AppShellProps {
  showInspector: boolean
  searchOpen: boolean
  workspaceMode: WorkspaceMode
  onToggleInspector: () => void
  onWorkspaceModeChange: (mode: WorkspaceMode) => void
  onOpenTemplateStudio: () => void
  onOpenSearch: () => void
  onCloseSearch: () => void
}

export function AppShell({
  showInspector,
  searchOpen,
  workspaceMode,
  onToggleInspector,
  onWorkspaceModeChange,
  onOpenTemplateStudio,
  onOpenSearch,
  onCloseSearch,
}: AppShellProps) {
  const model = useAppShellModel()

  return <AppShellView
    showInspector={showInspector}
    searchOpen={searchOpen}
    workspaceMode={workspaceMode}
    onToggleInspector={onToggleInspector}
    onWorkspaceModeChange={onWorkspaceModeChange}
    onOpenTemplateStudio={onOpenTemplateStudio}
    onOpenSearch={onOpenSearch}
    onCloseSearch={onCloseSearch}
    {...model}
  />
}
