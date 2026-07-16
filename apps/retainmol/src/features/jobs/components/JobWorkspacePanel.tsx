import { useEffect, useMemo, useState } from 'react'
import { Atom, FileInput, FileOutput, FlaskConical, LayoutGrid, List, LoaderCircle, Play, RefreshCw } from 'lucide-react'
import type { Molecule } from '@retainmol/mol-viewer/core'
import { Button } from '@/components/ui/button'
import { DataTable, VirtualList, type DataTableColumn } from '@/components/data'
import { cn } from '@/lib/utils'
import type {
  CreatePsi4JobRequest,
  CreateXtbOptimizationJobRequest,
  JobArtifact,
  JobDetail,
  JobSummary,
  XtbStructureInput,
} from '../domain/jobTypes'
import { resolveJobArtifactUrl } from '../infrastructure/jobsApiClient'
import {
  useJobDetailQuery,
  useJobsQuery,
  useRunJobMutation,
} from '../application/jobQueries'
import { useJobUiStore } from '../model/jobUiStore'
import { XtbJobForm } from './XtbJobForm'
import { Psi4JobForm } from './Psi4JobForm'
import { JobManagementActions } from './JobManagementActions'
import {
  useMoleculeAssetQuery,
  useMoleculeRevisionQuery,
  type MoleculeDocumentBinding,
} from '@/features/molecule-assets'

export interface JobWorkspacePanelProps {
  structure?: XtbStructureInput
  molecule?: Molecule
  objectId?: string | null
  documentBinding?: MoleculeDocumentBinding | null
  revisionMetadata?: Readonly<Record<string, unknown>>
  onExecuteJob?: (job: JobDetail) => void | Promise<void>
  onLoadOptimizedStructure?: (artifact: JobArtifact, job: JobDetail) => void | Promise<void>
  showCreateForm?: boolean
  autoSelectFirst?: boolean
  className?: string
}

