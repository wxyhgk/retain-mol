import { useMemo, useState } from 'react'
import { Atom, CheckCircle2, Clock3, FlaskConical, Plus, RefreshCw, Search, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTable, type DataTableColumn } from '@/components/data'
import { cn } from '@/lib/utils'
import { useJobsQuery } from '../application/jobQueries'
import type { JobStatus, JobSummary } from '../domain/jobTypes'
import { calculationLabel, formatJobDate } from '../domain/jobPresentation'
import { resolveJobArtifactUrl } from '../infrastructure/jobsApiClient'
import { JobStatusBadge } from './JobStatusBadge'

export interface PlatformJobListProps {
  onOpenJob: (jobId: string) => void
  onOpenEditor: () => void
}

type StatusFilter = 'all' | 'active' | 'succeeded' | 'attention'

export function PlatformJobList({ onOpenJob, onOpenEditor }: PlatformJobListProps) {
  const jobsQuery = useJobsQuery()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const jobs = useMemo(() => jobsQuery.data ?? [], [jobsQuery.data])
  const visibleJobs = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase()
    return jobs.filter(job => {
      const matchesSearch = !normalizedSearch
        || job.name.toLocaleLowerCase().includes(normalizedSearch)
        || job.id.toLocaleLowerCase().includes(normalizedSearch)
        || calculationLabel(job.kind).toLocaleLowerCase().includes(normalizedSearch)
      return matchesSearch && matchesStatus(job.status, statusFilter)
    })
  }, [jobs, search, statusFilter])

  const columns = useMemo<DataTableColumn<JobSummary>[]>(() => [
    {
      id: 'preview', header: '', size: 56,
      cell: ({ row }) => <JobPreview job={row.original} />,
    },
    {
      accessorKey: 'name', header: '任务',
      cell: ({ row }) => (
        <div className="min-w-0 py-1">
          <p className="truncate text-xs font-medium">{row.original.name}</p>
          <p className="mt-1 truncate font-mono text-[10px] text-muted-foreground">{row.original.id}</p>
        </div>
      ),
    },
    {
      accessorKey: 'kind', header: '计算类型',
      cell: ({ row }) => <span className="text-xs">{calculationLabel(row.original.kind)}</span>,
    },
    {
      accessorKey: 'status', header: '状态',
      cell: ({ row }) => <JobStatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'createdAt', header: '创建时间',
      cell: ({ row }) => <span className="whitespace-nowrap text-[11px] text-muted-foreground">{formatJobDate(row.original.createdAt)}</span>,
    },
  ], [])

  const activeCount = jobs.filter(job => job.status === 'queued' || job.status === 'running').length
  const succeededCount = jobs.filter(job => job.status === 'succeeded').length
  const attentionCount = jobs.filter(job => ['failed', 'interrupted'].includes(job.status)).length

  return (
    <div className="mx-auto flex h-full min-h-0 max-w-[1440px] flex-col px-6 py-5">
      <header className="flex shrink-0 flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
        <div>
          <p className="text-xs font-medium text-muted-foreground">计算任务</p>
          <h1 className="mt-1 text-2xl font-semibold">任务中心</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">管理不可变计算输入、运行状态与输出产物。</p>
        </div>
        <Button onClick={onOpenEditor}><Plus />准备新计算</Button>
      </header>

      <section aria-label="任务统计" className="grid shrink-0 grid-cols-2 border-b border-l border-border md:grid-cols-4">
        <Metric label="全部" value={jobs.length} icon={FlaskConical} active={statusFilter === 'all'} onClick={() => setStatusFilter('all')} />
        <Metric label="等待或运行" value={activeCount} icon={Clock3} active={statusFilter === 'active'} onClick={() => setStatusFilter('active')} />
        <Metric label="已完成" value={succeededCount} icon={CheckCircle2} active={statusFilter === 'succeeded'} onClick={() => setStatusFilter('succeeded')} />
        <Metric label="需要处理" value={attentionCount} icon={TriangleAlert} active={statusFilter === 'attention'} onClick={() => setStatusFilter('attention')} />
      </section>

      <section className="flex min-h-0 flex-1 flex-col pt-5">
        <div className="flex shrink-0 flex-wrap items-center gap-2 border border-b-0 border-border bg-card p-3">
          <div className="relative min-w-64 flex-1 md:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={event => setSearch(event.target.value)} placeholder="搜索任务名称、ID 或计算类型" className="h-9 pl-9" />
          </div>
          <span className="text-[11px] text-muted-foreground">显示 {visibleJobs.length} / {jobs.length}</span>
          <Button variant="outline" size="icon" className="size-9" title="刷新任务" onClick={() => void jobsQuery.refetch()} disabled={jobsQuery.isFetching}>
            <RefreshCw className={cn(jobsQuery.isFetching && 'animate-spin')} />
          </Button>
        </div>
        <DataTable
          label="计算任务"
          data={visibleJobs}
          columns={columns}
          isLoading={jobsQuery.isLoading}
          emptyContent={jobsQuery.error ? jobsQuery.error.message : '没有符合条件的任务'}
          className="min-h-0 flex-1 rounded-none"
          onRowClick={row => onOpenJob(row.original.id)}
        />
      </section>
    </div>
  )
}

function Metric({ label, value, icon: Icon, active, onClick }: {
  label: string
  value: number
  icon: typeof FlaskConical
  active: boolean
  onClick: () => void
}) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className={cn('flex items-center gap-3 border-r border-t border-border bg-card px-4 py-4 text-left', active && 'bg-foreground text-background')}>
      <Icon className={cn('size-4', active ? 'text-background' : 'text-muted-foreground')} />
      <span><span className="block text-xl font-semibold tabular-nums">{value}</span><span className={cn('block text-[11px]', !active && 'text-muted-foreground')}>{label}</span></span>
    </button>
  )
}

function JobPreview({ job }: { job: JobSummary }) {
  const preview = job.artifacts?.find(item => item.role === 'preview' && item.format === 'png')
  const url = preview ? resolveJobArtifactUrl(preview) : null
  return url
    ? <img src={url} alt="" loading="lazy" className="size-10 border border-border bg-background object-cover" />
    : <span className="grid size-10 place-items-center border border-border bg-muted"><Atom className="size-4 text-muted-foreground" /></span>
}

function matchesStatus(status: JobStatus, filter: StatusFilter) {
  if (filter === 'all') return true
  if (filter === 'active') return status === 'queued' || status === 'running'
  if (filter === 'succeeded') return status === 'succeeded'
  return status === 'failed' || status === 'interrupted'
}
