import { lazy, Suspense } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import type { AppShellProps } from './AppShell'
import type { AppShellModel } from './useAppShellModel'
import Toolbar from '@/components/toolbar/Toolbar'
import { InspectorPanel } from '@/components/panels/InspectorPanel'
import { useInspectorLayout } from './useInspectorLayout'
import PubChemSearch from '@/components/search/PubChemSearch'
import { MolViewer } from '@/domain/viewer/viewport'
import { BusyOverlay } from './BusyOverlay'
import { SelectionHud } from './SelectionHud'
import { StatusBar } from './StatusBar'
import { ViewportToolbar } from './ViewportToolbar'
import { JobEditorLoadSession } from '@retainmol/jobs'
import { editorHostPort } from '@/domain/viewer/editorHostPort'
import { WorkflowJobEditSession } from '@/features/workflow-job-edit'
import { useViewportStore } from '@/domain/viewer/viewportStore'

const KetcherPanel = lazy(() => import('@/features/ketcher').then(m => ({ default: m.KetcherPanel })))

function ResizeHandle({ label }: { label: string }) {
  return (
    <PanelResizeHandle aria-label={label} className="group flex w-2 shrink-0 items-center justify-center bg-transparent focus-visible:outline-none">
      <div className="h-full w-px bg-border transition-colors group-data-[resize-handle-state=hover]:bg-foreground/30 group-data-[resize-handle-state=drag]:bg-foreground/50 group-focus-visible:bg-ring" />
    </PanelResizeHandle>
  )
}

type AppShellViewProps = AppShellProps & AppShellModel

export function AppShellView({
  searchOpen,
  onOpenTemplateStudio,
  onOpenSearch,
  onCloseSearch,
  canvasFocus,
  uiTheme,
  workflowEditSession,
  jobEditSession,
  onCloseWorkflowEdit,
  onCloseJobEdit,
}: AppShellViewProps) {
  const gridVisible = useViewportStore(state => state.gridVisible)
  const inspector = useInspectorLayout()
  return (
    <div
      className="flex h-dvh w-full flex-col overflow-hidden bg-background text-foreground"
      data-canvas-interacting={canvasFocus.interacting ? 'true' : 'false'}
    >
      <Toolbar
        showInspector={inspector.open}
        onToggleInspector={inspector.toggle}
        onOpenTemplateStudio={onOpenTemplateStudio}
        onSearchOpen={onOpenSearch}
      />
      {searchOpen && <PubChemSearch onClose={onCloseSearch} />}

      <div className="relative flex min-h-0 flex-1 overflow-hidden bg-background">
        <PanelGroup direction="horizontal" autoSaveId="retainmol-workspace-dock" className="min-h-0 flex-1">
          <Panel id="workspace" order={1} minSize={60} defaultSize={100 - inspector.defaultSize}>
            <PanelGroup direction="horizontal" autoSaveId="retainmol-chem3d" className="flex min-h-0 flex-1">
              <Panel id="editor-2d" order={1} defaultSize={48} minSize={25} className="min-h-0 min-w-0 overflow-hidden border-r border-border bg-white">
                <div data-shortcuts="local" className="h-full">
                  <Suspense fallback={<div className="grid h-full place-items-center text-xs text-muted-foreground">加载 2D 编辑器…</div>}>
                    <KetcherPanel />
                  </Suspense>
                </div>
              </Panel>
              <ResizeHandle label="调整 2D 与 3D 视图宽度" />
              <Panel id="editor-3d" order={2} minSize={30} className="relative min-h-0 min-w-0 overflow-hidden bg-background">
                <div
                  className="relative h-full w-full overflow-hidden pb-6"
                  onPointerDownCapture={event => canvasFocus.begin(event.target)}
                  onPointerUpCapture={canvasFocus.finish}
                  onPointerCancelCapture={canvasFocus.finish}
                  onWheelCapture={event => canvasFocus.pulse(event.target)}
                >
                  <div className="absolute inset-0"><MolViewer appearance={uiTheme} gridVisible={gridVisible} /></div>
                  <SelectionHud />
                  <BusyOverlay />
                  <ViewportToolbar />
                  <StatusBar />
                </div>
              </Panel>
            </PanelGroup>
          </Panel>
          {!inspector.compact && inspector.open && <ResizeHandle label="调整检查器宽度" />}
          {!inspector.compact && inspector.open && (
            <Panel id="inspector" order={2} minSize={inspector.minSize} maxSize={inspector.maxSize} defaultSize={inspector.defaultSize}>
              <InspectorPanel compact={false} open onClose={inspector.close} />
            </Panel>
          )}
        </PanelGroup>
        {inspector.compact && <InspectorPanel compact open={inspector.open} onClose={inspector.close} />}

          {workflowEditSession && (
            <div data-shortcut-overlay="true" className="absolute inset-0 z-30 bg-background">
              <WorkflowJobEditSession
                key={`${workflowEditSession.workflowId}:${workflowEditSession.jobId}`}
                workflowId={workflowEditSession.workflowId}
                jobId={workflowEditSession.jobId}
                onClose={onCloseWorkflowEdit}
              />
            </div>
          )}

          {jobEditSession && !workflowEditSession && (
            <div data-shortcut-overlay="true" className="absolute inset-0 z-30 bg-background">
              <JobEditorLoadSession
                key={`${jobEditSession.jobId}:${jobEditSession.artifactId ?? 'input'}`}
                jobId={jobEditSession.jobId}
                artifactId={jobEditSession.artifactId}
                editorHost={editorHostPort}
                onClose={onCloseJobEdit}
              />
            </div>
          )}
        </div>
    </div>
  )
}
