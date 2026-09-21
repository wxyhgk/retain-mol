import { AppShellView } from './AppShellView'
import { useAppShellModel } from './useAppShellModel'
import type { JobEditorRouteState, WorkflowEditRouteState } from '@/app/appRoute'

export interface AppShellProps {
  searchOpen: boolean
  onOpenTemplateStudio: () => void
  onOpenSearch: () => void
  onCloseSearch: () => void
  workflowEditSession: WorkflowEditRouteState | null
  jobEditSession: JobEditorRouteState | null
  onCloseWorkflowEdit: (workflowId: string) => void
  onCloseJobEdit: (jobId: string) => void
}

export function AppShell({
  searchOpen,
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
    searchOpen={searchOpen}
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
