import type { ShelfBoxStyle, ShelfUiTheme } from './shelfStatusStyle'
import { shelfStatusStyle } from './shelfStatusStyle'

/** 工作流节点运行时状态（与后端 WorkflowNodeState 对齐）。 */
export type WorkflowNodeVisualState =
  | 'waiting'
  | 'ready'
  | 'queued'
  | 'running'
  | 'succeeded'
  | 'failed'
  | 'cancelled'
  | 'blocked'

export type ShelfEdgeState = 'pending' | 'flowing' | 'done' | 'blocked'

const NODE_LABELS: Record<WorkflowNodeVisualState, string> = {
  waiting: '等待上游',
  ready: '就绪',
  queued: '排队中',
  running: '运行中',
  succeeded: '已完成',
  failed: '失败',
  cancelled: '已取消',
  blocked: '已阻塞',
}

export function workflowNodeStateLabel(state: WorkflowNodeVisualState): string {
  return NODE_LABELS[state]
}

/** 节点状态复用任务状态的材质语言，另补 ready（亮边磨砂）和 blocked（深灰锁定）。 */
export function shelfNodeStatusStyle(state: WorkflowNodeVisualState, theme: ShelfUiTheme): ShelfBoxStyle {
  switch (state) {
    case 'waiting':
      return shelfStatusStyle('queued', theme)
    case 'ready': {
      const base = shelfStatusStyle('queued', theme)
      return { ...base, edgeColor: theme === 'day' ? 0x3b6675 : 0x5f93a6, edgeOpacity: 1, moleculeOpacity: 0.9 }
    }
    case 'queued':
      return shelfStatusStyle('queued', theme)
    case 'running':
      return shelfStatusStyle('running', theme)
    case 'succeeded':
      return shelfStatusStyle('succeeded', theme)
    case 'failed':
      return shelfStatusStyle('failed', theme)
    case 'cancelled':
      return shelfStatusStyle('cancelled', theme)
    case 'blocked':
      return theme === 'day'
        ? { glassColor: 0xd8d8dc, glassOpacity: 0.42, glassRoughness: 0.65, edgeColor: 0x7a7f88, edgeOpacity: 0.9, moleculeOpacity: 0.3, pulse: false }
        : { glassColor: 0x1d2026, glassOpacity: 0.5, glassRoughness: 0.65, edgeColor: 0x5a6069, edgeOpacity: 0.9, moleculeOpacity: 0.3, pulse: false }
  }
}
