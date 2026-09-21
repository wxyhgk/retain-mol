import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { computeMoleculeRevision, previewConstrainedGeometry, validateGeometryMotion, type GeometryMotionIssue, type GeometryMotionReport, type GeometryPathPreview, type GeometryPathSession, type Molecule } from '@/domain/viewer/geometryPath'
import { interpolateMotion, motionFixture, motionRequest, motionTarget, type MotionScenario } from './motionFixture'

/** Diagnostics must describe the same endpoint used by the trajectory viewport. */
export function inspectMotionPreview(before: Molecule, nominalTarget: Molecule, result: ReturnType<typeof previewConstrainedGeometry>) {
  const candidateMotion = result.ok === true ? result.motionReport ?? validateGeometryMotion(before, result.molecule) : null
  const candidate = result.ok === true && candidateMotion?.safe ? result : null
  const report = candidate ? candidateMotion! : validateGeometryMotion(before, nominalTarget)
  const message = candidate ? '候选线性轨迹通过几何间距检查。可以应用目标姿态，形成一次可撤销编辑。'
    : report.status === 'collision' ? '指定目标轨迹中途发生几何碰撞，没有可应用的候选。点击诊断跳到发生位置。'
      : report.status === 'indeterminate' ? '检查预算内无法证明指定目标轨迹安全，没有可应用的候选。'
        : report.safe ? `指定目标的线性轨迹通过间距检查，但求解候选未通过，无法应用。${result.ok === false ? result.issues.map(issue => issue.message).join('；') : ''}`
          : '指定目标的运动检查未通过，没有可应用的候选。'
  return { candidate, report, message, solverMotionReport: result.motionReport ?? null }
}

export function useMotionDemo(session: GeometryPathSession) {
  const snapshot = useSyncExternalStore(session.currentApi.subscribe, session.currentApi.getSnapshot, session.currentApi.getSnapshot)
  const [scenario, setScenario] = useState<MotionScenario>('crossing')
  const [progress, setProgress] = useState(1)
  const [candidate, setCandidate] = useState<GeometryPathPreview | null>(null)
  const [report, setReport] = useState<GeometryMotionReport | null>(null)
  const [solverMotionReport, setSolverMotionReport] = useState<GeometryMotionReport | null>(null)
  const [message, setMessage] = useState('两端的几何姿态都分离，但沿直线移动可能在中途穿过。拖动进度查看过程，再检查整条轨迹。')
  const [busy, setBusy] = useState(false)
  const sequence = useRef(0)
  useEffect(() => { const ticket = sequence; return () => { ticket.current += 1 } }, [])
  const revision = computeMoleculeRevision(snapshot.molecule)
  const preview = candidate?.baseRevision === revision ? candidate : null
  const target = useMemo(() => preview?.molecule ?? motionTarget(snapshot.molecule, scenario), [preview, snapshot.molecule, scenario])
  const request = useMemo(() => motionRequest(snapshot.molecule, scenario), [snapshot.molecule, scenario])
  useEffect(() => {
    session.previewApi.setMolecule(interpolateMotion(snapshot.molecule, target, progress))
    session.previewApi.history.clear()
  }, [session, snapshot.molecule, target, progress])
  const clear = () => { sequence.current += 1; setCandidate(null); setReport(null); setSolverMotionReport(null); setBusy(false) }
  const load = (value: MotionScenario) => {
    clear(); setScenario(value); setProgress(1)
    session.currentApi.setMolecule(motionFixture); session.currentApi.history.clear()
    session.fit('current'); session.fit('preview')
    setMessage(value === 'crossing' ? '穿越场景：移动线段从 z = +1 到 −1，中途经过固定线段。' : '安全场景：移动线段从 z = +1 到 +2，始终处于固定线段同侧。')
  }
  const analyze = async () => {
    clear(); const ticket = sequence.current
    setBusy(true); setMessage('正在检查完整线性轨迹…')
    await new Promise<void>(resolve => setTimeout(resolve, 0))
    if (ticket !== sequence.current) return
    try {
      const context = session.getContext()
      const result = previewConstrainedGeometry(context, { targetObjectId: context.activeObjectId!, request })
      if (ticket !== sequence.current) return
      const inspection = inspectMotionPreview(snapshot.molecule, motionTarget(snapshot.molecule, scenario), result)
      setReport(inspection.report); setSolverMotionReport(inspection.solverMotionReport)
      setCandidate(inspection.candidate); setMessage(inspection.message)
    } catch (error) { setMessage(error instanceof Error ? error.message : '检查失败') }
    finally { if (ticket === sequence.current) setBusy(false) }
  }
  const apply = () => {
    if (!preview || !report?.safe || busy) return
    try {
      const result = session.apply(preview)
      clear(); setProgress(1)
      setMessage(result.committed ? '已应用安全目标姿态，可一次撤销。' : '当前位置已经满足目标，没有增加历史记录。')
    } catch (error) { clear(); setMessage(error instanceof Error ? error.message : '应用失败') }
  }
  const history = (action: 'undo' | 'redo') => {
    session.currentApi.history[action](); clear(); setProgress(1)
    setMessage(action === 'undo' ? '已撤销目标姿态。' : '已重做目标姿态。')
  }
  const focusIssue = (issue: GeometryMotionIssue) => {
    const moment = issue.sampleTime ?? (issue.timeInterval ? (issue.timeInterval[0] + issue.timeInterval[1]) / 2 : progress)
    setProgress(moment)
    session.previewApi.setMolecule(interpolateMotion(snapshot.molecule, target, moment))
    session.focus('preview', issue.atomIds, issue.bondIds)
  }
  return { snapshot, scenario, progress, setProgress, preview, report, solverMotionReport, message, busy, request, load, analyze, apply, history, focusIssue }
}
