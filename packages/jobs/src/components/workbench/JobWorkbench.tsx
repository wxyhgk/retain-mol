import { useMemo, type ReactNode } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { useJobsQuery } from '../../application/jobQueries'
import type { JobStatusBucket } from '../../domain/jobFilter'
import { calculationLabel, formatJobDuration, jobStatusLabel } from '../../domain/jobPresentation'
import type { WorkbenchGraphData } from '../../domain/workbenchGraph'
import { WorkbenchTaskList } from './WorkbenchTaskList'
import { WorkbenchDetail } from './WorkbenchDetail'

/** 中栏渲染参数:数据 + 选中态 + 选择回调,交给宿主注入的图画布。 */
export interface WorkbenchGraphRenderArgs {
  graph: WorkbenchGraphData | null
  selectedJobId: string | null
  onSelectJob: (jobId: string) => void
}

export interface JobWorkbenchProps {
  /** 路由驱动的选中任务;null = 未选择(中栏显示空状态)。 */
  selectedJobId: string | null
  onSelectJob: (jobId: string | null) => void
  /** 打开编辑器:不带 artifactId 表示"准备新计算"或打开输入结构。 */
  onOpenEditor: (artifactId?: string) => void
  /**
   * 选中任务所在的依赖图(宿主由 workflow 引用投影);不传或 null 时,
   * 中栏退化为仅含选中任务的单节点图。
   */
  graph?: WorkbenchGraphData | null
  /**
   * 中栏图渲染器,由宿主注入(app 侧是 React Flow 只读画布)。
   * jobs 包不持有图渲染实现 —— @xyflow/react 只能出现在 app 的 adapter 里。
   */
  renderGraph: (args: WorkbenchGraphRenderArgs) => ReactNode
  initialBucket?: JobStatusBucket | null
}

function ResizeHandle() {
  return (
    <PanelResizeHandle className="w-px bg-border transition-colors data-[resize-handle-state=hover]:bg-foreground/30 data-[resize-handle-state=drag]:bg-foreground/50" />
  )
}

/** 任务工作台:左任务卡列表 | 中依赖图 | 右详情面板,三栏可拖拽。 */
export function JobWorkbench({ selectedJobId, onSelectJob, onOpenEditor, graph, renderGraph, initialBucket }: JobWorkbenchProps) {
  const jobsQuery = useJobsQuery()
  const jobs = useMemo(() => jobsQuery.data ?? [], [jobsQuery.data])

  const effectiveGraph = useMemo<WorkbenchGraphData | null>(() => {
    if (graph) return graph
    const selected = jobs.find(job => job.id === selectedJobId)
    if (!selected) return null
    const terminal = selected.status === 'succeeded' || selected.status === 'failed'
      || selected.status === 'cancelled' || selected.status === 'interrupted'
    return {
      nodes: [{
        jobId: selected.id,
        name: selected.name,
        kindLabel: calculationLabel(selected.kind),
        status: selected.status,
        statusLabel: jobStatusLabel(selected.status),
        elapsedLabel: formatJobDuration(selected.createdAt, terminal ? selected.updatedAt : undefined),
        artifacts: selected.artifacts,
      }],
      edges: [],
    }
  }, [graph, jobs, selectedJobId])

  return (
    <div className="h-full min-h-0 bg-background">
      <PanelGroup direction="horizontal" className="relative h-full min-h-0" autoSaveId="retainmol-job-workbench">
      <Panel defaultSize={24} minSize={16} maxSize={40} className="min-h-0">
        <WorkbenchTaskList
          jobs={jobs}
          isLoading={jobsQuery.isLoading}
          errorMessage={jobsQuery.error?.message}
          selectedJobId={selectedJobId}
          initialBucket={initialBucket}
          onSelectJob={onSelectJob}
          onOpenEditor={() => onOpenEditor()}
        />
      </Panel>
      <ResizeHandle />
      <Panel defaultSize={46} minSize={25} className="min-h-0">
        {renderGraph({ graph: effectiveGraph, selectedJobId, onSelectJob })}
      </Panel>
      <ResizeHandle />
      <Panel defaultSize={30} minSize={22} maxSize={45} className="min-h-0">
        {selectedJobId ? (
          <WorkbenchDetail
            jobId={selectedJobId}
            onOpenEditor={onOpenEditor}
            onJobGone={() => onSelectJob(null)}
            onCloned={onSelectJob}
          />
        ) : (
          <div className="grid h-full place-items-center bg-card text-xs text-muted-foreground">
            任务详情会显示在这里
          </div>
        )}
      </Panel>
    </PanelGroup>
    </div>
  )
}
