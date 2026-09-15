import { AppShellView } from './AppShellView'
import { useAppShellModel } from './useAppShellModel'
import type { JobEditorRouteState, WorkflowEditRouteState } from '@/app/appRoute'

export interface AppShellProps {
  showInspector: boolean
  searchOpen: boolean
  onToggleInspector: () => void
  onOpenTemplateStudio: () => void
  onOpenSearch: () => void
  onCloseSearch: () => void
  workflowEditSession: WorkflowEditRouteState | null
  jobEditSession: JobEditorRouteState | null
  onCloseWorkflowEdit: (workflowId: string) => void
  onCloseJobEdit: (jobId: string) => void
}

export function AppShell({
  showInspector,
  searchOpen,
  onToggleInspector,
  onOpenTemplateStudio,
  onOpenSearch,
  onCloseSearch,
  workflowEditSession,
  jobEditSession,
  onCloseWorkflowEdit,
  onCloseJobEdit,
}: AppShellProps) {
  const model = useAppShellModel()

  return <AppShellView
    showInspector={showInspector}
    searchOpen={searchOpen}
    onToggleInspector={onToggleInspector}
    onOpenTemplateStudio={onOpenTemplateStudio}
    onOpenSearch={onOpenSearch}
    onCloseSearch={onCloseSearch}
    workflowEditSession={workflowEditSession}
    jobEditSession={jobEditSession}
    onCloseWorkflowEdit={onCloseWorkflowEdit}
    onCloseJobEdit={onCloseJobEdit}
    {...model}
  />
}
