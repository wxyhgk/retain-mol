import { Eye, LoaderCircle, Play } from 'lucide-react'
import { Button, StatusPill } from '@retainmol/ui-kit'
import type { JobSummary } from '../../domain/jobTypes'
import type { ShelfMoleculeEntry } from '../../domain/shelf/jobMolecule'
import { workflowNodeStateLabel, type WorkflowNodeVisualState } from '../../domain/shelf/shelfNodeStyle'
import { JobCard } from '../cards/JobCard'

/**
 * 玻璃盒下方的"展签"：投影 DOM，按钮是真按钮。
 * 位置不走 React state——宿主在 rAF 里经 registerCard 拿到的元素直接写 transform，
 * 这样视差/滚动时展签逐帧贴着盒子走。
 */
export function ShelfOverlay({ jobs, molecules, registerCard, onOpenJob, onRunJob, runPendingJobId, nodeStates }: {
  jobs: readonly JobSummary[]
  molecules: Map<string, ShelfMoleculeEntry>
  registerCard: (jobId: string, element: HTMLDivElement | null) => void
  onOpenJob: (jobId: string) => void
  onRunJob: (jobId: string) => void
  runPendingJobId: string | null
  nodeStates?: Map<string, WorkflowNodeVisualState>
}) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {jobs.map(job => {
        const entry = molecules.get(job.id)
        const nodeState = nodeStates?.get(job.id)
        const runnable = !nodeState && (job.status === 'created' || job.status === 'queued')
        const runPending = runPendingJobId === job.id
        return (
          <div
            key={job.id}
            ref={element => registerCard(job.id, element)}
            className="absolute left-0 top-0 will-change-transform"
            style={{ visibility: 'hidden' }}
          >
            <JobCard
              job={job}
              variant="plaque"
              showId={false}
              showKind={false}
              {...(nodeState
                ? { statusOverride: <StatusPill label={workflowNodeStateLabel(nodeState)} size="sm" /> }
                : {})}
              {...(entry?.state === 'oversized'
                ? { metaExtra: <span className="text-[10px] text-muted-foreground">{entry.atomCount} 原子，未渲染</span> }
                : {})}
              actions={
                <span className="pointer-events-auto inline-flex items-center gap-1" onPointerDown={event => event.stopPropagation()}>
                  {runnable && (
                    <Button variant="outline" size="sm" className="h-6 px-2 text-[11px]" disabled={runPending} onClick={() => onRunJob(job.id)}>
                      {runPending ? <LoaderCircle className="animate-spin" /> : <Play />}运行
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-[11px]" onClick={() => onOpenJob(job.id)}>
                    <Eye />查看
                  </Button>
                </span>
              }
            />
          </div>
        )
      })}
    </div>
  )
}
