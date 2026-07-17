import { StatusPill } from '@retainmol/ui-kit'
import type { JobStatus } from '../domain/jobTypes'
import { jobStatusLabel, jobStatusTone } from '../domain/jobPresentation'

/** 任务状态徽章：StatusPill 的词汇绑定层（label/tone/pulse 均来自 domain 单源）。 */
export function JobStatusBadge({ status, size = 'default' }: { status: JobStatus; size?: 'sm' | 'default' }) {
  return (
    <StatusPill
      label={jobStatusLabel(status)}
      tone={jobStatusTone(status)}
      pulse={status === 'running'}
      size={size}
    />
  )
}
