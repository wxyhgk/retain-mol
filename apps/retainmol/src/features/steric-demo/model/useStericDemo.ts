import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { analyzeStericContacts, generateTorsionCandidates, type Molecule, type TorsionCandidateResult } from '@retainmol/mol-viewer/headless'
import type { StericDemoSession } from '@/domain/viewer/stericDemo'
import fixture from '../fixtures/spiro-benzyl.json'
import { getDecisionAvailability, requestDecision } from '../infrastructure/decisionClient'
import type { DecisionRequest, DecisionResponse } from './decisionContract'

export type Scenario = 'crowded' | 'normal' | 'locked'
export const initialMolecule = fixture.molecule as Molecule
export function useStericDemo(session: StericDemoSession) {
  const snapshot = useSyncExternalStore(session.currentApi.subscribe, session.currentApi.getSnapshot, session.currentApi.getSnapshot)
  const report = useMemo(() => analyzeStericContacts(snapshot.molecule), [snapshot.molecule])
  const [scenario, setScenario] = useState<Scenario>('crowded')
  const [search, setSearch] = useState<TorsionCandidateResult | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [preference, setPreference] = useState<'spread' | 'minimal'>('spread')
  const [instruction, setInstruction] = useState('保持螺芴核心不动，让侧链尽量展开。')
  const [available, setAvailable] = useState<boolean | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('载入了拥挤初始姿态。先分析，再比较候选。')
  const [decision, setDecision] = useState<DecisionResponse | null>(null)
  const [request, setRequest] = useState<DecisionRequest | null>(null)
  const sequence = useRef(0)
  const controller = useRef<AbortController | null>(null)
  useEffect(() => {
    let active = true
    const requests = sequence
    const pending = controller
    void getDecisionAvailability().then(value => { if (active) setAvailable(value) })
    return () => { active = false; pending.current?.abort(); requests.current++ }
  }, [])
  const selected = search?.candidates.find(c => c.id === selectedId) ?? null
  const invalidateDecision = () => {
    sequence.current++; controller.current?.abort(); controller.current = null
    setBusy(false); setDecision(null); setRequest(null)
  }
  const resetSearch = () => {
    invalidateDecision(); setSearch(null); setSelectedId(null)
    session.previewApi.setMolecule(session.currentApi.getSnapshot().molecule)
    session.previewApi.history.clear()
  }
  const load = (value: Scenario) => {
    session.currentApi.setMolecule((value === 'normal' ? fixture.normal : fixture.molecule) as Molecule)
    session.currentApi.history.clear(); setScenario(value); resetSearch()
    session.currentApi.view.fit(); session.previewApi.view.fit()
    setMessage(value === 'locked' ? '全部原子已锁定，演示没有可用自由度时的反馈。' : value === 'normal' ? '已载入没有严重重叠的参考姿态。' : '已恢复拥挤初态。')
  }
  const select = (id: string, result = search) => {
    const candidate = result?.candidates.find(c => c.id === id)
    if (!candidate) return
    setSelectedId(id); session.previewApi.setMolecule(candidate.molecule); session.previewApi.history.clear()
  }
  const analyze = () => {
    invalidateDecision()
    const context = session.getContext()
    const result = generateTorsionCandidates(context, { targetObjectId: context.activeObjectId!, bondId: fixture.bondId,
      movingAtomId: fixture.movingAtomId, fixedAtomIds: scenario === 'locked' ? snapshot.molecule.atoms.map(a => a.id) : fixture.fixedAtomIds })
    setSearch(result); setSelectedId(null)
    if (result.candidates.length) {
      const leastCrowded = [...result.candidates].sort((a, b) => a.metrics.crowdingScore - b.metrics.crowdingScore || a.angleDegrees - b.angleDegrees)[0]!
      select(leastCrowded.id, result)
    }
    else { session.previewApi.setMolecule(snapshot.molecule); session.previewApi.history.clear() }
    setMessage(result.candidates.length ? `检查 ${result.sampledCount} 个姿态，${result.acceptedCount} 个通过；展示 ${result.candidates.length} 个候选。` : result.issues.join('；'))
  }
  const recommend = async () => {
    if (!search?.candidates.length || !search.baseRevision) return
    invalidateDecision()
    const ticket = sequence.current
    const abort = new AbortController(); controller.current = abort
    const payload: DecisionRequest = {
      baseRevision: search.baseRevision, preference, instruction,
      topology: { formula: fixture.formula, atomCount: snapshot.molecule.atoms.length, bondCount: snapshot.molecule.bonds.length,
        fixedAtomCount: fixture.fixedAtomIds.length, rotatableBondId: fixture.bondId },
      geometry: { unit: 'angstrom', policyVersion: report.policyVersion },
      diagnostics: { hardClashCount: report.hardClashCount, crowdingScore: report.crowdingScore },
      candidates: search.candidates.map(c => ({ id: c.id, angleDegrees: c.angleDegrees, hardClashCount: 0, metrics: c.metrics })),
    }
    setRequest(payload); setBusy(true); setMessage('Jev 正在比较候选与偏好…')
    try {
      const response = await requestDecision(payload, abort.signal)
      const context = session.getContext()
      if (ticket !== sequence.current || context.objects.find(o => o.objectId === context.activeObjectId)?.revision !== payload.baseRevision) return
      setDecision(response)
      if (response.choice !== 'none') select(response.choice)
      setMessage(response.choice === 'none' ? 'Jev 认为这些候选不满足要求；可以修改偏好或手动选择。' : 'Jev 已推荐候选。请查看右侧预览，点击应用后才会改变当前结构。')
    } catch (error) {
      if (ticket === sequence.current) setMessage(error instanceof Error ? error.message : '推荐失败')
    } finally { if (ticket === sequence.current) setBusy(false) }
  }
  const apply = () => {
    if (!selected) return
    try {
      const result = session.apply(selected)
      resetSearch()
      setMessage(result.committed ? '已应用候选，核心与拓扑保持不变；可用一次撤销恢复。' : '所选姿态与当前结构相同，没有新增历史记录。')
    } catch (error) { resetSearch(); setMessage(error instanceof Error ? error.message : '应用失败') }
  }
  const history = (action: 'undo' | 'redo') => {
    session.currentApi.history[action](); resetSearch(); setMessage(action === 'undo' ? '已撤销，恢复应用前的结构。' : '已重做。')
  }
  return { snapshot, report, scenario, load, search, selected, select, preference, instruction, available, busy, message, decision, request,
    setPreference(value: 'spread' | 'minimal') { invalidateDecision(); setPreference(value); setInstruction(value === 'spread' ? '保持螺芴核心不动，让侧链尽量展开。' : '解除严重重叠即可，尽量少移动原子。') },
    setInstruction(value: string) { invalidateDecision(); setInstruction(value) }, analyze, recommend, apply, history }
}
