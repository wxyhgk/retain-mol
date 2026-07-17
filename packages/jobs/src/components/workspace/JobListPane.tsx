import { useMemo } from 'react'
import { LayoutGrid, List, RefreshCw, Search } from 'lucide-react'
import { Button } from '@retainmol/ui-kit'
import { Input } from '@retainmol/ui-kit'
import { DataTable, VirtualList, type DataTableColumn } from '@retainmol/ui-kit'
import { cn } from '@retainmol/ui-kit'
import { formatJobDate } from '../../domain/jobPresentation'
import type { JobStatusBucket } from '../../domain/jobFilter'
import type { JobSummary } from '../../domain/jobTypes'
import { useJobUiStore } from '../../model/jobUiStore'
import { JobStatusBadge } from '../JobStatusBadge'
import { JobCard } from './JobCard'

const BUCKET_CHIPS: Array<{ bucket: JobStatusBucket; label: string }> = [
  { bucket: 'all', label: '全部' },
  { bucket: 'active', label: '进行中' },
  { bucket: 'succeeded', label: '已完成' },
  { bucket: 'attention', label: '需处理' },
]

export function JobListPane({ jobs, totalCount, isLoading, isFetching, error, selectedJobId, onSelect, onRefresh }: {
  /** 已按 listFilter 过滤后的任务。 */
  jobs: JobSummary[]
  totalCount: number
  isLoading: boolean
  isFetching: boolean
  error: Error | null
  selectedJobId: string | null
  onSelect: (jobId: string) => void
  onRefresh: () => void
}) {
  const listView = useJobUiStore(state => state.listView)
  const setListView = useJobUiStore(state => state.setListView)
  const listFilter = useJobUiStore(state => state.listFilter)
  const setListFilter = useJobUiStore(state => state.setListFilter)
  const filtered = jobs.length !== totalCount

  const columns = useMemo<DataTableColumn<JobSummary>[]>(() => [
    { accessorKey: 'name', header: '任务', cell: info => <span className="font-medium">{String(info.getValue())}</span> },
    { accessorKey: 'status', header: '状态', cell: ({ row }) => <JobStatusBadge status={row.original.status} size="sm" /> },
    { accessorKey: 'createdAt', header: '创建时间', cell: info => <span className="text-[11px]">{formatJobDate(String(info.getValue()))}</span> },
  ], [])

  return (
    <aside className="flex min-h-0 flex-col border-r border-border bg-muted/30">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <div>
          <h2 className="text-sm font-semibold">计算任务</h2>
          <p className="text-[11px] text-muted-foreground">后端持久化队列</p>
        </div>
        <div className="flex items-center gap-0.5">
          <Button variant={listView === 'cards' ? 'default' : 'ghost'} size="icon" className="h-7 w-7" title="缩略图视图" onClick={() => setListView('cards')}><LayoutGrid /></Button>
          <Button variant={listView === 'table' ? 'default' : 'ghost'} size="icon" className="h-7 w-7" title="表格视图" onClick={() => setListView('table')}><List /></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" title="刷新任务" onClick={onRefresh} disabled={isFetching}>
            <RefreshCw className={cn(isFetching && 'animate-spin')} />
          </Button>
        </div>
      </div>
      <div className="space-y-1.5 border-b border-border px-3 py-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2 top-1/2 size-3 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={listFilter.query}
            onChange={event => setListFilter({ query: event.target.value })}
            placeholder="搜索名称、ID 或类型"
            className="h-7 pl-7 text-xs"
          />
        </div>
        <div className="flex items-center gap-1" role="group" aria-label="状态筛选">
          {BUCKET_CHIPS.map(({ bucket, label }) => (
            <Button
              key={bucket}
              size="sm"
              variant={listFilter.bucket === bucket ? 'default' : 'ghost'}
              className="h-6 px-2 text-[11px]"
              aria-pressed={listFilter.bucket === bucket}
              onClick={() => setListFilter({ bucket })}
            >
              {label}
            </Button>
          ))}
          {filtered && <span className="ml-auto text-[10px] text-muted-foreground">{jobs.length}/{totalCount}</span>}
        </div>
      </div>
      <div className="min-h-0 flex-1 p-1.5">
        {listView === 'cards' ? (
          <VirtualList
            label="计算任务"
            items={jobs}
            height="100%"
            getItemKey={job => job.id}
            emptyContent={isLoading ? '正在加载任务…' : filtered || totalCount > 0 ? '没有符合筛选的任务' : '暂无任务'}
            itemClassName="pb-1"
            renderItem={job => <JobCard job={job} selected={selectedJobId === job.id} onSelect={() => onSelect(job.id)} />}
          />
        ) : (
          <DataTable
            label="计算任务表格"
            data={jobs}
            columns={columns}
            isLoading={isLoading}
            emptyContent={filtered || totalCount > 0 ? '没有符合筛选的任务' : '暂无任务'}
            className="h-full rounded-none"
            onRowClick={row => onSelect(row.original.id)}
            getRowClassName={row => selectedJobId === row.original.id ? 'bg-foreground/10' : undefined}
          />
        )}
      </div>
      {error && <p role="alert" className="border-t border-border px-3 py-2 text-[11px] text-destructive">{error.message}</p>}
    </aside>
  )
}
