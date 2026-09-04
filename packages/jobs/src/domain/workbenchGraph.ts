import type { JobStatus } from './jobTypes'
import type { JobArtifact } from './jobTypes'

/**
 * 工作台中栏依赖图的数据契约;由宿主(app)把 workflow 引用投影成这个结构,
 * 渲染由宿主注入(React Flow 只读画布),jobs 包不持有图渲染实现。
 */
export interface WorkbenchGraphNode {
  jobId: string
  name: string
  kindLabel: string
  /** 原始计算类型标识(如 xtb-optimization / psi4-frequency),用于节点着色。 */
  kind?: string
  status: JobStatus
  statusLabel: string
  elapsedLabel?: string
  /** 任务产物(节点卡用 preview 图渲染分子缩略图)。 */
  artifacts?: JobArtifact[]
}

export interface WorkbenchGraphEdge {
  sourceJobId: string
  targetJobId: string
  /** 通常是来源产物/输入名,如 optimization-trajectory.json。 */
  label?: string
}

export interface WorkbenchGraphData {
  nodes: readonly WorkbenchGraphNode[]
  edges: readonly WorkbenchGraphEdge[]
}
