import { ArrowRight, Atom, GitBranch } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  JobCard,
  JobEmptyState,
  JobStatMetrics,
  useJobsQuery,
} from '@retainmol/jobs'
import { useWorkflowsQuery } from '@/features/workflows'
import { jobPath, jobsPath, workflowPath } from '@/app/appRoute'

const RECENT_JOBS_LIMIT = 8
const RECENT_WORKFLOWS_LIMIT = 5

export interface PlatformDashboardProps {
  onNavigate: (path: string) => void
  recentJobsLimit?: number
  recentWorkflowsLimit?: number
}

export function PlatformDashboard({
  onNavigate,
  recentJobsLimit = RECENT_JOBS_LIMIT,
  recentWorkflowsLimit = RECENT_WORKFLOWS_LIMIT,
}: PlatformDashboardProps) {
  const jobsQuery = useJobsQuery()
  const workflowsQuery = useWorkflowsQuery()
  const jobs = jobsQuery.data ?? []
  const workflows = workflowsQuery.data ?? []

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

        <JobStatMetrics jobs={jobs} onSelectBucket={bucket => onNavigate(jobsPath(bucket))} />

        <div className="grid min-h-[32rem] flex-1 gap-5 pt-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(19rem,0.8fr)]">
          <section className="min-h-0 border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div><h2 className="text-sm font-semibold">最近任务</h2><p className="mt-0.5 text-[11px] text-muted-foreground">按创建时间显示后端持久化任务</p></div>
              <Button variant="ghost" size="sm" onClick={() => onNavigate('/jobs')}>查看全部<ArrowRight /></Button>
            </div>
            <div className="divide-y divide-border">
              {jobsQuery.isLoading && <JobEmptyState title="正在加载任务…" />}
              {!jobsQuery.isLoading && jobs.length === 0 && <JobEmptyState title="还没有计算任务。请先在分子编辑器中准备结构。" />}
              {jobs.slice(0, recentJobsLimit).map(job => (
                <JobCard key={job.id} job={job} variant="row" className="border-x-0 border-t-0 last:border-b-0" onOpen={() => openJob(job.id)} />
              ))}
            </div>
          </section>

          <div className="grid min-h-0 content-start gap-5">
            <section className="border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div><h2 className="text-sm font-semibold">工作流</h2><p className="mt-0.5 text-[11px] text-muted-foreground">已保存的任务依赖图</p></div>
                <Button variant="ghost" size="icon" className="size-8" title="打开工作流" onClick={() => onNavigate('/workflows')}><ArrowRight /></Button>
              </div>
              <div className="divide-y divide-border">
                {workflowsQuery.isLoading && <JobEmptyState title="正在加载工作流…" />}
                {!workflowsQuery.isLoading && workflows.length === 0 && <JobEmptyState title="暂无工作流" />}
                {workflows.slice(0, recentWorkflowsLimit).map(workflow => (
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


function FlowStep({ number, text }: { number: string; text: string }) {
  return <li className="flex items-center gap-3"><span className="grid size-6 shrink-0 place-items-center border border-border font-mono text-[10px]">{number}</span><span>{text}</span></li>
}
