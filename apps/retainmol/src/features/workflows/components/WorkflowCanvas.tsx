import { useEffect } from 'react'
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
}

function createNodes(jobs: WorkflowJobOption[]): Node[] {
  return jobs.map((job, index) => ({
    id: job.id,
    position: { x: 40 + (index % 3) * 220, y: 40 + Math.floor(index / 3) * 130 },
    data: { label: `${job.name}${job.status ? ` · ${job.status}` : ''}` },
    className: 'border border-border bg-card text-card-foreground text-xs shadow-sm rounded-sm',
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

export function WorkflowCanvas({ jobs, references, onConnectJobs }: WorkflowCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(createNodes(jobs))
  const [edges, setEdges, onEdgesChange] = useEdgesState(createEdges(references))

  useEffect(() => setNodes(current => {
    const positions = new Map(current.map(node => [node.id, node.position]))
    return createNodes(jobs).map(node => ({ ...node, position: positions.get(node.id) ?? node.position }))
  }), [jobs, setNodes])
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
