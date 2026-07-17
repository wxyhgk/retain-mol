import type { JobStatus, JobSummary } from './jobTypes'
import { calculationLabel } from './jobPresentation'

export type JobStatusBucket = 'all' | 'active' | 'succeeded' | 'attention'

export interface JobListFilter {
  query: string
  bucket: JobStatusBucket
}

export const DEFAULT_JOB_LIST_FILTER: JobListFilter = { query: '', bucket: 'all' }

/** attention = failed | interrupted（沿用任务中心口径，cancelled 视为用户主动结果不计入）。 */
export function matchesStatusBucket(status: JobStatus, bucket: JobStatusBucket): boolean {
  if (bucket === 'all') return true
  if (bucket === 'active') return status === 'queued' || status === 'running'
  if (bucket === 'succeeded') return status === 'succeeded'
  return status === 'failed' || status === 'interrupted'
}

export function filterJobs(jobs: readonly JobSummary[], filter: JobListFilter): JobSummary[] {
  const query = filter.query.trim().toLocaleLowerCase()
  return jobs.filter(job => {
    const matchesQuery = !query
      || job.name.toLocaleLowerCase().includes(query)
      || job.id.toLocaleLowerCase().includes(query)
      || calculationLabel(job.kind).toLocaleLowerCase().includes(query)
    return matchesQuery && matchesStatusBucket(job.status, filter.bucket)
  })
}

export function countJobsByBucket(jobs: readonly JobSummary[]): Record<JobStatusBucket, number> {
  const counts: Record<JobStatusBucket, number> = { all: jobs.length, active: 0, succeeded: 0, attention: 0 }
  for (const job of jobs) {
    if (matchesStatusBucket(job.status, 'active')) counts.active += 1
    else if (matchesStatusBucket(job.status, 'succeeded')) counts.succeeded += 1
    else if (matchesStatusBucket(job.status, 'attention')) counts.attention += 1
  }
  return counts
}
