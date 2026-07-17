import { SAMPLE_MOLECULES } from '@retainmol/mol-viewer/samples'
import type { Molecule } from '@retainmol/mol-viewer/core'
import type { JobSummary } from '../../../domain/jobTypes'
import type { ShelfMoleculeEntry } from '../../../domain/shelf/jobMolecule'
import type { ShelfEdgeState, WorkflowNodeVisualState } from '../../../domain/shelf/shelfNodeStyle'

export interface MockWorkflowNode {
  jobId: string
  name: string
  kind: string
  moleculeName: string
}

export interface MockWorkflowEdge {
  id: string
  sourceJobId: string
  targetJobId: string
}

/** 经典 TS 链路：反应物/产物优化 → TS 初猜 → TS 精修 → 频率 + IRC。 */
export const MOCK_NODES: MockWorkflowNode[] = [
  { jobId: 'mock-reactant', name: '反应物优化', kind: 'xtb-optimization', moleculeName: '乙醇' },
  { jobId: 'mock-product', name: '产物优化', kind: 'xtb-optimization', moleculeName: '苯' },
  { jobId: 'mock-ts-guess', name: 'TS 初猜', kind: 'ts-initial-guess', moleculeName: '甲烷' },
  { jobId: 'mock-ts-refine', name: 'TS 精修', kind: 'psi4-ts-refine', moleculeName: '水' },
  { jobId: 'mock-frequency', name: '频率分析', kind: 'psi4-frequency', moleculeName: 'CO₂' },
  { jobId: 'mock-irc', name: 'IRC 路径', kind: 'psi4-irc', moleculeName: '氨' },
]

export const MOCK_EDGES: MockWorkflowEdge[] = [
  { id: 'e-reactant-guess', sourceJobId: 'mock-reactant', targetJobId: 'mock-ts-guess' },
  { id: 'e-product-guess', sourceJobId: 'mock-product', targetJobId: 'mock-ts-guess' },
  { id: 'e-guess-refine', sourceJobId: 'mock-ts-guess', targetJobId: 'mock-ts-refine' },
  { id: 'e-refine-freq', sourceJobId: 'mock-ts-refine', targetJobId: 'mock-frequency' },
  { id: 'e-refine-irc', sourceJobId: 'mock-ts-refine', targetJobId: 'mock-irc' },
]

/** 注入失败时挂掉的节点。 */
export const MOCK_FAIL_NODE = 'mock-ts-refine'

const PREDECESSORS = new Map<string, string[]>()
for (const edge of MOCK_EDGES) {
  const list = PREDECESSORS.get(edge.targetJobId) ?? []
  list.push(edge.sourceJobId)
  PREDECESSORS.set(edge.targetJobId, list)
}

function findSample(name: string): Molecule | null {
  const hit = SAMPLE_MOLECULES.find(sample => sample.name.includes(name))
  return hit ? hit.mol() : null
}

export function mockJobs(): JobSummary[] {
  return MOCK_NODES.map(node => ({
    id: node.jobId,
    kind: node.kind,
    status: 'created',
    name: node.name,
    createdAt: '2026-07-16T09:00:00Z',
  }))
}

export function mockMolecules(): Map<string, ShelfMoleculeEntry> {
  const entries = new Map<string, ShelfMoleculeEntry>()
  for (const node of MOCK_NODES) {
    const molecule = findSample(node.moleculeName)
    entries.set(node.jobId, molecule ? { state: 'ready', molecule } : { state: 'unavailable' })
  }
  return entries
}

export type MockNodeStates = Map<string, WorkflowNodeVisualState>

export function initialNodeStates(): MockNodeStates {
  const states: MockNodeStates = new Map()
  for (const node of MOCK_NODES) {
    states.set(node.jobId, PREDECESSORS.has(node.jobId) ? 'waiting' : 'ready')
  }
  return states
}

/**
 * 推进一拍模拟调度（纯函数，可测）：
 * ready → running → succeeded；上游全 succeeded 时 waiting → ready；
 * failNode 到达 running 后转 failed，其所有下游递归 blocked。
 */
export function advanceMock(states: MockNodeStates, failNode: string | null): MockNodeStates {
  const next: MockNodeStates = new Map(states)

  for (const [jobId, state] of states) {
    if (state === 'running') {
      next.set(jobId, failNode === jobId ? 'failed' : 'succeeded')
    }
  }
  for (const [jobId, state] of states) {
    if (state === 'ready') next.set(jobId, 'running')
  }
  let changed = true
  while (changed) {
    changed = false
    for (const node of MOCK_NODES) {
      const current = next.get(node.jobId)
      const upstream = PREDECESSORS.get(node.jobId) ?? []
      if (current === 'waiting') {
        if (upstream.every(id => next.get(id) === 'succeeded')) {
          next.set(node.jobId, 'ready')
          changed = true
        } else if (upstream.some(id => next.get(id) === 'failed' || next.get(id) === 'blocked')) {
          next.set(node.jobId, 'blocked')
          changed = true
        }
      }
    }
  }
  return next
}

export function mockEdgeStates(states: MockNodeStates): Map<string, ShelfEdgeState> {
  const edgeStates = new Map<string, ShelfEdgeState>()
  for (const edge of MOCK_EDGES) {
    const source = states.get(edge.sourceJobId)
    const target = states.get(edge.targetJobId)
    if (target === 'blocked' || source === 'failed' || source === 'blocked') {
      edgeStates.set(edge.id, 'blocked')
    } else if (source === 'succeeded' && (target === 'succeeded' || target === 'failed')) {
      edgeStates.set(edge.id, 'done')
    } else if (source === 'succeeded' && (target === 'ready' || target === 'running' || target === 'queued')) {
      edgeStates.set(edge.id, 'flowing')
    } else {
      edgeStates.set(edge.id, 'pending')
    }
  }
  return edgeStates
}

export function mockFinished(states: MockNodeStates): boolean {
  return [...states.values()].every(state => state === 'succeeded' || state === 'failed' || state === 'blocked')
}
