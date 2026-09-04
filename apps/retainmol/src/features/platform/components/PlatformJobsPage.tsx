import { useMemo } from 'react'
import { jobEditorPath, jobPath, jobsPath, type JobsBucketParam } from '@/app/appRoute'
import {
  JobWorkbench,
  calculationLabel,
  formatJobDuration,
  jobStatusLabel,
  useJobsQuery,
  type WorkbenchGraphData,
  type WorkbenchGraphEdge,
} from '@retainmol/jobs'
import { useWorkflowsQuery, WorkflowReadOnlyCanvas } from '@/features/workflows'

const TERMINAL_STATUSES = new Set(['succeeded', 'failed', 'cancelled', 'interrupted'])

/** 把 workflow 引用投影成工作台中栏的依赖图;选中任务不属于任何 workflow 时返回 null。 */
function useWorkbenchGraph(jobId: string | null): WorkbenchGraphData | null {
  const jobsQuery = useJobsQuery()
  const workflowsQuery = useWorkflowsQuery()

  return useMemo(() => {
    if (!jobId) return null
    const summaries = new Map((jobsQuery.data ?? []).map(job => [job.id, job]))
    const workflows = (workflowsQuery.data ?? []).filter(workflow => workflow.jobIds.includes(jobId))
    if (workflows.length === 0) return null

    const nodeIds = new Set<string>()
    const edges: WorkbenchGraphEdge[] = []
    for (const workflow of workflows) {
      for (const id of workflow.jobIds) nodeIds.add(id)
      for (const ref of workflow.references) {
        edges.push({ sourceJobId: ref.sourceJobId, targetJobId: ref.targetJobId, label: ref.sourceName })
      }
    }
    const nodes = [...nodeIds].map(id => {
      const summary = summaries.get(id)
      if (!summary) {
        return { jobId: id, name: id, kindLabel: '—', status: 'created' as const, statusLabel: jobStatusLabel('created') }
      }
      return {
        jobId: id,
        name: summary.name,
        kindLabel: calculationLabel(summary.kind),
        kind: summary.kind,
        status: summary.status,
        statusLabel: jobStatusLabel(summary.status),
        elapsedLabel: formatJobDuration(summary.createdAt, TERMINAL_STATUSES.has(summary.status) ? summary.updatedAt : undefined),
        artifacts: summary.artifacts,
      }
    })
    return { nodes, edges }
  }, [jobId, jobsQuery.data, workflowsQuery.data])
}

export function PlatformJobsPage({ jobId, initialBucket, onNavigate }: {
  jobId: string | null
  initialBucket?: JobsBucketParam | null
  onNavigate: (path: string) => void
}) {
  const graph = useWorkbenchGraph(jobId)
  return (
    <JobWorkbench
      selectedJobId={jobId}
      onSelectJob={id => onNavigate(id ? jobPath(id) : jobsPath())}
      onOpenEditor={artifactId => onNavigate(jobId ? jobEditorPath(jobId, artifactId) : '/editor')}
      graph={graph}
      renderGraph={WorkflowReadOnlyCanvas}
      initialBucket={initialBucket}
    />
  )
}
