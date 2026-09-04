import { CheckCircle2, Clock3, FlaskConical, TriangleAlert, type LucideIcon } from 'lucide-react'
import { cn } from '@retainmol/ui-kit'
import { countJobsByBucket, type JobStatusBucket } from '../../domain/jobFilter'
import type { JobSummary } from '../../domain/jobTypes'

const BUCKETS: Array<{ bucket: JobStatusBucket; label: string; icon: LucideIcon }> = [
  { bucket: 'all', label: '全部', icon: FlaskConical },
  { bucket: 'active', label: '等待或运行', icon: Clock3 },
  { bucket: 'succeeded', label: '已完成', icon: CheckCircle2 },
  { bucket: 'attention', label: '需要处理', icon: TriangleAlert },
]

export function JobStatMetrics({ jobs, activeBucket, onSelectBucket, className }: {
  jobs: readonly JobSummary[]
  activeBucket?: JobStatusBucket
  onSelectBucket?: (bucket: JobStatusBucket) => void
  className?: string
}) {
  const counts = countJobsByBucket(jobs)
  return (
    <section aria-label="任务统计" className={cn('grid grid-cols-2 border-b border-l border-border md:grid-cols-4', className)}>
      {BUCKETS.map(({ bucket, label, icon: Icon }) => {
        const active = activeBucket === bucket
        const cellClass = cn(
          'flex items-center gap-3 border-r border-t border-border bg-card px-4 py-4 text-left',
          active && 'bg-foreground text-background',
        )
        const content = (
          <>
            <Icon className={cn('size-4', active ? 'text-background' : 'text-muted-foreground')} />
            <span>
              <span className="block text-xl font-semibold tabular-nums">{counts[bucket]}</span>
              <span className={cn('block text-[11px]', !active && 'text-muted-foreground')}>{label}</span>
            </span>
          </>
        )
        if (!onSelectBucket) {
          return <div key={bucket} className={cellClass}>{content}</div>
        }
        return (
          <button key={bucket} type="button" onClick={() => onSelectBucket(bucket)} aria-pressed={active} className={cellClass}>
            {content}
          </button>
        )
      })}
    </section>
  )
}
