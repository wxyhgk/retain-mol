import { AppShellView } from './AppShellView'
import { useAppShellModel } from './useAppShellModel'

export interface AppShellProps {
  showInspector: boolean
  searchOpen: boolean
  onToggleInspector: () => void
  onOpenTemplateStudio: () => void
  onOpenSearch: () => void
  onCloseSearch: () => void
}

export function AppShell({
  showInspector,
  searchOpen,
  onToggleInspector,
  onOpenTemplateStudio,
  onOpenSearch,
  onCloseSearch,
}: AppShellProps) {
  const model = useAppShellModel()

  return <AppShellView
    showInspector={showInspector}
    searchOpen={searchOpen}
    onToggleInspector={onToggleInspector}
    onOpenTemplateStudio={onOpenTemplateStudio}
    onOpenSearch={onOpenSearch}
    onCloseSearch={onCloseSearch}
    {...model}
  />
}