export function JobWorkspacePanel({
  structure,
  molecule,
  objectId,
  documentBinding,
  revisionMetadata,
  onExecuteJob,
  onLoadOptimizedStructure,
  showCreateForm = true,
  autoSelectFirst = false,
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
  const [createEngine, setCreateEngine] = useState<'xtb' | 'psi4'>('xtb')
  const jobs = useMemo(() => jobsQuery.data ?? [], [jobsQuery.data])
  const visibleJob = detailQuery.data

  useEffect(() => {
    if (autoSelectFirst && !selectedJobId && jobs.length > 0) selectJob(jobs[0].id)
  }, [autoSelectFirst, jobs, selectJob, selectedJobId])

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
        {showCreateForm && (
          <div>
            <div className="flex gap-1 border-b border-border bg-muted/30 p-1.5" role="group" aria-label="计算引擎">
              <Button size="sm" variant={createEngine === 'xtb' ? 'default' : 'ghost'} className="h-7 flex-1" onClick={() => setCreateEngine('xtb')}><FlaskConical />xTB</Button>
              <Button size="sm" variant={createEngine === 'psi4' ? 'default' : 'ghost'} className="h-7 flex-1" onClick={() => setCreateEngine('psi4')}><Atom />Psi4</Button>
            </div>
            {createEngine === 'xtb' ? (
              <XtbJobForm
                structure={structure}
                molecule={molecule}
                objectId={objectId}
                documentBinding={documentBinding}
                revisionMetadata={revisionMetadata}
              />
            ) : (
              <Psi4JobForm
                structure={structure}
                molecule={molecule}
                objectId={objectId}
                documentBinding={documentBinding}
                revisionMetadata={revisionMetadata}
              />
            )}
          </div>
        )}
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
          <p className="truncate text-xs font-medium">{job.name || calculationLabel(job.kind)}</p>
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
  const parameterRows = jobParameterRows(job)
  return (
    <div className="space-y-4">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0"><h2 className="truncate text-sm font-semibold">{job.name}</h2><p className="mt-1 font-mono text-[10px] text-muted-foreground">{job.id}</p></div>
        <div className="flex items-center gap-1">
          <StatusBadge status={job.status} />
          <JobManagementActions job={job} />
          <Button variant="outline" size="sm" className="h-7" onClick={onExecute} disabled={isRunning || job.status !== 'queued'}>{isRunning ? <LoaderCircle className="animate-spin" /> : <Play />}{isRunning ? '运行中' : '运行'}</Button>
        </div>
      </header>
      {job.description && <p className="text-xs leading-5 text-muted-foreground">{job.description}</p>}
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 border-y border-border py-3 text-xs">
        {parameterRows.map(([label, value]) => <DetailTerm key={label} label={label} value={value} />)}
      </dl>
      <JobInputSummary job={job} />
      {job.error && <p className="text-xs text-destructive">{job.error}</p>}
      <ArtifactSection title="输入产物" artifacts={artifacts.filter(item => item.role === 'input')} icon={FileInput} />
      <ArtifactSection title="输出产物" artifacts={artifacts.filter(item => item.role === 'output')} icon={FileOutput} onLoad={onLoad} />
    </div>
  )
}

function JobInputSummary({ job }: { job: JobDetail }) {
  const revisionId = revisionIdFor(job)
  const revisionQuery = useMoleculeRevisionQuery(revisionId)
  const assetQuery = useMoleculeAssetQuery(revisionQuery.data?.assetId ?? null)

  if (!revisionId) {
    return (
      <section className="border border-border bg-muted/30 p-2 text-[11px]">
        <p className="font-medium">输入来源 · 旧版结构快照</p>
        <p className="mt-1 text-muted-foreground">该任务创建于分子版本绑定启用之前。</p>
      </section>
    )
  }
  if (revisionQuery.isLoading) {
    return <p className="text-[11px] text-muted-foreground">正在读取冻结的分子版本…</p>
  }
  if (!revisionQuery.data) {
    return <p className="text-[11px] text-destructive">无法读取任务绑定的分子版本 {revisionId}</p>
  }

  const revision = revisionQuery.data
  return (
    <section className="border border-border bg-muted/30 p-2 text-[11px]">
      <div className="flex items-center justify-between gap-2">
        <p className="font-medium">输入来源 · {assetQuery.data?.name ?? revision.assetId}</p>
        <span>{revision.molecule.atoms.length} atoms</span>
      </div>
      <dl className="mt-2 grid gap-1 font-mono text-[10px] text-muted-foreground">
        <DetailTerm label="Revision" value={shortIdentifier(revision.id)} />
        <DetailTerm label="SHA-256" value={revision.contentHash.slice(0, 16)} />
      </dl>
    </section>
  )
}

function revisionIdFor(job: JobDetail): string | null {
  const request = job.request
  if (!request || !('moleculeRevisionId' in request)) return null
  return typeof request.moleculeRevisionId === 'string' ? request.moleculeRevisionId : null
}

function literalAtomCount(job: JobDetail): string | null {
  const request = job.request
  if (!request || !('structure' in request) || !request.structure) return null
  return String(request.structure.atoms.length)
}

function jobParameterRows(job: JobDetail): Array<[string, string]> {
  const request = job.request
  const rows: Array<[string, string]> = [
    ['任务类型', calculationLabel(job.kind)],
    ['原子', literalAtomCount(job) ?? '版本快照'],
    ['电荷', request ? String(request.charge) : '—'],
    ['多重度', request ? String(request.multiplicity) : '—'],
  ]
  if (isXtbRequest(request)) {
    rows.push(['方法', 'GFN2-xTB'], ['优化级别', request.optLevel], ['最大步数', String(request.maxSteps)])
  } else if (isPsi4Request(request)) {
    rows.push(['理论水平', `${request.method}/${request.basis}`], ['SCF', request.scfType.toUpperCase()])
    if ('maxSteps' in request) rows.push(['最大步数', String(request.maxSteps)])
    if ('direction' in request) rows.push(['IRC 方向', request.direction], ['IRC 点数', String(request.points)])
    if ('convergence' in request) rows.push(['收敛标准', request.convergence])
  }
  return rows
}

function isXtbRequest(
  request: JobDetail['request'],
): request is CreateXtbOptimizationJobRequest {
  return request?.method === 'gfn2' && 'optLevel' in request
}

function isPsi4Request(request: JobDetail['request']): request is CreatePsi4JobRequest {
  return Boolean(request && 'basis' in request)
}

function calculationLabel(kind: string): string {
  if (kind === 'xtb-optimization') return 'xTB 几何优化'
  if (kind === 'psi4-frequency') return 'Psi4 频率分析'
  if (kind === 'psi4-ts-refine') return 'Psi4 过渡态精修'
  if (kind === 'psi4-irc') return 'Psi4 IRC'
  return kind
}

function shortIdentifier(value: string): string {
  return value.length <= 20 ? value : `${value.slice(0, 12)}…${value.slice(-6)}`
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
