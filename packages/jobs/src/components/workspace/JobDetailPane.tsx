import { FileInput, FileOutput, LoaderCircle, Play } from 'lucide-react'
import { Button } from '@retainmol/ui-kit'
import type { JobArtifact, JobDetail } from '../../domain/jobTypes'
import { JobManagementActions } from '../JobManagementActions'
import { JobStatusBadge } from '../JobStatusBadge'
import { JobParameterList } from '../shared/JobParameterList'
import { JobInputSource } from '../shared/JobInputSource'
import { JobArtifactList } from '../shared/JobArtifactList'

export function JobDetailPane({ job, onExecute, onLoad, isRunning }: {
  job: JobDetail
  onExecute: () => void
  onLoad?: (artifact: JobArtifact) => void
  isRunning: boolean
}) {
  const artifacts = job.artifacts ?? []
  return (
    <div className="space-y-4">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0"><h2 className="truncate text-sm font-semibold">{job.name}</h2><p className="mt-1 font-mono text-[10px] text-muted-foreground">{job.id}</p></div>
        <div className="flex items-center gap-1">
          <JobStatusBadge status={job.status} size="sm" />
          <JobManagementActions job={job} />
          <Button variant="outline" size="sm" className="h-7" onClick={onExecute} disabled={isRunning || job.status !== 'queued'}>{isRunning ? <LoaderCircle className="animate-spin" /> : <Play />}{isRunning ? '运行中' : '运行'}</Button>
        </div>
      </header>
      {job.description && <p className="text-xs leading-5 text-muted-foreground">{job.description}</p>}
      <JobParameterList job={job} variant="compact" />
      <JobInputSource job={job} />
      {job.error && <p className="text-xs text-destructive">{job.error}</p>}
      <JobArtifactList title="输入产物" icon={FileInput} density="compact" artifacts={artifacts.filter(item => item.role === 'input')} />
      <JobArtifactList
        title="输出产物"
        icon={FileOutput}
        density="compact"
        artifacts={artifacts.filter(item => item.role === 'output')}
        renderActions={onLoad
          ? artifact => artifact.format === 'xyz'
            ? <Button variant="outline" size="sm" className="h-7" onClick={() => onLoad(artifact)}>载入</Button>
            : null
          : undefined}
      />
    </div>
  )
}
