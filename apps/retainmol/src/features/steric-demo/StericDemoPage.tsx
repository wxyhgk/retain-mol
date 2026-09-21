import { useCallback, useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, RotateCcw, RotateCw, ScanSearch, Sparkles } from 'lucide-react'
import { Button } from '@retainmol/ui-kit'
import { createStericDemoSession, StericViewport, type StericDemoSession } from '@/domain/viewer/stericDemo'
import { initialMolecule, useStericDemo, type Scenario } from './model/useStericDemo'
import './stericDemo.css'

export default function StericDemoPage() {
  const [session, setSession] = useState<StericDemoSession | null>(null)
  useEffect(() => {
    const next = createStericDemoSession()
    next.currentApi.setMolecule(initialMolecule); next.currentApi.history.clear()
    next.previewApi.setMolecule(initialMolecule); next.previewApi.history.clear()
    // Publish the external runtime after setup; StrictMode may dispose its first setup.
    let active = true
    queueMicrotask(() => { if (active) setSession(next) })
    return () => { active = false; next.dispose() }
  }, [])
  return session ? <Demo session={session} /> : <p role="status">正在准备分子视图…</p>
}
function Demo({ session }: { session: StericDemoSession }) {
  const model = useStericDemo(session)
  const currentReady = useCallback((renderer: unknown) => { if (renderer) session.currentApi.view.fit() }, [session])
  const previewReady = useCallback((renderer: unknown) => { if (renderer) session.previewApi.view.fit() }, [session])
  const contacts = [...model.report.contacts].sort((a, b) => Number(b.severity === 'error') - Number(a.severity === 'error') || b.overlap - a.overlap)
  return <main className="steric-demo">
    <header className="steric-header">
      <div><a className="steric-back" href="/"><ArrowLeft size={15} /> 返回编辑器</a>
        <p className="steric-eyebrow">RETAINMOL / MOLECULAR GEOMETRY LAB</p>
        <h1>给分子一点空间<span>螺芴碰撞避让</span></h1>
        <p>固定刚性核心，比较侧链姿态。先看清变化，再决定应用。</p></div>
      <span className="steric-service" data-testid="jev-availability"><i data-ready={model.available === true} />{model.available === null ? '检查 Jev 连接…' : model.available ? 'Jev 已配置' : 'Jev 未连接 · 可手动体验'}</span>
    </header>
    <section className="steric-controls" aria-label="演示设置">
      <label>演示场景<select aria-label="演示场景" value={model.scenario} onChange={e => model.load(e.target.value as Scenario)}>
        <option value="crowded">01 · 拥挤初态</option><option value="normal">02 · 正常姿态</option><option value="locked">03 · 锁定后无法避让</option>
      </select></label>
      <label>选择偏好<select aria-label="选择偏好" value={model.preference} onChange={e => model.setPreference(e.target.value as 'spread' | 'minimal')}>
        <option value="spread">尽量展开</option><option value="minimal">尽量少动</option>
      </select></label>
      <label className="steric-instruction">补充要求<input aria-label="补充要求" maxLength={2000} value={model.instruction} onChange={e => model.setInstruction(e.target.value)} /></label>
      <Button onClick={model.analyze} variant="outline"><ScanSearch size={16} /> 分析并生成候选</Button>
      <Button onClick={() => void model.recommend()} disabled={model.busy || !model.search?.candidates.length || model.available !== true}><Sparkles size={16} />{model.busy ? '正在推荐…' : 'Jev 推荐'}</Button>
    </section>
    <div className="steric-status" role="status">{model.message}</div>
    <div className="steric-viewports">
      <section className="steric-view-card" aria-label="当前结构">
        <div className="steric-view-heading"><div><span>01 / CURRENT</span><h2>当前结构</h2></div>
          <span className={model.report.hardClashCount ? 'steric-alert' : 'steric-clear'} data-testid="current-clashes">{model.report.hardClashCount} 处严重重叠</span></div>
        <div className="steric-canvas"><StericViewport runtime={session.currentRuntime} interactionMode="read-only" onRendererChange={currentReady} /></div>
        <div className="steric-view-footer"><span>C₃₂H₂₂ · {model.snapshot.molecule.atoms.length} 个原子（含 H）</span>
          <Button variant="ghost" size="sm" onClick={() => session.currentApi.view.fit()}>适配视口</Button></div>
      </section>
      <section className="steric-view-card" aria-label="候选预览">
        <div className="steric-view-heading"><div><span>02 / PREVIEW</span><h2>候选预览</h2></div>
          <span className="steric-clear">{model.selected ? `侧链旋转 ${model.selected.angleDegrees}°` : '等待选择候选'}</span></div>
        <div className="steric-canvas"><StericViewport runtime={session.previewRuntime} interactionMode="read-only" onRendererChange={previewReady} /></div>
        <div className="steric-view-footer"><span>{model.selected ? '严重重叠 0 · 固定核心保持不变' : '预览不会修改当前结构'}</span>
          <Button variant="ghost" size="sm" onClick={() => session.previewApi.view.fit()}>适配视口</Button></div>
      </section>
    </div>
    <section className="steric-results" aria-label="候选列表">
      <div className="steric-result-heading"><div><h2>比较候选</h2><p>拥挤评分和移动幅度越小越好；展开半径越大，结构越舒展。</p></div>
        <div className="steric-history"><Button variant="outline" size="sm" disabled={!model.snapshot.history.canUndo} onClick={() => model.history('undo')}><RotateCcw size={14} />撤销</Button>
          <Button variant="outline" size="sm" disabled={!model.snapshot.history.canRedo} onClick={() => model.history('redo')}><RotateCw size={14} />重做</Button>
          <Button disabled={!model.selected || model.busy} onClick={model.apply}>应用候选<ArrowRight size={15} /></Button></div>
      </div>
      <div className="steric-candidates">{model.search?.candidates.length ? model.search.candidates.map(c => <button type="button" className="steric-candidate" key={c.id}
        aria-label={`预览 ${c.angleDegrees} 度候选`} aria-pressed={model.selected?.id === c.id} onClick={() => model.select(c.id)}>
        <div><strong>{c.angleDegrees}<small>°</small></strong>{model.decision?.choice === c.id && <span>Jev 推荐</span>}</div>
        <dl><dt>拥挤评分</dt><dd>{c.metrics.crowdingScore.toFixed(2)}</dd><dt>移动 RMS</dt><dd>{c.metrics.displacementRms.toFixed(2)} Å</dd><dt>展开半径</dt><dd>{c.metrics.spreadRadius.toFixed(2)} Å</dd></dl>
        {model.decision && <p>选择概率 {(100 * (model.decision.probabilities[c.id] ?? 0)).toFixed(1)}%</p>}
      </button>) : <p className="steric-empty">{model.search ? model.search.issues.join('；') : '点击“分析并生成候选”，比较本地几何检查通过的姿态。'}</p>}</div>
      {model.decision && <p className="steric-decision" data-testid="jev-result">实际模型 {model.decision.model} · {model.decision.elapsedMs} ms · 置信度 {(model.decision.confidence * 100).toFixed(1)}% · {model.decision.choice === 'none' ? '未选择任何候选' : `推荐 ${model.decision.choice}`}（概率不是化学正确率）</p>}
    </section>
    <div className="steric-details">
      <details><summary>当前接触报告 · {contacts.length} 对</summary><p>点击条目高亮并聚焦原子。黄色接触为拥挤提示，不等于结构错误。</p>
        <ul>{contacts.map(c => <li key={`${c.atomId1}:${c.atomId2}`}><button onClick={() => { session.currentApi.selection.set([c.atomId1, c.atomId2]); session.currentApi.view.focusSelection() }}>
          <span className={c.severity === 'error' ? 'steric-alert' : 'steric-warning'}>{c.severity === 'error' ? '严重重叠' : '拥挤接触'}</span> {c.atomId1.slice(0, 8)} / {c.atomId2.slice(0, 8)} · {c.distance.toFixed(2)} Å{c.separation === 'three-bonds' ? ' · 三键相邻' : ''}
        </button></li>)}</ul>
      </details>
      <details><summary>结构化状态与决策</summary><pre>{JSON.stringify({ request: model.request, decision: model.decision, search: model.search && { baseRevision: model.search.baseRevision, sampledCount: model.search.sampledCount, acceptedCount: model.search.acceptedCount, issues: model.search.issues } }, null, 2)}</pre></details>
    </div>
    <footer className="steric-footnote">仅调整指定侧链的单键扭转。碰撞与拥挤使用 C/H 几何启发式；没有严重重叠不代表最低能量或化学稳定性。</footer>
  </main>
}
