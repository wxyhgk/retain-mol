import { lazy, Suspense } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import type { AppShellProps } from './AppShell'
import type { AppShellModel } from './useAppShellModel'
import Toolbar from '@/components/toolbar/Toolbar'
import { RightPanel } from '@/components/panels'
import PubChemSearch from '@/components/search/PubChemSearch'
import { MolViewer } from '@/domain/viewer/viewport'
import { BusyOverlay } from './BusyOverlay'
import { SelectionHud } from './SelectionHud'
import { StatusBar } from './StatusBar'
import { ViewportToolbar } from './ViewportToolbar'
import { JobEditorLoadSession, SimulationWorkspace, resolveOptimizedJobStructure } from '@retainmol/jobs'
import { selectActiveMoleculeOrEmpty, useMoleculeStore } from '@/domain/viewer/moleculeState'
import { useEditorStore } from '@/domain/viewer/editorState'
import { editorHostPort } from '@/domain/viewer/editorHostPort'
import type { JobArtifact, JobDetail } from '@retainmol/jobs'
import { useMoleculeDocumentStore } from '@/features/molecule-assets'
import { WorkflowJobEditSession } from '@/features/workflow-job-edit'
import { useViewportStore } from '@/domain/viewer/viewportStore'
import { useBuildPaletteController } from '@/features/build-palette/model/useBuildPaletteController'

const AnalysisWorkspace = lazy(() => import('@/features/analysis').then(module => ({ default: module.AnalysisWorkspace })))
const WorkflowEditor = lazy(() => import('@/features/workflows').then(module => ({ default: module.WorkflowEditor })))
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
  onWorkspaceModeChange,
  onOpenTemplateStudio,
  onOpenSearch,
  onCloseSearch,
  canvasFocus,
  uiTheme,
  workspaceMode,
  workflowEditSession,
  jobEditSession,
  onCloseWorkflowEdit,
  onCloseJobEdit,
}: AppShellViewProps) {
  const activeMolecule = useMoleculeStore(selectActiveMoleculeOrEmpty)
  const activeObjectId = useMoleculeStore(state => state.activeObjectId)
  const documentBinding = useMoleculeDocumentStore(state => (
    activeObjectId ? state.bindingsByObjectId[activeObjectId] : undefined
  ))
  const pendingRevisionMetadata = useMoleculeDocumentStore(state => (
    activeObjectId ? state.pendingRevisionMetadataByObjectId[activeObjectId] : undefined
  ))
  const jobStructure = {
    name: activeMolecule.name,
    atoms: activeMolecule.atoms.map(atom => ({
      id: atom.id,
      symbol: atom.symbol,
      x: atom.x,
      y: atom.y,
      z: atom.z,
    })),
  }
  const loadOptimizedStructure = (artifact: JobArtifact, job: JobDetail) => {
    const store = useMoleculeStore.getState()
    const targetObjectId = store.activeObjectId
    const result = resolveOptimizedJobStructure(artifact, job, selectActiveMoleculeOrEmpty(store))
    if (result.ok === false) {
      useEditorStore.getState().flashHint(result.message)
      return
    }
    store.setMolecule(result.molecule)
    if (targetObjectId) {
      useMoleculeDocumentStore.getState().setPendingRevisionMetadata(targetObjectId, {
        derivedFromJobId: job.id,
        derivedFromArtifactId: artifact.id,
        ...(job.request && 'moleculeRevisionId' in job.request
          ? { sourceRevisionId: job.request.moleculeRevisionId }
          : {}),
      })
    }
    useEditorStore.getState().flashHint(result.restoredSnapshot ? '已载入任务分子与 xTB 优化坐标' : '已载入 xTB 优化坐标')
  }
  const gridVisible = useViewportStore(state => state.gridVisible)
  const hasLeftWorkspace = workspaceMode === 'simulate' || workspaceMode === 'analyze'
  const leftDefaultSize = workspaceMode === 'simulate' ? 38 : workspaceMode === 'analyze' ? 32 : 28
  const buildController = useBuildPaletteController()
  const showRightPanel = showInspector || buildController.workspaceTool === 'draw'
  return (
    <div
      className="flex h-dvh w-full flex-col overflow-hidden bg-background text-foreground"
      data-canvas-interacting={canvasFocus.interacting ? 'true' : 'false'}
    >
      <Toolbar
        showInspector={showInspector}
        workspaceMode={workspaceMode}
        onToggleInspector={onToggleInspector}
        onWorkspaceModeChange={onWorkspaceModeChange}
        onOpenTemplateStudio={onOpenTemplateStudio}
        onSearchOpen={onOpenSearch}
      />
      {searchOpen && <PubChemSearch onClose={onCloseSearch} />}

      <div className="relative flex min-h-0 flex-1 overflow-hidden bg-muted">
        <PanelGroup
          direction="horizontal"
          autoSaveId="retainmol-chem3d"
          className="flex min-h-0 flex-1"
        >
          {hasLeftWorkspace ? (
            <>
              <Panel
                defaultSize={leftDefaultSize}
                minSize={22}
                maxSize={50}
                className="min-h-0 min-w-0 overflow-hidden border-r border-border bg-card"
              >
                {workspaceMode === 'simulate' ? (
                  <SimulationWorkspace
                    structure={jobStructure}
                    molecule={activeMolecule}
                    objectId={activeObjectId}
                    documentBinding={documentBinding ?? null}
                    revisionMetadata={pendingRevisionMetadata}
                    onLoadOptimizedStructure={loadOptimizedStructure}
                    workflowEditor={WorkflowEditor}
                  />
                ) : (
                  <Suspense fallback={<div className="grid h-full place-items-center text-xs text-muted-foreground">加载分析模块</div>}>
                    <AnalysisWorkspace />
                  </Suspense>
                )}
              </Panel>
              <ResizeHandle />
            </>
          ) : (
            <>
              <Panel defaultSize={48} minSize={25} className="min-h-0 min-w-0 overflow-hidden border-r border-border bg-white">
                <Suspense fallback={<div className="grid h-full place-items-center text-xs text-muted-foreground">加载 2D 编辑器…</div>}>
                  <KetcherPanel />
                </Suspense>
              </Panel>
              <ResizeHandle />
            </>
          )}

            <Panel minSize={30} className="relative min-h-0 min-w-0 overflow-hidden bg-muted">
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

            {showRightPanel && (
              <>
                <ResizeHandle />
                <Panel
                  defaultSize={22}
                  minSize={18}
                  maxSize={38}
                  className="min-h-0 min-w-0 overflow-hidden border-l border-border bg-card"
                >
                  <RightPanel workspaceMode={workspaceMode} />
                </Panel>
              </>
            )}
          </PanelGroup>

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
