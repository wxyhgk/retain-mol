import { useState } from 'react'
import { ArrowLeft, Atom, Download, ExternalLink, Eye, FileInput, FileOutput, FlaskConical, LoaderCircle, Play, ScrollText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useMoleculeAssetQuery, useMoleculeRevisionQuery } from '@/features/molecule-assets'
import { useJobDetailQuery, useJobLogQuery, useRunJobMutation } from '../application/jobQueries'
import type { CreatePsi4JobRequest, CreateXtbOptimizationJobRequest, JobArtifact, JobDetail } from '../domain/jobTypes'
import { calculationLabel, canPreviewArtifact, formatArtifactSize, formatJobDate, jobStatusLabel } from '../domain/jobPresentation'
import { resolveJobArtifactUrl } from '../infrastructure/jobsApiClient'
import { JobManagementActions } from './JobManagementActions'
import { JobStatusBadge } from './JobStatusBadge'
import { ArtifactPreviewDialog } from './ArtifactPreviewDialog'

export interface PlatformJobDetailProps {
  jobId: string
  onBack: () => void
  onOpenEditor: (artifactId?: string) => void
  onOpenJob: (jobId: string) => void
}

export function PlatformJobDetail({ jobId, onBack, onOpenEditor, onOpenJob }: PlatformJobDetailProps) {
  const detailQuery = useJobDetailQuery(jobId)
  const runJob = useRunJobMutation()
  const [actionError, setActionError] = useState<string | null>(null)
  const job = detailQuery.data

  async function run() {
    setActionError(null)
    try {
      await runJob.mutateAsync(jobId)
    } catch (error) {
      setActionError(error instanceof Error ? error.message : '无法运行任务')
    }
  }

  if (detailQuery.isLoading) {
    return <div className="grid h-full place-items-center text-sm text-muted-foreground"><LoaderCircle className="animate-spin" />正在读取任务</div>
  }
  if (!job) {
    return (
      <div className="grid h-full place-items-center p-6 text-center">
        <div><h1 className="text-lg font-semibold">无法打开任务</h1><p className="mt-2 text-sm text-destructive">{detailQuery.error?.message ?? `任务 ${jobId} 不存在`}</p><Button variant="outline" className="mt-4" onClick={onBack}><ArrowLeft />返回任务列表</Button></div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto min-h-full max-w-[1440px] px-6 py-5">
        <button type="button" onClick={onBack} className="mb-4 inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"><ArrowLeft className="size-3.5" />返回任务列表</button>
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2"><JobStatusBadge status={job.status} /><span className="text-xs text-muted-foreground">{calculationLabel(job.kind)}</span></div>
            <h1 className="mt-2 truncate text-2xl font-semibold">{job.name}</h1>
            <p className="mt-1 font-mono text-[11px] text-muted-foreground">{job.id}</p>
            {job.description && <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">{job.description}</p>}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => onOpenEditor()} disabled={!revisionIdFor(job)} title={!revisionIdFor(job) ? '旧任务没有绑定可编辑的分子版本' : undefined}><Atom />打开输入结构</Button>
            <JobManagementActions job={job} onDeleted={onBack} onCloned={onOpenJob} />
            <Button onClick={() => void run()} disabled={runJob.isPending || job.status !== 'queued'}>
              {runJob.isPending ? <LoaderCircle className="animate-spin" /> : <Play />}
              {runJob.isPending ? '正在运行' : '运行任务'}
            </Button>
          </div>
        </header>

        {(actionError || job.error) && <p role="alert" className="mt-4 border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{actionError ?? job.error}</p>}

        <Tabs defaultValue="overview" className="mt-5">
          <TabsList className="h-10 rounded-none border-b border-border bg-transparent p-0">
            <Tab value="overview">概览</Tab>
            <Tab value="input">输入</Tab>
            <Tab value="outputs">结果与产物</Tab>
            <Tab value="log">实时日志</Tab>
          </TabsList>
          <TabsContent value="overview" className="mt-5">
            <Overview job={job} />
          </TabsContent>
          <TabsContent value="input" className="mt-5">
            <InputDetail job={job} onOpenEditor={() => onOpenEditor()} />
          </TabsContent>
          <TabsContent value="outputs" className="mt-5">
            <ArtifactDetail job={job} onOpenEditor={onOpenEditor} />
          </TabsContent>
          <TabsContent value="log" className="mt-5">
            <LiveLog job={job} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function Tab({ value, children }: { value: string; children: string }) {
  return <TabsTrigger value={value} className="h-10 rounded-none border-b-2 border-transparent px-5 text-xs data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none">{children}</TabsTrigger>
}

function Overview({ job }: { job: JobDetail }) {
  const rows = jobParameterRows(job)
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
      <section className="border border-border bg-card">
        <SectionHeader icon={FlaskConical} title="计算定义" subtitle="创建任务时冻结的参数" />
        <dl className="grid gap-px bg-border sm:grid-cols-2">
          {rows.map(([label, value]) => <DataCell key={label} label={label} value={value} />)}
        </dl>
      </section>
      <section className="border border-border bg-card">
        <SectionHeader icon={Play} title="执行状态" subtitle="后端持久化状态" />
        <dl className="grid gap-px bg-border">
          <DataCell label="状态" value={jobStatusLabel(job.status)} />
          <DataCell label="创建时间" value={formatJobDate(job.createdAt)} />
          <DataCell label="最后更新" value={formatJobDate(job.updatedAt)} />
          {job.supersedesJobId && <DataCell label="重试来源" value={job.supersedesJobId} />}
          <DataCell label="执行消息" value={job.message || '—'} />
        </dl>
      </section>
    </div>
  )
}

function InputDetail({ job, onOpenEditor }: { job: JobDetail; onOpenEditor: () => void }) {
  const revisionId = revisionIdFor(job)
  const revisionQuery = useMoleculeRevisionQuery(revisionId)
  const assetQuery = useMoleculeAssetQuery(revisionQuery.data?.assetId ?? null)
  return (
    <section className="border border-border bg-card">
      <SectionHeader icon={FileInput} title="不可变输入结构" subtitle="任务始终引用创建时的分子版本" action={<Button variant="outline" size="sm" onClick={onOpenEditor} disabled={!revisionId}><Atom />在编辑器中打开</Button>} />
      {!revisionId && <p className="p-5 text-sm text-muted-foreground">该任务创建于分子版本绑定启用之前，只保留旧版结构快照。</p>}
      {revisionId && revisionQuery.isLoading && <p className="p-5 text-sm text-muted-foreground">正在读取分子版本…</p>}
      {revisionId && revisionQuery.error && <p className="p-5 text-sm text-destructive">{revisionQuery.error.message}</p>}
      {revisionQuery.data && (
        <dl className="grid gap-px bg-border sm:grid-cols-2">
          <DataCell label="分子" value={assetQuery.data?.name ?? revisionQuery.data.assetId} />
          <DataCell label="原子数" value={String(revisionQuery.data.molecule.atoms.length)} />
          <DataCell label="Revision" value={revisionQuery.data.id} mono />
          <DataCell label="SHA-256" value={revisionQuery.data.contentHash} mono />
          <DataCell label="父版本" value={revisionQuery.data.parentRevisionId ?? '初始版本'} mono />
          <DataCell label="保存时间" value={formatJobDate(revisionQuery.data.createdAt)} />
        </dl>
      )}
    </section>
  )
}

function ArtifactDetail({ job, onOpenEditor }: { job: JobDetail; onOpenEditor: (artifactId?: string) => void }) {
  const [preview, setPreview] = useState<JobArtifact | null>(null)
  const artifacts = job.artifacts ?? []
  const inputs = artifacts.filter(item => item.role === 'input')
  const outputs = artifacts.filter(item => item.role === 'output')
  return (
    <>
      <div className="grid gap-5 xl:grid-cols-2">
        <ArtifactGroup title="输入产物" icon={FileInput} artifacts={inputs} onOpenEditor={onOpenEditor} onPreview={setPreview} />
        <ArtifactGroup title="输出产物" icon={FileOutput} artifacts={outputs} onOpenEditor={onOpenEditor} onPreview={setPreview} />
      </div>
      <ArtifactPreviewDialog artifact={preview} onOpenChange={open => { if (!open) setPreview(null) }} />
    </>
  )
}

function ArtifactGroup({ title, icon, artifacts, onOpenEditor, onPreview }: { title: string; icon: typeof FileInput; artifacts: JobArtifact[]; onOpenEditor: (artifactId?: string) => void; onPreview: (artifact: JobArtifact) => void }) {
  return (
    <section className="border border-border bg-card">
      <SectionHeader icon={icon} title={title} subtitle={`${artifacts.length} 个文件`} />
      {artifacts.length === 0 && <p className="p-5 text-sm text-muted-foreground">暂无产物</p>}
      <div className="divide-y divide-border">
        {artifacts.map(artifact => {
          const url = resolveJobArtifactUrl(artifact)
          return (
            <article key={artifact.id} className="flex items-center gap-3 px-4 py-3">
              <span className="grid size-9 shrink-0 place-items-center border border-border bg-muted font-mono text-[9px] uppercase">{artifact.format.slice(0, 4)}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium">{artifact.name}</p>
                <p className="mt-1 text-[10px] text-muted-foreground">{artifact.format} · {formatArtifactSize(artifact.sizeBytes)}{artifact.metadata?.energyHartree !== undefined ? ` · ${String(artifact.metadata.energyHartree)} Eh` : ''}</p>
              </div>
              {artifact.format === 'xyz' && <Button variant="outline" size="sm" onClick={() => onOpenEditor(artifact.id)}><Atom />打开结构</Button>}
              {canPreviewArtifact(artifact) && <Button variant="ghost" size="icon" className="size-8" title="预览产物" onClick={() => onPreview(artifact)}><Eye /></Button>}
              {url && <Button variant="ghost" size="icon" className="size-8" asChild title="打开或下载产物"><a href={url} target="_blank" rel="noreferrer" download><Download /><ExternalLink className="sr-only" /></a></Button>}
            </article>
          )
        })}
      </div>
    </section>
  )
}

function LiveLog({ job }: { job: JobDetail }) {
  const logQuery = useJobLogQuery(job.id)
  const snapshot = logQuery.data
  return (
    <section className="border border-border bg-card">
      <SectionHeader
        icon={ScrollText}
        title="计算日志"
        subtitle={snapshot?.source ? `${snapshot.source} · ${snapshot.complete ? '已结束' : '每秒更新'}` : '等待计算引擎写入日志'}
      />
      {logQuery.error && <p className="p-4 text-sm text-destructive">{logQuery.error.message}</p>}
      <pre className="min-h-80 max-h-[58vh] overflow-auto whitespace-pre-wrap break-words bg-neutral-950 p-4 font-mono text-xs leading-5 text-neutral-100">
        {snapshot?.content || (job.status === 'queued' ? '任务正在排队，运行后将在这里显示日志。' : '暂时没有日志输出。')}
      </pre>
    </section>
  )
}

function SectionHeader({ icon: Icon, title, subtitle, action }: { icon: typeof FlaskConical; title: string; subtitle: string; action?: React.ReactNode }) {
  return <header className="flex min-h-14 items-center gap-3 border-b border-border px-4 py-3"><Icon className="size-4 text-muted-foreground" /><div><h2 className="text-sm font-semibold">{title}</h2><p className="text-[10px] text-muted-foreground">{subtitle}</p></div>{action && <div className="ml-auto">{action}</div>}</header>
}

function DataCell({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return <div className="min-w-0 bg-card px-4 py-3"><dt className="text-[10px] text-muted-foreground">{label}</dt><dd className={mono ? 'mt-1 break-all font-mono text-[11px]' : 'mt-1 break-words text-xs font-medium'}>{value}</dd></div>
}

function revisionIdFor(job: JobDetail): string | null {
  const request = job.request
  if (!request || !('moleculeRevisionId' in request)) return null
  return typeof request.moleculeRevisionId === 'string' ? request.moleculeRevisionId : null
}

function jobParameterRows(job: JobDetail): Array<[string, string]> {
  const request = job.request
  const rows: Array<[string, string]> = [
    ['任务类型', calculationLabel(job.kind)],
    ['电荷', request ? String(request.charge) : '—'],
    ['多重度', request ? String(request.multiplicity) : '—'],
  ]
  if (isXtbRequest(request)) {
    rows.push(['方法', 'GFN2-xTB'], ['优化级别', request.optLevel], ['最大步数', String(request.maxSteps)])
  } else if (isPsi4Request(request)) {
    rows.push(['理论水平', `${request.method}/${request.basis}`], ['SCF', request.scfType.toUpperCase()], ['线程', String(request.threads)], ['内存', `${request.memoryMb} MB`])
    if ('maxSteps' in request) rows.push(['最大步数', String(request.maxSteps)])
    if ('direction' in request) rows.push(['IRC 方向', request.direction], ['IRC 点数', String(request.points)])
    if ('convergence' in request) rows.push(['收敛标准', request.convergence])
  }
  return rows
}

function isXtbRequest(request: JobDetail['request']): request is CreateXtbOptimizationJobRequest {
  return request?.method === 'gfn2' && 'optLevel' in request
}

function isPsi4Request(request: JobDetail['request']): request is CreatePsi4JobRequest {
  return Boolean(request && 'basis' in request)
}
