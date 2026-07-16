import { useEffect } from 'react'
import { Pencil } from 'lucide-react'
import {
  Background,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlow,
  addEdge,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import type { WorkflowJobOption, WorkflowReferenceDraft } from '../domain/workflowTypes'

export interface WorkflowCanvasProps {
  jobs: WorkflowJobOption[]
  references: WorkflowReferenceDraft[]
  onConnectJobs?: (sourceJobId: string, targetJobId: string) => void
  onEditJobStructure?: (jobId: string) => void
}

function createNodes(
  jobs: WorkflowJobOption[],
  onEditJobStructure?: (jobId: string) => void,
): Node[] {
  return jobs.map((job, index) => ({
    id: job.id,
    position: { x: 40 + (index % 3) * 220, y: 40 + Math.floor(index / 3) * 130 },
    data: {
      label: (
        <div className="flex min-w-40 items-center gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium">{job.name}</p>
            {job.status && <p className="mt-0.5 text-[10px] text-muted-foreground">{job.status}</p>}
          </div>
          {onEditJobStructure && (
            <button
              type="button"
              className="nodrag nopan grid size-7 shrink-0 place-items-center border border-border bg-background hover:bg-muted"
              title="编辑该任务的输入结构"
              aria-label={`编辑 ${job.name} 的输入结构`}
              onClick={event => {
                event.stopPropagation()
                onEditJobStructure(job.id)
              }}
            >
              <Pencil className="size-3.5" />
            </button>
          )}
        </div>
      ),
    },
    className: 'border border-border bg-card text-card-foreground text-xs shadow-sm rounded-sm px-3 py-2',
  }))
}

function createEdges(references: WorkflowReferenceDraft[]): Edge[] {
  return references.map((reference, index) => ({
    id: `${reference.sourceJobId}-${reference.targetJobId}-${reference.targetInputName}-${index}`,
    source: reference.sourceJobId,
    target: reference.targetJobId,
    label: `${reference.sourceName} → ${reference.targetInputName}`,
    markerEnd: { type: MarkerType.ArrowClosed },
    animated: false,
  }))
}

export function WorkflowCanvas({ jobs, references, onConnectJobs, onEditJobStructure }: WorkflowCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(createNodes(jobs, onEditJobStructure))
  const [edges, setEdges, onEdgesChange] = useEdgesState(createEdges(references))

  useEffect(() => setNodes(current => {
    const positions = new Map(current.map(node => [node.id, node.position]))
    return createNodes(jobs, onEditJobStructure).map(node => ({ ...node, position: positions.get(node.id) ?? node.position }))
  }), [jobs, onEditJobStructure, setNodes])
  useEffect(() => setEdges(createEdges(references)), [references, setEdges])

  const connect = (connection: Connection) => {
    if (!connection.source || !connection.target || connection.source === connection.target) return
    setEdges(current => addEdge({ ...connection, markerEnd: { type: MarkerType.ArrowClosed } }, current))
    onConnectJobs?.(connection.source, connection.target)
  }

  return (
    <div className="min-h-0 flex-1 bg-muted/20" aria-label="计算工作流画布">
      <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={connect} fitView>
        <Background gap={20} size={1} />
        <MiniMap pannable zoomable />
        <Controls />
      </ReactFlow>
    </div>
  )
}

export default WorkflowCanvas
