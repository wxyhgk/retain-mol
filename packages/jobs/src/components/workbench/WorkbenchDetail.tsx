import { useState } from 'react'
import { Atom, Download, ExternalLink, Eye, FileInput, FileOutput, FlaskConical, LoaderCircle, Play } from 'lucide-react'
import { Button, Tabs, TabsContent, TabsList, TabsTrigger } from '@retainmol/ui-kit'
import { useJobDetailQuery, useRunJobMutation } from '../../application/jobQueries'
import type { JobArtifact, JobDetail } from '../../domain/jobTypes'
import { calculationLabel, canPreviewArtifact, formatJobDate, jobStatusLabel } from '../../domain/jobPresentation'
import { revisionIdFor } from '../../domain/jobRequest'
import { resolveJobArtifactUrl } from '../../infrastructure/jobsApiClient'
import { JobManagementActions } from '../JobManagementActions'
import { JobStatusBadge } from '../JobStatusBadge'
import { ArtifactPreviewDialog } from '../ArtifactPreviewDialog'
import { JobLogViewer } from '../JobLogViewer'
import { JobSectionHeader } from '../shared/JobSectionHeader'
import { DataCell, JobParameterList } from '../shared/JobParameterList'
import { JobInputSource } from '../shared/JobInputSource'
import { JobArtifactList } from '../shared/JobArtifactList'
import { JobEmptyState } from '../shared/JobEmptyState'

export interface WorkbenchDetailProps {
  jobId: string
  onOpenEditor: (artifactId?: string) => void
  /** 删除/取消后回到未选中状态。 */
  onJobGone: () => void
  onCloned: (jobId: string) => void
}

/** 工作台右栏:所选任务的 Details | Files | Outputs | Logs 常驻面板。 */
export function WorkbenchDetail({ jobId, onOpenEditor, onJobGone, onCloned }: WorkbenchDetailProps) {
  const detailQuery = useJobDetailQuery(jobId)
  const runJob = useRunJobMutation()
  const [actionError, setActionError] = useState<string | null>(null)
  const job = detailQuery.data

  if (detailQuery.isLoading) {
    return <div className="grid h-full place-items-center text-xs text-muted-foreground"><LoaderCircle className="animate-spin" />正在读取任务</div>
  }
  if (!job) {
    return <JobEmptyState className="py-16" title={detailQuery.error?.message ?? `任务 ${jobId} 不存在`} />
  }

  async function run() {
    setActionError(null)
    try {
      await runJob.mutateAsync(jobId)
    } catch (error) {
      setActionError(error instanceof Error ? error.message : '无法运行任务')
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-card">
      <header className="shrink-0 space-y-2.5 border-b border-border p-4">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold tracking-tight" title={job.name}>{job.name}</h1>
          <p className="mt-1.5 flex flex-wrap items-center gap-2">
            <JobStatusBadge status={job.status} />
            <span className="text-[11px] text-muted-foreground">{calculationLabel(job.kind)}</span>
            <span className="truncate font-mono text-[10px] tabular-nums text-muted-foreground">{job.id}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenEditor()}
            disabled={!revisionIdFor(job)}
            title={!revisionIdFor(job) ? '旧任务没有绑定可编辑的分子版本' : undefined}
          >
            <Atom />打开输入结构
          </Button>
          {job.status === 'queued' && (
            <Button size="sm" onClick={() => void run()} disabled={runJob.isPending}>
              {runJob.isPending ? <LoaderCircle className="animate-spin" /> : <Play />}
              {runJob.isPending ? '正在运行' : '运行任务'}
            </Button>
          )}
          <JobManagementActions job={job} onDeleted={onJobGone} onCloned={onCloned} />
        </div>
        {(actionError || job.error) && (
          <p role="alert" className="border border-destructive/30 bg-destructive/5 p-2 text-xs text-destructive">
            {actionError ?? job.error}
          </p>
        )}
      </header>

      <Tabs defaultValue="details" className="flex min-h-0 flex-1 flex-col">
        <TabsList className="h-9 shrink-0 justify-start rounded-none border-b border-border bg-transparent p-0">
          {([
            ['details', 'Details'],
            ['files', 'Files'],
            ['outputs', 'Outputs'],
            ['logs', 'Logs'],
          ] as const).map(([value, label]) => (
            <TabsTrigger
              key={value}
              value={value}
              className="h-9 rounded-none border-b-2 border-transparent px-3 text-[11px] data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <TabsContent value="details" className="m-0 space-y-4 p-3">
            <section className="rounded-md border border-border shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
              <JobSectionHeader icon={FlaskConical} title="计算定义" subtitle="创建任务时冻结的参数" />
              <JobParameterList job={job} layout="cells" />
            </section>
            <section className="rounded-md border border-border shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
              <JobSectionHeader icon={Play} title="执行状态" subtitle="后端持久化状态" />
              <dl className="grid gap-px bg-border">
                <DataCell label="状态" value={jobStatusLabel(job.status)} />
                <DataCell label="创建时间" value={formatJobDate(job.createdAt)} />
                <DataCell label="最后更新" value={formatJobDate(job.updatedAt)} />
                {job.supersedesJobId && <DataCell label="重试来源" value={job.supersedesJobId} />}
                <DataCell label="执行消息" value={job.message || '—'} />
              </dl>
            </section>
          </TabsContent>
          <TabsContent value="files" className="m-0 space-y-4 p-3">
            <JobInputSource
              job={job}
              variant="full"
              action={<Button variant="outline" size="sm" onClick={() => onOpenEditor()} disabled={!revisionIdFor(job)}><Atom />在编辑器中打开</Button>}
            />
            <InputArtifacts job={job} />
          </TabsContent>
          <TabsContent value="outputs" className="m-0 p-3">
            <OutputArtifacts job={job} onOpenEditor={onOpenEditor} />
          </TabsContent>
          <TabsContent value="logs" className="m-0 h-full">
            <JobLogViewer jobId={job.id} jobName={job.name} status={job.status} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}

function InputArtifacts({ job }: { job: JobDetail }) {
  const artifacts = (job.artifacts ?? []).filter(item => item.role === 'input')
  if (artifacts.length === 0) return null
  return <JobArtifactList title="输入产物" icon={FileInput} artifacts={artifacts} renderActions={() => null} />
}

function OutputArtifacts({ job, onOpenEditor }: { job: JobDetail; onOpenEditor: (artifactId?: string) => void }) {
  const [preview, setPreview] = useState<JobArtifact | null>(null)
  const artifacts = (job.artifacts ?? []).filter(item => item.role === 'output' || item.role === 'preview')

  function renderActions(artifact: JobArtifact) {
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
      <JobArtifactList title="输出产物" icon={FileOutput} artifacts={artifacts} renderActions={renderActions} />
      <ArtifactPreviewDialog artifact={preview} onOpenChange={open => { if (!open) setPreview(null) }} />
    </>
  )
}
