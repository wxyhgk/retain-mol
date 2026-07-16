import { ArrowRight, Atom, CheckCircle2, CircleDot, Clock3, FlaskConical, GitBranch, PlayCircle, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useJobsQuery, resolveJobArtifactUrl, type JobSummary } from '@/features/jobs'
import { useWorkflowsQuery } from '@/features/workflows'
import { cn } from '@/lib/utils'
import { jobPath, workflowPath } from '@/app/appRoute'

export interface PlatformDashboardProps {
  onNavigate: (path: string) => void
}

export function PlatformDashboard({ onNavigate }: PlatformDashboardProps) {
  const jobsQuery = useJobsQuery()
  const workflowsQuery = useWorkflowsQuery()
  const jobs = jobsQuery.data ?? []
  const workflows = workflowsQuery.data ?? []
  const activeJobs = jobs.filter(job => job.status === 'queued' || job.status === 'running')
  const succeededJobs = jobs.filter(job => job.status === 'succeeded')
  const failedJobs = jobs.filter(job => job.status === 'failed' || job.status === 'interrupted')

  function openJob(jobId: string) {
    onNavigate(jobPath(jobId))
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto flex min-h-full max-w-[1440px] flex-col px-6 py-6">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
          <div>
            <p className="text-xs font-medium text-muted-foreground">计算平台</p>
            <h1 className="mt-1 text-2xl font-semibold">任务与工作流</h1>
            <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">从分子版本创建计算任务，追踪产物，并通过显式数据依赖组织跨任务流程。</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => onNavigate('/workflows')}><GitBranch />新建工作流</Button>
            <Button onClick={() => onNavigate('/editor')}><Atom />准备计算结构</Button>
          </div>
        </header>

        <section aria-label="任务状态概览" className="grid grid-cols-2 border-b border-l border-border md:grid-cols-4">
          <Metric label="全部任务" value={jobs.length} icon={FlaskConical} />
          <Metric label="等待或运行" value={activeJobs.length} icon={PlayCircle} />
          <Metric label="已完成" value={succeededJobs.length} icon={CheckCircle2} />
          <Metric label="需要处理" value={failedJobs.length} icon={TriangleAlert} />
        </section>

        <div className="grid min-h-[32rem] flex-1 gap-5 pt-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(19rem,0.8fr)]">
          <section className="min-h-0 border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div><h2 className="text-sm font-semibold">最近任务</h2><p className="mt-0.5 text-[11px] text-muted-foreground">按创建时间显示后端持久化任务</p></div>
              <Button variant="ghost" size="sm" onClick={() => onNavigate('/jobs')}>查看全部<ArrowRight /></Button>
            </div>
            <div className="divide-y divide-border">
              {jobsQuery.isLoading && <EmptyState text="正在加载任务…" />}
              {!jobsQuery.isLoading && jobs.length === 0 && <EmptyState text="还没有计算任务。请先在分子编辑器中准备结构。" />}
              {jobs.slice(0, 8).map(job => <RecentJobRow key={job.id} job={job} onOpen={() => openJob(job.id)} />)}
            </div>
          </section>

          <div className="grid min-h-0 content-start gap-5">
            <section className="border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div><h2 className="text-sm font-semibold">工作流</h2><p className="mt-0.5 text-[11px] text-muted-foreground">已保存的任务依赖图</p></div>
                <Button variant="ghost" size="icon" className="size-8" title="打开工作流" onClick={() => onNavigate('/workflows')}><ArrowRight /></Button>
              </div>
              <div className="divide-y divide-border">
                {workflowsQuery.isLoading && <EmptyState text="正在加载工作流…" />}
                {!workflowsQuery.isLoading && workflows.length === 0 && <EmptyState text="暂无工作流" />}
                {workflows.slice(0, 5).map(workflow => (
                  <button key={workflow.workflowId} type="button" onClick={() => onNavigate(workflowPath(workflow.workflowId))} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/70">
                    <span className="grid size-8 shrink-0 place-items-center border border-border"><GitBranch className="size-3.5" /></span>
                    <span className="min-w-0 flex-1"><span className="block truncate text-xs font-medium">{workflow.name}</span><span className="mt-0.5 block text-[10px] text-muted-foreground">{workflow.jobIds.length} 个任务 · {workflow.references.length} 条依赖</span></span>
                  </button>
                ))}
              </div>
            </section>

            <section className="border border-border bg-card p-4">
              <h2 className="text-sm font-semibold">标准计算链路</h2>
              <ol className="mt-3 grid gap-2 text-xs">
                <FlowStep number="1" text="在编辑器中保存不可变分子版本" />
                <FlowStep number="2" text="从 Revision 创建计算任务" />
                <FlowStep number="3" text="检查输出 Artifact 与收敛过程" />
                <FlowStep number="4" text="把结果保存为带来源信息的新版本" />
              </ol>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

function Metric({ label, value, icon: Icon }: { label: string; value: number; icon: typeof FlaskConical }) {
  return <div className="flex items-center gap-3 border-r border-t border-border bg-card px-4 py-4"><Icon className="size-4 text-muted-foreground" /><div><p className="text-xl font-semibold tabular-nums">{value}</p><p className="text-[11px] text-muted-foreground">{label}</p></div></div>
}

function RecentJobRow({ job, onOpen }: { job: JobSummary; onOpen: () => void }) {
  const preview = job.artifacts?.find(item => item.role === 'preview' && item.format === 'png')
  const Icon = job.status === 'running' ? CircleDot : job.status === 'queued' ? Clock3 : job.status === 'succeeded' ? CheckCircle2 : TriangleAlert
  return (
    <button type="button" onClick={onOpen} className="grid w-full grid-cols-[3rem_minmax(0,1fr)_7rem_7rem_1.5rem] items-center gap-3 px-4 py-3 text-left hover:bg-muted/70">
      {preview ? <img src={resolveJobArtifactUrl(preview)} alt="" loading="lazy" className="size-12 border border-border bg-background object-cover" /> : <span className="grid size-12 place-items-center border border-border bg-muted"><FlaskConical className="size-4 text-muted-foreground" /></span>}
      <span className="min-w-0"><span className="block truncate text-xs font-medium">{job.name}</span><span className="mt-1 block truncate font-mono text-[10px] text-muted-foreground">{job.id}</span></span>
      <span className="text-[11px] text-muted-foreground">{job.kind}</span>
      <span className={cn('flex items-center gap-1 text-[11px]', statusColor(job.status))}><Icon className="size-3" />{statusLabel(job.status)}</span>
      <ArrowRight className="size-3.5 text-muted-foreground" />
    </button>
  )
}

function statusColor(status: string) {
  if (status === 'succeeded') return 'text-emerald-700 dark:text-emerald-400'
  if (status === 'failed' || status === 'interrupted') return 'text-destructive'
  return 'text-foreground'
}

function statusLabel(status: string) {
  const labels: Record<string, string> = { created: '已创建', queued: '等待中', running: '运行中', succeeded: '已完成', failed: '失败', cancelled: '已取消', interrupted: '已中断' }
  return labels[status] ?? status
}

function EmptyState({ text }: { text: string }) {
  return <p className="px-4 py-8 text-center text-xs text-muted-foreground">{text}</p>
}

function FlowStep({ number, text }: { number: string; text: string }) {
  return <li className="flex items-center gap-3"><span className="grid size-6 shrink-0 place-items-center border border-border font-mono text-[10px]">{number}</span><span>{text}</span></li>
}
