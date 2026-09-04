import { useMemo, useState } from 'react'
import dagre from '@dagrejs/dagre'
import {
  BaseEdge,
  Controls,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  getBezierPath,
  type Edge,
  type EdgeProps,
  type Node,
  type NodeProps,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Workflow } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ChemStatusHex, JobThumbnail } from '@retainmol/jobs'
import type { JobStatus, WorkbenchGraphData, WorkbenchGraphNode } from '@retainmol/jobs'

const NODE_WIDTH = 264
const NODE_HEIGHT = 96

/** 苯环底纹(顶点朝上的六边形平铺),实验台画布质感。 */
const HEX_PATTERN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='52' height='60' viewBox='0 0 52 60'%3E%3Cpath d='M26 3 L49 16.5 L49 43.5 L26 57 L3 43.5 L3 16.5 Z' fill='none' stroke='rgba(0,0,0,0.05)' stroke-width='1'/%3E%3C/svg%3E")`

function edgeStroke(targetStatus: JobStatus | undefined) {
  if (targetStatus === 'running') return '#0d9488'
  if (targetStatus === 'failed' || targetStatus === 'interrupted') return '#e11d48'
  return 'rgba(100,116,139,0.45)'
}

/** 化学键边:氢键虚线(排队)、一颗流动电子(运行中)、楔形箭头。 */
function BondEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, markerEnd, label, data }: EdgeProps) {
  const [path, labelX, labelY] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition })
  const targetStatus = (data as { targetStatus?: JobStatus } | undefined)?.targetStatus
  const running = targetStatus === 'running'
  const pending = targetStatus === 'queued' || targetStatus === 'created'
  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        markerEnd={markerEnd}
        style={{
          stroke: edgeStroke(targetStatus),
          strokeWidth: 1.5,
          strokeDasharray: pending ? '5 4' : running ? '7 4' : undefined,
          animation: running ? 'chem-edge-flow 0.9s linear infinite' : undefined,
        }}
      />
      {running && (
        <circle r="2.5" fill="#0d9488" opacity="0.9">
          <animateMotion dur="1.8s" repeatCount="indefinite" path={path} />
        </circle>
      )}
      {label ? (
        <text x={labelX} y={labelY - 6} textAnchor="middle" style={{ fontSize: 10, fill: 'rgba(100,116,139,0.85)' }}>
          {label}
        </text>
      ) : null}
    </>
  )
}

const edgeTypes = { bond: BondEdge }

type JobFlowNode = Node<{ node: WorkbenchGraphNode; selected: boolean }, 'jobCard'>

/** 节点卡:分子缩略图 + 干净白卡 + 细边框 + 软投影;drag/connect 全部关闭,只读。 */
function JobCardNode({ data }: NodeProps<JobFlowNode>) {
  const { node, selected } = data
  return (
    <div
      className={cn(
        'relative flex items-center gap-3 rounded-lg border bg-card p-2.5 text-left shadow-sm transition-shadow',
        selected
          ? 'border-foreground/70 shadow-md ring-2 ring-foreground/15'
          : node.status === 'running'
            ? 'border-teal-600/50 hover:shadow-md'
            : 'border-border hover:shadow-md',
      )}
      style={{ width: NODE_WIDTH, height: NODE_HEIGHT }}
    >
      <Handle type="target" position={Position.Left} className="!opacity-0" />
      <JobThumbnail job={{ artifacts: node.artifacts }} size="lg" />
      <span className="flex min-w-0 flex-1 flex-col self-stretch py-0.5">
        <span className="flex items-center gap-1.5">
          <ChemStatusHex status={node.status} size="sm" />
          <span className="min-w-0 flex-1 truncate text-xs font-semibold">{node.name}</span>
        </span>
        <span className="mt-1 truncate text-[10px] text-muted-foreground">{node.kindLabel}</span>
        <span className="mt-auto flex items-center justify-between text-[10px] text-muted-foreground">
          <span>{node.statusLabel}</span>
          {node.elapsedLabel && <span className="font-mono tabular-nums">{node.elapsedLabel}</span>}
        </span>
      </span>
      <Handle type="source" position={Position.Right} className="!opacity-0" />
    </div>
  )
}

const nodeTypes = { jobCard: JobCardNode }

