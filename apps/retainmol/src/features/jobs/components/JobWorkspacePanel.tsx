import { useMemo, useState } from 'react'
import { FileInput, FileOutput, LayoutGrid, List, LoaderCircle, Play, RefreshCw } from 'lucide-react'
import type { Molecule } from '@retainmol/mol-viewer/core'
import { Button } from '@/components/ui/button'
import { DataTable, VirtualList, type DataTableColumn } from '@/components/data'
import { cn } from '@/lib/utils'
import type { JobArtifact, JobDetail, JobSummary, XtbStructureInput } from '../domain/jobTypes'
import { resolveJobArtifactUrl } from '../infrastructure/jobsApiClient'
import {
  useJobDetailQuery,
  useJobsQuery,
  useRunJobMutation,
} from '../application/jobQueries'
import { useJobUiStore } from '../model/jobUiStore'
import { XtbJobForm } from './XtbJobForm'

export interface JobWorkspacePanelProps {
  structure?: XtbStructureInput
  molecule?: Molecule
  onExecuteJob?: (job: JobDetail) => void | Promise<void>
  onLoadOptimizedStructure?: (artifact: JobArtifact, job: JobDetail) => void | Promise<void>
  className?: string
}

export function JobWorkspacePanel({
  structure,
  molecule,
  onExecuteJob,
  onLoadOptimizedStructure,
  className,
}: JobWorkspacePanelProps) {
  const selectedJobId = useJobUiStore(state => state.selectedJobId)
  const selectJob = useJobUiStore(state => state.selectJob)
  const listView = useJobUiStore(state => state.listView)
  const setListView = useJobUiStore(state => state.setListView)
  const jobsQuery = useJobsQuery()
  const detailQuery = useJobDetailQuery(selectedJobId)
  const runJob = useRunJobMutation()
  const [callbackError, setCallbackError] = useState<string | null>(null)
  const jobs = jobsQuery.data ?? []
  const visibleJob = detailQuery.data

  const columns = useMemo<DataTableColumn<JobSummary>[]>(() => [
    { accessorKey: 'name', header: '任务', cell: info => <span className="font-medium">{String(info.getValue())}</span> },
    { accessorKey: 'status', header: '状态', cell: info => <StatusBadge status={String(info.getValue())} /> },
    { accessorKey: 'createdAt', header: '创建时间', cell: info => <span className="text-[11px]">{formatDate(String(info.getValue()))}</span> },
  ], [])

  async function invokeCallback(callback: () => void | Promise<void>) {
    setCallbackError(null)
    try {
      await callback()
    } catch (error) {
      setCallbackError(error instanceof Error ? error.message : '操作失败。')
    }
  }

  return (
    <section className={cn('grid h-full min-h-0 grid-cols-[minmax(14rem,0.9fr)_minmax(0,1.4fr)] overflow-hidden bg-card text-card-foreground', className)}>
      <aside className="flex min-h-0 flex-col border-r border-border bg-muted/30">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <div>
            <h2 className="text-sm font-semibold">计算任务</h2>
            <p className="text-[11px] text-muted-foreground">后端持久化队列</p>
          </div>
          <div className="flex items-center gap-0.5">
            <Button variant={listView === 'cards' ? 'default' : 'ghost'} size="icon" className="h-7 w-7" title="缩略图视图" onClick={() => setListView('cards')}><LayoutGrid /></Button>
            <Button variant={listView === 'table' ? 'default' : 'ghost'} size="icon" className="h-7 w-7" title="表格视图" onClick={() => setListView('table')}><List /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" title="刷新任务" onClick={() => void jobsQuery.refetch()} disabled={jobsQuery.isFetching}>
              <RefreshCw className={cn(jobsQuery.isFetching && 'animate-spin')} />
            </Button>
          </div>
        </div>
        <div className="min-h-0 flex-1 p-1.5">
          {listView === 'cards' ? (
            <VirtualList
              label="计算任务"
              items={jobs}
              height="100%"
              getItemKey={job => job.id}
              emptyContent={jobsQuery.isLoading ? '正在加载任务…' : '暂无任务'}
              itemClassName="pb-1"
              renderItem={job => <JobCard job={job} selected={selectedJobId === job.id} onSelect={() => selectJob(job.id)} />}
            />
          ) : (
            <DataTable
              label="计算任务表格"
              data={jobs}
              columns={columns}
              isLoading={jobsQuery.isLoading}
              emptyContent="暂无任务"
              className="h-full rounded-none"
              onRowClick={row => selectJob(row.original.id)}
              getRowClassName={row => selectedJobId === row.original.id ? 'bg-foreground/10' : undefined}
            />
          )}
        </div>
        {jobsQuery.error && <p role="alert" className="border-t border-border px-3 py-2 text-[11px] text-destructive">{jobsQuery.error.message}</p>}
      </aside>

      <div className="min-h-0 overflow-y-auto">
        <XtbJobForm structure={structure} molecule={molecule} />
        {(callbackError || detailQuery.error) && (
          <p role="alert" className="mx-3 mt-3 border border-destructive/30 bg-destructive/5 p-2 text-xs text-destructive">
            {callbackError ?? detailQuery.error?.message}
          </p>
        )}
        <div className="p-3">
          {detailQuery.isLoading && <div className="flex items-center gap-2 py-8 text-xs text-muted-foreground"><LoaderCircle className="animate-spin" />正在读取任务</div>}
          {!detailQuery.isLoading && visibleJob && (
            <JobDetailView
              job={visibleJob}
              onExecute={() => void invokeCallback(async () => {
                const updated = await runJob.mutateAsync(visibleJob.id)
                await onExecuteJob?.(updated)
              })}
              isRunning={runJob.isPending}
              onLoad={onLoadOptimizedStructure
                ? artifact => void invokeCallback(() => onLoadOptimizedStructure(artifact, visibleJob))
                : undefined}
            />
          )}
          {!detailQuery.isLoading && !visibleJob && <p className="py-8 text-center text-xs text-muted-foreground">选择任务查看参数和产物。</p>}
        </div>
      </div>
    </section>
  )
}

