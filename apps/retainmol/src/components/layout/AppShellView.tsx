import { lazy, Suspense } from 'react'
import type { AppShellProps } from './AppShell'
import type { AppShellModel } from './useAppShellModel'
import Toolbar from '@/components/toolbar/Toolbar'
import { ToolStrip } from '@/features/build-palette'
import { RightPanel } from '@/components/panels'
import PubChemSearch from '@/components/search/PubChemSearch'
import { MolViewer } from '@/domain/viewer/viewport'
import { BusyOverlay } from './BusyOverlay'
import { SelectionHud } from './SelectionHud'
import { StatusBar } from './StatusBar'
import { ViewportToolbar } from './ViewportToolbar'
import { JobEditorLoadSession, SimulationWorkspace, resolveOptimizedJobStructure } from '@/features/jobs'
import { selectActiveMoleculeOrEmpty, useMoleculeStore } from '@/domain/viewer/moleculeState'
import { useEditorStore } from '@/domain/viewer/editorState'
import type { JobArtifact, JobDetail } from '@/features/jobs'
import { useMoleculeDocumentStore } from '@/features/molecule-assets'
import { WorkflowJobEditSession } from '@/features/workflow-job-edit'

const AnalysisWorkspace = lazy(() => import('@/features/analysis').then(module => ({ default: module.AnalysisWorkspace })))

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

      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        <div className="relative z-30 h-full w-[72px] shrink-0">
          <ToolStrip onToggleInspector={onToggleInspector} />
        </div>
        <main
          className="relative h-full min-w-0 flex-1 overflow-hidden bg-muted"
          onPointerDownCapture={event => canvasFocus.begin(event.target)}
          onPointerUpCapture={canvasFocus.finish}
          onPointerCancelCapture={canvasFocus.finish}
          onWheelCapture={event => canvasFocus.pulse(event.target)}
        >
          <div className="absolute inset-0"><MolViewer appearance={uiTheme} gridVisible={false} /></div>
          <SelectionHud />
          <BusyOverlay />
          <ViewportToolbar />
          <StatusBar />

          {workflowEditSession && (
            <WorkflowJobEditSession
              key={`${workflowEditSession.workflowId}:${workflowEditSession.jobId}`}
              workflowId={workflowEditSession.workflowId}
              jobId={workflowEditSession.jobId}
              onClose={onCloseWorkflowEdit}
            />
          )}

          {jobEditSession && !workflowEditSession && (
            <JobEditorLoadSession
              key={`${jobEditSession.jobId}:${jobEditSession.artifactId ?? 'input'}`}
              jobId={jobEditSession.jobId}
              artifactId={jobEditSession.artifactId}
              onClose={onCloseJobEdit}
            />
          )}

          {workspaceMode === 'simulate' && (
            <aside
              data-workspace-floating="true"
              className="absolute bottom-3 left-3 top-3 z-30 w-[min(980px,calc(100%-24px))] min-w-0 overflow-hidden rounded-lg border border-border bg-card/95 text-card-foreground shadow-[0_14px_34px_rgba(0,0,0,0.14)] backdrop-blur-md"
            >
              <SimulationWorkspace
                structure={jobStructure}
                molecule={activeMolecule}
                objectId={activeObjectId}
                documentBinding={documentBinding ?? null}
                revisionMetadata={pendingRevisionMetadata}
                onLoadOptimizedStructure={loadOptimizedStructure}
              />
            </aside>
          )}

          {workspaceMode === 'analyze' && (
            <aside
              data-workspace-floating="true"
              className="absolute bottom-3 left-3 top-3 z-30 w-[min(760px,calc(100%-24px))] min-w-0 overflow-hidden rounded-lg border border-border bg-card/95 text-card-foreground shadow-[0_14px_34px_rgba(0,0,0,0.14)] backdrop-blur-md"
            >
              <Suspense fallback={<div className="grid h-full place-items-center text-xs text-muted-foreground">加载分析模块</div>}>
                <AnalysisWorkspace />
              </Suspense>
            </aside>
          )}

          {showInspector && (
            <aside
              data-workspace-floating="true"
              className="absolute bottom-3 right-3 top-3 z-30 w-[min(340px,calc(100%-24px))] min-w-0 overflow-hidden rounded-lg border border-border bg-card/95 text-card-foreground shadow-[0_14px_34px_rgba(0,0,0,0.14)] backdrop-blur-md transition-opacity duration-75"
            >
              <RightPanel />
            </aside>
          )}
        </main>
      </div>
    </div>
  )
}
