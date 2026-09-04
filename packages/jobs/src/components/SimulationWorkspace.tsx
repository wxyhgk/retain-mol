import { Suspense, useState, type ComponentType } from 'react'
import { FlaskConical, GitBranch, LoaderCircle } from 'lucide-react'
import type { Molecule } from '@retainmol/mol-viewer/core'
import { Button } from '@retainmol/ui-kit'
import { cn } from '@retainmol/ui-kit'
import type { JobArtifact, JobDetail, XtbStructureInput } from '../domain/jobTypes'
import { useJobsQuery } from '../application/jobQueries'
import { JobWorkspacePanel } from './JobWorkspacePanel'
import type { MoleculeDocumentBinding } from '@retainmol/molecule-assets'

/** 工作流编辑器看到的任务摘要;由 app 侧的 workflows feature 按此结构接收。 */
export interface SimulationWorkflowJobRef {
  id: string
  name: string
  status: string
}

/**
 * 工作流编辑器组件由宿主 app 注入(通常是 lazy 后的 WorkflowEditor),
 * 避免 jobs 包反向依赖 app 的 workflows feature。
 */
export type SimulationWorkflowEditorComponent = ComponentType<{ jobs: SimulationWorkflowJobRef[] }>

export function SimulationWorkspace({
  structure,
  molecule,
  objectId,
  documentBinding,
  revisionMetadata,
  onLoadOptimizedStructure,
  workflowEditor: WorkflowEditor,
}: {
  structure?: XtbStructureInput
  molecule?: Molecule
  objectId?: string | null
  documentBinding?: MoleculeDocumentBinding | null
  revisionMetadata?: Readonly<Record<string, unknown>>
  onLoadOptimizedStructure?: (artifact: JobArtifact, job: JobDetail) => void | Promise<void>
  workflowEditor: SimulationWorkflowEditorComponent
}) {
  const [view, setView] = useState<'jobs' | 'workflow'>('jobs')
  const jobsQuery = useJobsQuery()
  return (
    <div className="flex h-full min-h-0 flex-col bg-card">
      <div className="flex h-10 shrink-0 items-center gap-1 border-b border-border p-1">
        <Button size="sm" variant={view === 'jobs' ? 'default' : 'ghost'} className="h-8" onClick={() => setView('jobs')}><FlaskConical />任务</Button>
        <Button size="sm" variant={view === 'workflow' ? 'default' : 'ghost'} className="h-8" onClick={() => setView('workflow')}><GitBranch />工作流</Button>
        <span className={cn('ml-auto pr-2 text-[10px] text-muted-foreground', jobsQuery.isFetching && 'animate-pulse')}>{jobsQuery.data?.length ?? 0} jobs</span>
      </div>
      <div className="min-h-0 flex-1">
        {view === 'jobs' ? (
          <JobWorkspacePanel
            structure={structure}
            molecule={molecule}
            objectId={objectId}
            documentBinding={documentBinding}
            revisionMetadata={revisionMetadata}
            onLoadOptimizedStructure={onLoadOptimizedStructure}
          />
        ) : (
          <Suspense fallback={<div className="grid h-full place-items-center text-xs text-muted-foreground"><LoaderCircle className="animate-spin" />加载工作流</div>}>
            <WorkflowEditor jobs={(jobsQuery.data ?? []).map(job => ({ id: job.id, name: job.name, status: job.status }))} />
          </Suspense>
        )}
      </div>
    </div>
  )
}
