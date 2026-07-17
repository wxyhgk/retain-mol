import { BarChart3, LoaderCircle } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { useJobDetailQuery, useJobsQuery, useJobUiStore } from '@retainmol/jobs'
import { useOptimizationTrajectoryQuery } from '../application/trajectoryQueries'
import { OptimizationTrajectoryChart } from './OptimizationTrajectoryChart'

export function AnalysisWorkspace() {
  const jobsQuery = useJobsQuery()
  const selectedJobId = useJobUiStore(state => state.selectedJobId)
  const selectJob = useJobUiStore(state => state.selectJob)
  const completedJobs = useMemo(
    () => (jobsQuery.data ?? []).filter(job => job.status === 'succeeded'),
    [jobsQuery.data],
  )

  useEffect(() => {
    if (!selectedJobId && completedJobs[0]) selectJob(completedJobs[0].id)
  }, [completedJobs, selectJob, selectedJobId])

  const effectiveJobId = completedJobs.some(job => job.id === selectedJobId)
    ? selectedJobId
    : completedJobs[0]?.id ?? null
  const detailQuery = useJobDetailQuery(effectiveJobId)
  const trajectoryArtifact = detailQuery.data?.artifacts?.find(
    artifact => artifact.name === 'optimization-trajectory.json' || artifact.format === 'trajectory-json',
  ) ?? null
  const trajectoryQuery = useOptimizationTrajectoryQuery(trajectoryArtifact)

  return (
    <div className="flex h-full min-h-0 flex-col bg-card">
      <header className="flex h-12 shrink-0 items-center gap-3 border-b border-border px-4">
        <BarChart3 className="size-4" />
        <div>
          <h2 className="text-sm font-semibold">计算分析</h2>
          <p className="text-[11px] text-muted-foreground">只读取任务产生的真实 Artifact</p>
        </div>
        <select
          className="ml-auto h-8 max-w-72 rounded-md border border-input bg-background px-2 text-xs"
          value={effectiveJobId ?? ''}
          onChange={event => selectJob(event.target.value || null)}
          aria-label="选择已完成任务"
        >
          {completedJobs.length === 0 && <option value="">暂无已完成任务</option>}
          {completedJobs.map(job => <option key={job.id} value={job.id}>{job.name}</option>)}
        </select>
      </header>
      <div className="min-h-0 flex-1 overflow-auto p-4">
        {(jobsQuery.isLoading || detailQuery.isLoading || trajectoryQuery.isLoading) && (
          <div className="grid h-full place-items-center text-xs text-muted-foreground"><LoaderCircle className="animate-spin" />加载计算结果</div>
        )}
        {!jobsQuery.isLoading && completedJobs.length === 0 && (
          <div className="grid h-full place-items-center text-center text-xs text-muted-foreground">完成一个 xTB 优化任务后，这里会显示真实收敛曲线。</div>
        )}
        {effectiveJobId && !detailQuery.isLoading && !trajectoryArtifact && (
          <div className="grid h-full place-items-center text-center text-xs text-muted-foreground">该任务没有 `optimization-trajectory.json`。旧任务需要重新运行后才能生成轨迹。</div>
        )}
        {trajectoryQuery.isError && (
          <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-xs text-destructive">{trajectoryQuery.error.message}</div>
        )}
        {trajectoryQuery.data && <OptimizationTrajectoryChart trajectory={trajectoryQuery.data} />}
      </div>
    </div>
  )
}
