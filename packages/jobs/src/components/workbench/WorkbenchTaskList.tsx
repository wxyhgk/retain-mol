import { useMemo, useState } from 'react'
import { Atom, Biohazard, FlaskConical, Gem, Plus, Search } from 'lucide-react'
import { Button, Input, cn } from '@retainmol/ui-kit'
import type { JobSummary } from '../../domain/jobTypes'
import { calculationLabel, formatJobDuration } from '../../domain/jobPresentation'
import { countJobsByBucket, filterJobs, type JobStatusBucket } from '../../domain/jobFilter'
import { ChemStatusHex } from './ChemStatusHex'
import { JobThumbnail } from '../shared/JobThumbnail'
import { JobEmptyState } from '../shared/JobEmptyState'

/** 元素周期格式过滤:计数=原子序数,图标=元素符号,名称在下。 */
const BUCKET_TILES = [
  { bucket: 'all', label: '全部', icon: Atom },
  { bucket: 'active', label: '活跃', icon: FlaskConical },
  { bucket: 'succeeded', label: '已完成', icon: Gem },
  { bucket: 'attention', label: '需处理', icon: Biohazard },
] as const satisfies ReadonlyArray<{ bucket: JobStatusBucket; label: string; icon: typeof Atom }>

function isTerminal(status: JobSummary['status']) {
  return status === 'succeeded' || status === 'failed' || status === 'cancelled' || status === 'interrupted'
}

export interface WorkbenchTaskListProps {
  jobs: readonly JobSummary[]
  isLoading: boolean
  errorMessage?: string
  selectedJobId: string | null
  initialBucket?: JobStatusBucket | null
  onSelectJob: (jobId: string) => void
  onOpenEditor: () => void
}

/** 工作台左栏:搜索 + 状态过滤 chips + 任务卡列表。 */
export function WorkbenchTaskList({
  jobs,
  isLoading,
  errorMessage,
  selectedJobId,
  initialBucket,
  onSelectJob,
  onOpenEditor,
}: WorkbenchTaskListProps) {
  const [search, setSearch] = useState('')
  const [bucket, setBucket] = useState<JobStatusBucket>(initialBucket ?? 'all')
  const counts = useMemo(() => countJobsByBucket(jobs), [jobs])
  const visibleJobs = useMemo(() => filterJobs(jobs, { query: search, bucket }), [jobs, search, bucket])

  return (
    <div className="flex h-full min-h-0 flex-col bg-card">
      <div className="shrink-0 space-y-2.5 border-b border-border p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="搜索任务名称、ID 或计算类型"
            className="h-8 pl-8 text-xs"
          />
        </div>
        <div className="flex gap-1" role="group" aria-label="状态过滤">
          {BUCKET_TILES.map(tile => {
            const active = bucket === tile.bucket
            return (
              <button
                key={tile.bucket}
                type="button"
                onClick={() => setBucket(tile.bucket)}
                aria-pressed={active}
                className={cn(
                  'flex min-w-0 flex-1 flex-col items-center rounded-lg border px-1.5 py-1.5 transition-shadow',
                  active
                    ? 'border-foreground bg-foreground text-background shadow-sm'
                    : 'border-border text-foreground hover:border-foreground/40 hover:shadow-sm',
                )}
              >
                <span className={cn('self-start text-[9px] tabular-nums leading-none', active ? 'text-background/70' : 'text-muted-foreground')}>
                  {counts[tile.bucket]}
                </span>
                <tile.icon className="my-1 size-4" />
                <span className="text-[10px] leading-tight">{tile.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <JobEmptyState className="py-10" title="正在读取任务" />
        ) : visibleJobs.length === 0 ? (
          <JobEmptyState className="py-10" title={errorMessage ?? '没有符合条件的任务'} />
        ) : (
          <ul className="space-y-1.5">
            {visibleJobs.map(job => {
              const selected = job.id === selectedJobId
              return (
                <li key={job.id}>
                  <button
                    type="button"
                    onClick={() => onSelectJob(job.id)}
                    aria-current={selected}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg border bg-card p-2.5 text-left transition-shadow',
                      selected
                        ? 'border-foreground shadow-sm ring-1 ring-foreground/10'
                        : 'border-border hover:border-foreground/40 hover:shadow-sm',
                    )}
                  >
                    <JobThumbnail job={job} size="lg" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium tracking-tight">{job.name}</span>
                      <span className="mt-0.5 block truncate font-mono text-[10px] tabular-nums text-muted-foreground">{job.id}</span>
                      <span className="mt-1.5 flex items-center gap-1.5">
                        <ChemStatusHex status={job.status} size="sm" />
                        <span className="truncate text-[10px] tabular-nums text-muted-foreground">
                          {calculationLabel(job.kind)} · {formatJobDuration(job.createdAt, isTerminal(job.status) ? job.updatedAt : undefined)}
                        </span>
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <div className="shrink-0 border-t border-border p-2">
        <Button variant="outline" className="w-full" onClick={onOpenEditor}><Plus />准备新计算</Button>
      </div>
    </div>
  )
}
