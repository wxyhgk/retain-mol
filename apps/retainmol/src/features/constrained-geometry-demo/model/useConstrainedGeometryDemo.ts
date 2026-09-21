import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { computeMoleculeRevision, validateGeometryConstraints, type GeometryConstraintReport } from '@retainmol/mol-viewer/headless'
import { previewConstrainedGeometry, type ConstraintPreview, type ConstrainedGeometrySession } from '@/domain/viewer/constrainedGeometry'
import { bondLengthDelta, ringFixture, ringRequest, type ConstraintScenario } from './ringFixture'

export function useConstrainedGeometryDemo(session: ConstrainedGeometrySession) {
  const snapshot = useSyncExternalStore(session.currentApi.subscribe, session.currentApi.getSnapshot, session.currentApi.getSnapshot)
  const [scenario, setScenario] = useState<ConstraintScenario>('ring')
  const [lift, setLift] = useState(0.5)
  const [candidate, setCandidate] = useState<ConstraintPreview | null>(null)
  const [failureReport, setFailureReport] = useState<GeometryConstraintReport | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('固定 C1，将对面的 C4 抬高 0.5 Å，观察闭环中的其他原子协同移动。')
  const sequence = useRef(0)
  useEffect(() => {
    const ticket = sequence
    return () => { ticket.current += 1 }
  }, [])
  const request = useMemo(() => ringRequest(scenario, lift), [scenario, lift])
  const currentReport = useMemo(() => validateGeometryConstraints(snapshot.molecule, request.constraints), [snapshot.molecule, request])
  const revision = useMemo(() => computeMoleculeRevision(snapshot.molecule), [snapshot.molecule])
  const preview = candidate?.baseRevision === revision ? candidate : null
  const diagnosticReport = preview?.report ?? failureReport ?? currentReport
  const maxBondDelta = preview ? bondLengthDelta(snapshot.molecule, preview.molecule) : 0

  const clearPreview = () => {
    sequence.current += 1
    setCandidate(null); setFailureReport(null); setBusy(false)
    session.previewApi.setMolecule(session.currentApi.getSnapshot().molecule)
    session.previewApi.history.clear()
  }
  const load = (value: ConstraintScenario) => {
    session.currentApi.setMolecule(ringFixture); session.currentApi.history.clear()
    setScenario(value); clearPreview()
    session.fit('current'); session.fit('preview')
    setMessage(value === 'locked' ? '全部原子固定，同时要求 C4 移动。预览应明确拒绝这个冲突请求。' : '已恢复初始平面骨架。C1 固定，其余五个原子可以协同调整。')
  }
  const changeLift = (value: number) => {
    clearPreview(); setLift(value)
    setMessage(`目标改为 C4 的 z = ${value.toFixed(1)} Å，请重新生成预览。`)
  }
  const generate = async () => {
    clearPreview()
    const ticket = sequence.current
    setBusy(true); setMessage('正在协同调整闭环，并检查几何约束…')
    // Let the status paint before the bounded, synchronous geometry search.
    await new Promise<void>(resolve => setTimeout(resolve, 0))
    if (ticket !== sequence.current) return
    try {
      const context = session.getContext()
      const result = previewConstrainedGeometry(context, { targetObjectId: context.activeObjectId!, request })
      if (ticket !== sequence.current) return
      if (result.ok === true) {
        setCandidate(result)
        session.previewApi.setMolecule(result.molecule); session.previewApi.history.clear()
        setMessage(`预览通过：${result.movedAtomIds.length} 个原子移动，${result.iterations} 次迭代。当前结构未改变。`)
      } else {
        setFailureReport(result.report ?? null)
        setMessage(`没有可应用的预览：${result.issues.map(issue => issue.message).join('；')}`)
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '预览生成失败')
    } finally { if (ticket === sequence.current) setBusy(false) }
  }
  const apply = () => {
    if (!preview || busy) return
    try {
      const result = session.apply(preview)
      clearPreview()
      setMessage(result.committed ? '已应用闭环变形。原子和键的连接关系保持不变，可用一次撤销恢复。' : '当前结构已符合目标，没有增加历史记录。')
    } catch (error) {
      clearPreview(); setMessage(error instanceof Error ? error.message : '应用失败')
    }
  }
  const history = (action: 'undo' | 'redo') => {
    session.currentApi.history[action](); clearPreview()
    setMessage(action === 'undo' ? '已撤销，恢复应用前的整个闭环。' : '已重做闭环变形。')
  }
  const focus = (atomIds: readonly string[]) => {
    session.focus(preview ? 'preview' : 'current', atomIds)
  }
  return { snapshot, scenario, lift, request, currentReport, preview, diagnosticReport, maxBondDelta,
    busy, message, load, changeLift, generate, apply, history, focus }
}
