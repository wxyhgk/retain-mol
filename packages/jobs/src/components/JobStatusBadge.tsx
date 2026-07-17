import { cn } from '@retainmol/ui-kit'
import type { JobStatus } from '../domain/jobTypes'
import { jobStatusLabel } from '../domain/jobPresentation'

export function JobStatusBadge({ status, size = 'default' }: { status: JobStatus; size?: 'sm' | 'default' }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center border font-medium',
        size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-[11px]',
        statusClass(status),
      )}
    >
      {status === 'running' && <span className="mr-1.5 size-1.5 animate-pulse rounded-full bg-current" />}
      {jobStatusLabel(status)}
    </span>
  )
}

function statusClass(status: JobStatus) {
  // 黑白词汇:运行中=唯一实心黑(活的),完成=白底深发丝,异常=深发丝,未开始=浅灰
  if (status === 'succeeded') return 'border-foreground/25 bg-background text-foreground'
  if (status === 'failed' || status === 'cancelled' || status === 'interrupted') {
    return 'border-foreground/45 text-foreground'
  }
  if (status === 'running') return 'border-foreground bg-foreground text-background'
  return 'border-border text-muted-foreground'
}
