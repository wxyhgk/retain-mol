import { useMemo } from 'react'
import { useJobsQuery } from '@retainmol/jobs'
import { WorkflowEditor } from '@/features/workflows'
import { workflowEditorPath } from '@/app/appRoute'

export function PlatformWorkflowsPage({
  initialWorkflowId,
  onNavigate,
}: {
  initialWorkflowId?: string | null
  onNavigate: (path: string) => void
}) {
  const jobsQuery = useJobsQuery()
  const jobs = useMemo(() => (jobsQuery.data ?? []).map(job => ({ id: job.id, name: job.name, status: job.status })), [jobsQuery.data])
  const tsPreparationSources = useMemo(() => (jobsQuery.data ?? [])
    .filter(job => job.status === 'succeeded')
    .map(job => ({
      id: job.id,
      name: job.name,
      artifacts: (job.artifacts ?? [])
        .filter(artifact => artifact.role === 'output'
          && Boolean(artifact.sha256)
          && ['xyz', 'sdf', 'mol', 'retainmol-json'].includes(artifact.format.toLowerCase()))
        .map(artifact => ({ id: artifact.id, name: artifact.name, format: artifact.format })),
    }))
    .filter(job => job.artifacts.length > 0), [jobsQuery.data])

  return (
    <div className="h-full p-4">
      <WorkflowEditor
        jobs={jobs}
        tsPreparationSources={tsPreparationSources}
        className="h-full"
        initialWorkflowId={initialWorkflowId}
        onEditJobStructure={(workflowId, jobId) => onNavigate(workflowEditorPath(workflowId, jobId))}
      />
    </div>
  )
}
