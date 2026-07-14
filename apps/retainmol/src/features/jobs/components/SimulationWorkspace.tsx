import { lazy, Suspense, useState } from 'react'
import { FlaskConical, GitBranch, LoaderCircle } from 'lucide-react'
import type { Molecule } from '@retainmol/mol-viewer/core'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { JobArtifact, JobDetail, XtbStructureInput } from '../domain/jobTypes'
import { useJobsQuery } from '../application/jobQueries'
import { JobWorkspacePanel } from './JobWorkspacePanel'

const WorkflowEditor = lazy(() => import('@/features/workflows').then(module => ({ default: module.WorkflowEditor })))

export function SimulationWorkspace({
  structure,
  molecule,
  onLoadOptimizedStructure,
}: {
  structure?: XtbStructureInput
  molecule?: Molecule
  onLoadOptimizedStructure?: (artifact: JobArtifact, job: JobDetail) => void | Promise<void>
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
          <JobWorkspacePanel structure={structure} molecule={molecule} onLoadOptimizedStructure={onLoadOptimizedStructure} />
        ) : (
          <Suspense fallback={<div className="grid h-full place-items-center text-xs text-muted-foreground"><LoaderCircle className="animate-spin" />加载工作流</div>}>
            <WorkflowEditor jobs={(jobsQuery.data ?? []).map(job => ({ id: job.id, name: job.name, status: job.status }))} />
          </Suspense>
        )}
      </div>
    </div>
  )
}
