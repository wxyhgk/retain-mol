import { useState } from 'react'
import { ArrowLeft, Atom, Download, ExternalLink, Eye, FileInput, FileOutput, FlaskConical, LoaderCircle, Play } from 'lucide-react'
import { Button } from '@retainmol/ui-kit'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@retainmol/ui-kit'
import { useJobDetailQuery, useRunJobMutation } from '../application/jobQueries'
import type { JobArtifact, JobDetail } from '../domain/jobTypes'
import { calculationLabel, canPreviewArtifact, formatJobDate, jobStatusLabel } from '../domain/jobPresentation'
import { revisionIdFor } from '../domain/jobRequest'
import { resolveJobArtifactUrl } from '../infrastructure/jobsApiClient'
import { JobManagementActions } from './JobManagementActions'
import { JobStatusBadge } from './JobStatusBadge'
import { ArtifactPreviewDialog } from './ArtifactPreviewDialog'
import { JobLogViewer } from './JobLogViewer'
import { JobSectionHeader } from './shared/JobSectionHeader'
import { DataCell, JobParameterList } from './shared/JobParameterList'
import { JobInputSource } from './shared/JobInputSource'
import { JobArtifactList } from './shared/JobArtifactList'

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
            <JobInputSource
              job={job}
              variant="full"
              action={<Button variant="outline" size="sm" onClick={() => onOpenEditor()} disabled={!revisionIdFor(job)}><Atom />在编辑器中打开</Button>}
            />
          </TabsContent>
          <TabsContent value="outputs" className="mt-5">
            <ArtifactDetail job={job} onOpenEditor={onOpenEditor} />
          </TabsContent>
          <TabsContent value="log" className="mt-5">
            <JobLogViewer jobId={job.id} jobName={job.name} status={job.status} />
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
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
      <section className="border border-border bg-card">
        <JobSectionHeader icon={FlaskConical} title="计算定义" subtitle="创建任务时冻结的参数" />
        <JobParameterList job={job} layout="cells" />
      </section>
      <section className="border border-border bg-card">
        <JobSectionHeader icon={Play} title="执行状态" subtitle="后端持久化状态" />
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

function ArtifactDetail({ job, onOpenEditor }: { job: JobDetail; onOpenEditor: (artifactId?: string) => void }) {
  const [preview, setPreview] = useState<JobArtifact | null>(null)
  const artifacts = job.artifacts ?? []

  function artifactActions(artifact: JobArtifact) {
    const url = resolveJobArtifactUrl(artifact)
    return (
      <>
        {artifact.format === 'xyz' && <Button variant="outline" size="sm" onClick={() => onOpenEditor(artifact.id)}><Atom />打开结构</Button>}
        {canPreviewArtifact(artifact) && <Button variant="ghost" size="icon" className="size-8" title="预览产物" onClick={() => setPreview(artifact)}><Eye /></Button>}
        {url && <Button variant="ghost" size="icon" className="size-8" asChild title="打开或下载产物"><a href={url} target="_blank" rel="noreferrer" download><Download /><ExternalLink className="sr-only" /></a></Button>}
      </>
    )
  }

  return (
    <>
      <div className="grid gap-5 xl:grid-cols-2">
        <JobArtifactList title="输入产物" icon={FileInput} artifacts={artifacts.filter(item => item.role === 'input')} renderActions={artifactActions} />
        <JobArtifactList title="输出产物" icon={FileOutput} artifacts={artifacts.filter(item => item.role === 'output')} renderActions={artifactActions} />
      </div>
      <ArtifactPreviewDialog artifact={preview} onOpenChange={open => { if (!open) setPreview(null) }} />
    </>
  )
}