function buildFlow(graph: WorkbenchGraphData, selectedJobId: string | null) {
  const g = new dagre.graphlib.Graph()
  g.setGraph({ rankdir: 'LR', nodesep: 32, ranksep: 96, marginx: 16, marginy: 16 })
  g.setDefaultEdgeLabel(() => ({}))
  for (const node of graph.nodes) g.setNode(node.jobId, { width: NODE_WIDTH, height: NODE_HEIGHT })
  for (const edge of graph.edges) g.setEdge(edge.sourceJobId, edge.targetJobId)
  dagre.layout(g)

  const nodes: JobFlowNode[] = graph.nodes.map(node => {
    const position = g.node(node.jobId)
    return {
      id: node.jobId,
      type: 'jobCard' as const,
      position: { x: position.x - NODE_WIDTH / 2, y: position.y - NODE_HEIGHT / 2 },
      data: { node, selected: node.jobId === selectedJobId },
      draggable: false,
      connectable: false,
    }
  })
  const statusById = new Map(graph.nodes.map(node => [node.jobId, node.status]))
  const edges: Edge[] = graph.edges.map((edge, index) => {
    const targetStatus = statusById.get(edge.targetJobId)
    return {
      id: `e-${edge.sourceJobId}-${edge.targetJobId}-${index}`,
      source: edge.sourceJobId,
      target: edge.targetJobId,
      type: 'bond' as const,
      label: edge.label,
      data: { targetStatus },
      markerEnd: { type: MarkerType.ArrowClosed, width: 14, height: 14, color: edgeStroke(targetStatus) },
    }
  })
  return { nodes, edges }
}

export interface WorkflowReadOnlyCanvasProps {
  /** 选中任务所在的依赖图;null = 未选择任务。 */
  graph: WorkbenchGraphData | null
  selectedJobId: string | null
  onSelectJob: (jobId: string) => void
}

/** 只读 DAG 画布(React Flow 渲染 + dagre 分层),供任务工作台中栏注入使用。 */
export function WorkflowReadOnlyCanvas({ graph, selectedJobId, onSelectJob }: WorkflowReadOnlyCanvasProps) {
  const [view, setView] = useState<'graph' | 'stack'>('graph')
  const { nodes, edges } = useMemo(
    () => (graph ? buildFlow(graph, selectedJobId) : { nodes: [], edges: [] }),
    [graph, selectedJobId],
  )

  if (!graph) {
    return (
      <div className="grid h-full place-items-center text-center text-xs text-muted-foreground">
        <div>
          <Workflow className="mx-auto mb-2 size-8 opacity-40" />
          从左侧选择一个任务,在这里查看它的计算流程
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      <div className="absolute left-3 top-3 z-10 flex items-center gap-0.5 rounded-full border border-border bg-card/90 p-0.5 shadow-sm backdrop-blur" role="group" aria-label="流程视图切换">
        {(['graph', 'stack'] as const).map(option => (
          <button
            key={option}
            type="button"
            onClick={() => setView(option)}
            aria-pressed={view === option}
            className={cn(
              'rounded-full px-2.5 py-1 text-[11px] transition-colors',
              view === option ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {option === 'graph' ? 'Graph' : 'Stack'}
          </button>
        ))}
      </div>
      <span className="absolute right-3 top-3 z-10 rounded-full border border-border bg-card/90 px-2.5 py-1 text-[10px] tabular-nums text-muted-foreground shadow-sm backdrop-blur">
        {graph.nodes.length} 个任务 · {graph.edges.length} 条依赖
      </span>

      {view === 'graph' ? (
        <div className="min-h-0 flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            fitViewOptions={{ padding: 0.25, maxZoom: 1.2 }}
            minZoom={0.3}
            maxZoom={1.6}
            nodesDraggable={false}
            nodesConnectable={false}
            onNodeClick={(_, node) => onSelectJob(node.id)}
            style={{ backgroundImage: HEX_PATTERN, backgroundSize: '52px 60px' }}
          >
            <Controls showInteractive={false} position="bottom-left" />
          </ReactFlow>
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <ol className="mx-auto max-w-md space-y-2">
            {[...nodes]
              .sort((a, b) => a.position.x - b.position.x || a.position.y - b.position.y)
              .map((flowNode, index) => (
                <li key={flowNode.id} className="relative">
                  {index > 0 && <span aria-hidden className="absolute -top-2 left-1/2 h-2 w-px bg-border" />}
                  <button
                    type="button"
                    onClick={() => onSelectJob(flowNode.id)}
                    className={cn(
                      'flex w-full items-center gap-2.5 rounded-lg border bg-card p-2.5 text-left shadow-sm',
                      flowNode.id === selectedJobId ? 'border-foreground/70 ring-2 ring-foreground/15' : 'border-border',
                    )}
                  >
                    <span className="grid size-6 shrink-0 place-items-center rounded-full border border-border text-[10px] text-muted-foreground">
                      {index + 1}
                    </span>
                    <ChemStatusHex status={flowNode.data.node.status} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-semibold">{flowNode.data.node.name}</span>
                      <span className="block truncate text-[10px] text-muted-foreground">
                        {flowNode.data.node.kindLabel} · {flowNode.data.node.statusLabel}
                        {flowNode.data.node.elapsedLabel ? ` · ${flowNode.data.node.elapsedLabel}` : ''}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
          </ol>
        </div>
      )}
    </div>
  )
}
