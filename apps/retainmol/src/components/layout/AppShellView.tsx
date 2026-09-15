import { lazy, Suspense } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import type { AppShellProps } from './AppShell'
import type { AppShellModel } from './useAppShellModel'
import Toolbar from '@/components/toolbar/Toolbar'
import { FloatingInspector } from '@/components/panels/FloatingInspector'
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
import { useBuildPaletteController } from '@/features/build-palette/model/useBuildPaletteController'

const KetcherPanel = lazy(() => import('@/features/ketcher').then(m => ({ default: m.KetcherPanel })))

function ResizeHandle() {
  return (
    <PanelResizeHandle className="group flex w-2 shrink-0 items-center justify-center bg-transparent focus-visible:outline-none">
      <div className="h-full w-px bg-border transition-colors group-data-[resize-handle-state=hover]:bg-foreground/30 group-data-[resize-handle-state=drag]:bg-foreground/50 group-focus-visible:bg-ring" />
    </PanelResizeHandle>
  )
}

type AppShellViewProps = AppShellProps & AppShellModel

export function AppShellView({
  showInspector,
  searchOpen,
  onToggleInspector,
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
  const buildController = useBuildPaletteController()
  // 悬浮窗承载全部 RightPanel 职责：Draw / Inspector / Scene / Display
  // 展开条件：检查器按钮 或 Draw 工具激活时（与旧版 showRightPanel 逻辑一致）
  const showFloating = showInspector || buildController.workspaceTool === 'draw'
  const handleFloatingClose = () => {
    if (showInspector) onToggleInspector()
    if (buildController.workspaceTool === 'draw') buildController.closePanel()
  }
  return (
    <div
      className="flex h-dvh w-full flex-col overflow-hidden bg-background text-foreground"
      data-canvas-interacting={canvasFocus.interacting ? 'true' : 'false'}
    >
      <Toolbar
        showInspector={showInspector}
        onToggleInspector={onToggleInspector}
        onOpenTemplateStudio={onOpenTemplateStudio}
        onSearchOpen={onOpenSearch}
      />
      {searchOpen && <PubChemSearch onClose={onCloseSearch} />}

      <div className="relative flex min-h-0 flex-1 overflow-hidden bg-background">
        <PanelGroup
          direction="horizontal"
          autoSaveId="retainmol-chem3d"
          className="flex min-h-0 flex-1"
        >
          <Panel defaultSize={48} minSize={25} className="min-h-0 min-w-0 overflow-hidden border-r border-border bg-white">
            <Suspense fallback={<div className="grid h-full place-items-center text-xs text-muted-foreground">加载 2D 编辑器…</div>}>
              <KetcherPanel />
            </Suspense>
          </Panel>
          <ResizeHandle />

            <Panel minSize={30} className="relative min-h-0 min-w-0 overflow-hidden bg-background">
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
          {/* 顶层悬浮：承载全部 RightPanel（Draw / Inspector / Scene / Display），不参与 PanelGroup 布局，z-[80] 压盖画布 */}
          <FloatingInspector open={showFloating} onClose={handleFloatingClose} />

          {workflowEditSession && (
            <div className="absolute inset-0 z-30 bg-background">
              <WorkflowJobEditSession
                key={`${workflowEditSession.workflowId}:${workflowEditSession.jobId}`}
                workflowId={workflowEditSession.workflowId}
                jobId={workflowEditSession.jobId}
                onClose={onCloseWorkflowEdit}
              />
            </div>
          )}

          {jobEditSession && !workflowEditSession && (
            <div className="absolute inset-0 z-30 bg-background">
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
