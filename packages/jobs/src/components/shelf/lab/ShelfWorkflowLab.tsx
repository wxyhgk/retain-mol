import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, FlaskConical, Pause, Play, RotateCcw, Zap } from 'lucide-react'
import { Button } from '@retainmol/ui-kit'
import type { ShelfEdgeInput } from '../scene/ShelfEdge'
import { JobShelfView } from '../JobShelfView'
import {
  MOCK_EDGES,
  MOCK_FAIL_NODE,
  advanceMock,
  initialNodeStates,
  mockEdgeStates,
  mockFinished,
  mockJobs,
  mockMolecules,
  type MockNodeStates,
} from './mockWorkflow'

const TICK_MS = 1400

/** 展柜工作流实验室：假 DAG + 定时推进，先看效果，接口后接。 */
export function ShelfWorkflowLab({ onBack }: { onBack: () => void }) {
  const jobs = useMemo(() => mockJobs(), [])
  const molecules = useMemo(() => mockMolecules(), [])
  const [nodeStates, setNodeStates] = useState<MockNodeStates>(initialNodeStates)
  const [playing, setPlaying] = useState(false)
  const [injectFail, setInjectFail] = useState(false)
  const finished = mockFinished(nodeStates)

  useEffect(() => {
    if (!playing || finished) return
    const timer = setInterval(() => {
      setNodeStates(current => advanceMock(current, injectFail ? MOCK_FAIL_NODE : null))
    }, TICK_MS)
    return () => clearInterval(timer)
  }, [playing, finished, injectFail])

  const edges = useMemo<ShelfEdgeInput[]>(() => {
    const states = mockEdgeStates(nodeStates)
    return MOCK_EDGES.map(edge => ({
      id: edge.id,
      sourceJobId: edge.sourceJobId,
      targetJobId: edge.targetJobId,
      state: states.get(edge.id) ?? 'pending',
    }))
  }, [nodeStates])

  function reset() {
    setPlaying(false)
    setNodeStates(initialNodeStates())
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft />返回任务中心</Button>
          <div>
            <h1 className="flex items-center gap-2 text-sm font-semibold"><FlaskConical className="size-4" />展柜工作流实验室</h1>
            <p className="text-[11px] text-muted-foreground">Mock 模式 · TS 制备链路（反应物/产物 → 初猜 → 精修 → 频率/IRC），不访问后端</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={injectFail ? 'destructive' : 'outline'}
            size="sm"
            title="TS 精修节点将失败，下游全部阻塞"
            aria-pressed={injectFail}
            onClick={() => setInjectFail(current => !current)}
          >
            <Zap />注入失败
          </Button>
          <Button variant="outline" size="sm" onClick={reset}><RotateCcw />重置</Button>
          <Button size="sm" disabled={finished} onClick={() => setPlaying(current => !current)}>
            {playing ? <Pause /> : <Play />}
            {playing ? '暂停' : finished ? '已结束' : '运行'}
          </Button>
        </div>
      </header>
      <div className="min-h-0 flex-1">
        <JobShelfView
          jobs={jobs}
          molecules={molecules}
          nodeStates={nodeStates}
          edges={edges}
          onOpenJob={() => {}}
          onRunJob={() => {}}
          runPendingJobId={null}
        />
      </div>
    </div>
  )
}
