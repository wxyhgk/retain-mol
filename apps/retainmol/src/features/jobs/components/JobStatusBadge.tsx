import { cn } from '@/lib/utils'
import type { JobStatus } from '../domain/jobTypes'
import { jobStatusLabel } from '../domain/jobPresentation'

export function JobStatusBadge({ status }: { status: JobStatus }) {
  return (
    <span className={cn('inline-flex shrink-0 items-center border px-2 py-1 text-[11px] font-medium', statusClass(status))}>
      {status === 'running' && <span className="mr-1.5 size-1.5 animate-pulse rounded-full bg-current" />}
      {jobStatusLabel(status)}
    </span>
  )
}

function statusClass(status: JobStatus) {
  if (status === 'succeeded') return 'border-emerald-300 text-emerald-700 dark:text-emerald-400'
  if (status === 'failed' || status === 'cancelled' || status === 'interrupted') {
    return 'border-destructive/40 text-destructive'
  }
  if (status === 'running') return 'border-foreground bg-foreground text-background'
  return 'border-border text-muted-foreground'
}