function JobCard({ job, selected, onSelect }: { job: JobSummary; selected: boolean; onSelect: () => void }) {
  return (
    <button type="button" onClick={onSelect} className={cn('w-full border p-2 text-left', selected ? 'border-foreground bg-background' : 'border-transparent hover:border-border hover:bg-background')}>
      <div className="flex items-center gap-2">
        <JobThumbnail job={job} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium">{job.name || 'xTB optimization'}</p>
          <p className="mt-1 text-[10px] text-muted-foreground">{formatDate(job.createdAt)}</p>
        </div>
        <StatusBadge status={job.status} />
      </div>
    </button>
  )
}

function JobDetailView({ job, onExecute, onLoad, isRunning }: {
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
        <div className="flex items-center gap-2"><StatusBadge status={job.status} /><Button variant="outline" size="sm" className="h-7" onClick={onExecute} disabled={isRunning || job.status !== 'queued'}>{isRunning ? <LoaderCircle className="animate-spin" /> : <Play />}{isRunning ? '运行中' : '运行'}</Button></div>
      </header>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 border-y border-border py-3 text-xs">
        <DetailTerm label="方法" value="GFN2-xTB" /><DetailTerm label="原子" value={String(job.request.structure.atoms.length)} />
        <DetailTerm label="电荷" value={String(job.request.charge)} /><DetailTerm label="多重度" value={String(job.request.multiplicity)} />
        <DetailTerm label="级别" value={job.request.optLevel} /><DetailTerm label="最大步数" value={String(job.request.maxSteps)} />
      </dl>
      {job.error && <p className="text-xs text-destructive">{job.error}</p>}
      <ArtifactSection title="输入产物" artifacts={artifacts.filter(item => item.role === 'input')} icon={FileInput} />
      <ArtifactSection title="输出产物" artifacts={artifacts.filter(item => item.role === 'output')} icon={FileOutput} onLoad={onLoad} />
    </div>
  )
}

function DetailTerm({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-2"><dt className="text-muted-foreground">{label}</dt><dd className="truncate font-medium">{value}</dd></div>
}

function ArtifactSection({ title, artifacts, icon: Icon, onLoad }: { title: string; artifacts: JobArtifact[]; icon: typeof FileInput; onLoad?: (artifact: JobArtifact) => void }) {
  return <section><h3 className="text-xs font-semibold">{title}</h3><div className="mt-1.5 space-y-1.5">{artifacts.length === 0 && <p className="text-xs text-muted-foreground">暂无</p>}{artifacts.map(artifact => <div key={artifact.id} className="flex items-center gap-2 border border-border bg-muted/30 px-2 py-1.5"><Icon className="size-3.5 text-muted-foreground" /><div className="min-w-0 flex-1"><p className="truncate text-xs font-medium">{artifact.name}</p><p className="text-[10px] text-muted-foreground">{artifact.format}{artifact.sizeBytes ? ` · ${formatSize(artifact.sizeBytes)}` : ''}</p></div>{onLoad && artifact.format === 'xyz' && <Button variant="outline" size="sm" className="h-7" onClick={() => onLoad(artifact)}>载入</Button>}</div>)}</div></section>
}

function JobThumbnail({ job }: { job: JobSummary }) {
  const preview = job.artifacts?.find(item => item.role === 'preview' && item.format === 'png')
  const url = preview ? resolveJobArtifactUrl(preview) : null
  return url ? <img src={url} alt="" loading="lazy" className="size-10 shrink-0 border border-border bg-background object-cover" /> : <div aria-hidden="true" className="grid size-10 shrink-0 place-items-center border border-border bg-background text-[9px] text-muted-foreground">3D</div>
}

function StatusBadge({ status }: { status: string }) {
  return <span className={cn('shrink-0 border px-1.5 py-0.5 text-[10px] capitalize', statusClass(status))}>{status}</span>
}

function statusClass(status: string) {
  if (status === 'succeeded') return 'border-emerald-300 text-emerald-700'
  if (status === 'failed' || status === 'cancelled') return 'border-destructive/40 text-destructive'
  if (status === 'running') return 'border-foreground bg-foreground text-background'
  return 'border-border text-muted-foreground'
}

function formatDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
}

function formatSize(size: number) {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / 1024 / 1024).toFixed(1)} MB`
}
