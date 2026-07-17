import { useMemo, useState } from 'react'
import { Boxes, Plus, RefreshCw, Search, Table2 } from 'lucide-react'
import { Button } from '@retainmol/ui-kit'
import { Input } from '@retainmol/ui-kit'
import { DataTable, type DataTableColumn } from '@retainmol/ui-kit'
import { cn } from '@retainmol/ui-kit'
import { useJobsQuery, useRunJobMutation } from '../application/jobQueries'
import { useShelfMolecules } from '../application/useShelfMolecules'
import type { JobSummary } from '../domain/jobTypes'
import { calculationLabel, formatJobDate } from '../domain/jobPresentation'
import { filterJobs, type JobStatusBucket } from '../domain/jobFilter'
import { useJobUiStore } from '../model/jobUiStore'
import { JobStatusBadge } from './JobStatusBadge'
import { JobThumbnail } from './shared/JobThumbnail'
import { JobStatMetrics } from './shared/JobStatMetrics'
import { JobEmptyState } from './shared/JobEmptyState'
import { JobShelfView } from './shelf/JobShelfView'

const NO_JOBS: JobSummary[] = []

export interface PlatformJobListProps {
  onOpenJob: (jobId: string) => void
  onOpenEditor: () => void
  initialBucket?: JobStatusBucket | null
}

export function PlatformJobList({ onOpenJob, onOpenEditor, initialBucket }: PlatformJobListProps) {
  const jobsQuery = useJobsQuery()
  const [search, setSearch] = useState('')
  const [bucket, setBucket] = useState<JobStatusBucket>(initialBucket ?? 'all')
  const centerView = useJobUiStore(state => state.centerView)
  const setCenterView = useJobUiStore(state => state.setCenterView)
  const runJob = useRunJobMutation()
  const jobs = useMemo(() => jobsQuery.data ?? [], [jobsQuery.data])
  const visibleJobs = useMemo(
    () => filterJobs(jobs, { query: search, bucket }),
    [jobs, search, bucket],
  )
  // 表格视图零扇出：只有展柜激活才请求任务详情/分子
  const molecules = useShelfMolecules(centerView === 'shelf' ? visibleJobs : NO_JOBS)

  const columns = useMemo<DataTableColumn<JobSummary>[]>(() => [
    {
      id: 'preview', header: '', size: 56,
      cell: ({ row }) => <JobThumbnail job={row.original} />,
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

      <JobStatMetrics jobs={jobs} activeBucket={bucket} onSelectBucket={setBucket} className="shrink-0" />

      <section className="flex min-h-0 flex-1 flex-col pt-5">
        <div className="flex shrink-0 flex-wrap items-center gap-2 border border-b-0 border-border bg-card p-3">
          <div className="relative min-w-64 flex-1 md:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={event => setSearch(event.target.value)} placeholder="搜索任务名称、ID 或计算类型" className="h-9 pl-9" />
          </div>
          <span className="text-[11px] text-muted-foreground">显示 {visibleJobs.length} / {jobs.length}</span>
          <div className="flex items-center gap-0.5" role="group" aria-label="视图切换">
            <Button variant={centerView === 'table' ? 'default' : 'ghost'} size="icon" className="size-9" title="表格视图" aria-pressed={centerView === 'table'} onClick={() => setCenterView('table')}><Table2 /></Button>
            <Button variant={centerView === 'shelf' ? 'default' : 'ghost'} size="icon" className="size-9" title="展柜视图（3D）" aria-pressed={centerView === 'shelf'} onClick={() => setCenterView('shelf')}><Boxes /></Button>
          </div>
          <Button variant="outline" size="icon" className="size-9" title="刷新任务" onClick={() => void jobsQuery.refetch()} disabled={jobsQuery.isFetching}>
            <RefreshCw className={cn(jobsQuery.isFetching && 'animate-spin')} />
          </Button>
        </div>
        {centerView === 'table' ? (
          <DataTable
            label="计算任务"
            data={visibleJobs}
            columns={columns}
            isLoading={jobsQuery.isLoading}
            emptyContent={jobsQuery.error ? jobsQuery.error.message : '没有符合条件的任务'}
            className="min-h-0 flex-1 rounded-none"
            onRowClick={row => onOpenJob(row.original.id)}
          />
        ) : (
          <div className="min-h-0 flex-1 border border-border bg-card">
            {visibleJobs.length === 0 ? (
              <JobEmptyState className="py-16" title={jobsQuery.error ? jobsQuery.error.message : '没有符合条件的任务'} />
            ) : (
              <JobShelfView
                jobs={visibleJobs}
                molecules={molecules}
                onOpenJob={onOpenJob}
                onRunJob={jobId => runJob.mutate(jobId)}
                runPendingJobId={runJob.isPending ? runJob.variables ?? null : null}
              />
            )}
          </div>
        )}
      </section>
    </div>
  )
}
