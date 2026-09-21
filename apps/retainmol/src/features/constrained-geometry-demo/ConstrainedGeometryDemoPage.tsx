import { useCallback, useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, Focus, RotateCcw, RotateCw, ScanLine } from 'lucide-react'
import { Button } from '@retainmol/ui-kit'
import { ConstrainedGeometryViewport, createConstrainedGeometrySession, type ConstrainedGeometryRenderer, type ConstrainedGeometrySession } from '@/domain/viewer/constrainedGeometry'
import { anchorAtomId, atomLabel, ringFixture, targetAtomId, type ConstraintScenario } from './model/ringFixture'
import { useConstrainedGeometryDemo } from './model/useConstrainedGeometryDemo'
import './constrainedGeometryDemo.css'

export default function ConstrainedGeometryDemoPage() {
  const [session, setSession] = useState<ConstrainedGeometrySession | null>(null)
  useEffect(() => {
    const next = createConstrainedGeometrySession()
    next.currentApi.setMolecule(ringFixture); next.currentApi.history.clear()
    next.previewApi.setMolecule(ringFixture); next.previewApi.history.clear()
    let active = true
    queueMicrotask(() => { if (active) setSession(next) })
    return () => { active = false; next.dispose() }
  }, [])
  return session ? <Demo session={session} /> : <p role="status">正在准备约束几何演示…</p>
}

const constraintNames = {
  position: '位置', distance: '距离', 'minimum-distance': '最小间距',
  angle: '键角', dihedral: '二面角', helicity: '路径旋向',
} as const

function Demo({ session }: { session: ConstrainedGeometrySession }) {
  const model = useConstrainedGeometryDemo(session)
  const currentReady = useCallback((renderer: ConstrainedGeometryRenderer | null) => session.bindRenderer('current', renderer), [session])
  const previewReady = useCallback((renderer: ConstrainedGeometryRenderer | null) => session.bindRenderer('preview', renderer), [session])
  const diagnosticRows = [...model.diagnosticReport.measurements].sort((a, b) => Number(a.satisfied) - Number(b.satisfied))
  const target = model.snapshot.molecule.atoms.find(atom => atom.id === targetAtomId)!
  return <main className="constraint-demo">
    <header className="constraint-header">
      <div><a className="constraint-back" href="/"><ArrowLeft size={15} /> 返回编辑器</a>
        <p className="constraint-eyebrow">RETAINMOL / CONSTRAINED GEOMETRY</p>
        <h1>闭环，一起变形</h1>
        <p>固定一个原子，移动对面的原子，让整个环共同调整。检查通过后再应用。</p></div>
      <span className="constraint-tag">程序生成 · 几何测试</span>
    </header>

    <section className="constraint-controls" aria-label="约束设置">
      <label>演示场景<select aria-label="约束演示场景" disabled={model.busy} value={model.scenario} onChange={event => model.load(event.target.value as ConstraintScenario)}>
        <option value="ring">01 · 固定 C1，闭环协同变形</option>
        <option value="locked">02 · 全部固定，目标不可达</option>
      </select></label>
      <label>C4 目标高度<select aria-label="C4 目标高度" value={model.lift} disabled={model.busy} onChange={event => model.changeLift(Number(event.target.value))}>
        <option value={0.4}>z = 0.4 Å</option><option value={0.5}>z = 0.5 Å</option>
      </select></label>
      <div className="constraint-settings-summary"><span>键长误差 ≤ 0.03 Å</span><span>键角变化 ≤ 10°</span></div>
      <Button variant="outline" disabled={model.busy} onClick={() => model.load(model.scenario)}>恢复初态</Button>
      <Button disabled={model.busy} onClick={() => void model.generate()}><ScanLine size={16} />{model.busy ? '正在求解…' : '生成约束预览'}</Button>
    </section>
    <div className="constraint-status" role="status" aria-live="polite">{model.message}</div>

    <div className="constraint-viewports">
      <section className="constraint-view-card" aria-label="当前闭环结构">
        <div className="constraint-view-heading"><div><span>01 / CURRENT</span><h2>当前结构</h2></div>
          <span className={model.currentReport.hardViolationCount ? 'constraint-pending' : 'constraint-pass'} data-testid="constraint-current-state">
            {model.currentReport.hardViolationCount ? '位置目标待满足' : '位置目标已满足'}</span></div>
        <div className="constraint-canvas"><ConstrainedGeometryViewport runtime={session.currentRuntime} interactionMode="read-only" onRendererChange={currentReady} /></div>
        <div className="constraint-view-footer"><span data-testid="constraint-current-height">C4 当前 z = {target.z.toFixed(3)} Å</span>
          <Button variant="ghost" size="sm" onClick={() => session.fit('current')}>适配当前视口</Button></div>
      </section>
      <section className="constraint-view-card" aria-label="闭环变形预览">
        <div className="constraint-view-heading"><div><span>02 / PREVIEW</span><h2>变形预览</h2></div>
          <span className={model.preview ? 'constraint-pass' : 'constraint-pending'} data-testid="constraint-preview-state">{model.preview ? '全部硬约束通过' : '等待有效预览'}</span></div>
        <div className="constraint-canvas"><ConstrainedGeometryViewport runtime={session.previewRuntime} interactionMode="read-only" onRendererChange={previewReady} /></div>
        <div className="constraint-view-footer"><span>{model.preview ? `C1 固定 · ${model.preview.movedAtomIds.length} 个原子协同移动` : '显示当前结构，尚无可应用的变形'}</span>
          <Button variant="ghost" size="sm" onClick={() => session.fit('preview')}>适配预览视口</Button></div>
      </section>
    </div>

    <section className="constraint-results" aria-label="约束检查结果">
      <div className="constraint-result-heading"><div><h2>先检查，再应用</h2><p>6 个碳原子的闭环骨架，未补氢。固定区域与连接关系保持不变。</p></div>
        <div className="constraint-actions">
          <Button variant="outline" size="sm" disabled={model.busy || !model.snapshot.history.canUndo} onClick={() => model.history('undo')}><RotateCcw size={14} />撤销</Button>
          <Button variant="outline" size="sm" disabled={model.busy || !model.snapshot.history.canRedo} onClick={() => model.history('redo')}><RotateCw size={14} />重做</Button>
          <Button disabled={!model.preview || model.busy} onClick={model.apply}>应用变形<ArrowRight size={15} /></Button>
        </div>
      </div>
      <div className="constraint-metrics">
        <div><span>硬约束未满足</span><strong data-testid="constraint-hard-violations">{model.diagnosticReport.hardViolationCount}</strong><small>{model.preview ? '预览验收' : '当前请求诊断'}</small></div>
        <div><span>移动原子</span><strong data-testid="constraint-moved-atoms">{model.preview?.movedAtomIds.length ?? '—'}</strong><small>连接关系保持不变</small></div>
        <div><span>最大键长变化</span><strong data-testid="constraint-bond-delta">{model.preview ? model.maxBondDelta.toFixed(4) : '—'}<em> Å</em></strong><small>相对应用前结构</small></div>
        <div><span>求解迭代</span><strong>{model.preview?.iterations ?? '—'}</strong><small>确定性局部几何求解</small></div>
      </div>
      <div className="constraint-locate"><Button variant="ghost" size="sm" onClick={() => model.focus([anchorAtomId])}><Focus size={13} />定位固定原子 C1</Button>
        <Button variant="ghost" size="sm" onClick={() => model.focus([targetAtomId])}><Focus size={13} />定位目标原子 C4</Button>
        <span>{model.preview ? '定位到右侧预览' : '定位到左侧当前结构'}</span></div>
    </section>

    <section className="constraint-diagnostics" aria-label="几何诊断详情">
      <details open><summary>约束诊断 · {diagnosticRows.length} 项</summary>
        <p>点击约束定位相关原子。“超出容差”是验收误差；0 表示该项满足要求。</p>
        {model.diagnosticReport.issues.length > 0 && <ul className="constraint-issues">{model.diagnosticReport.issues.map((issue, index) => <li key={`${issue.constraintId ?? issue.code}-${index}`}>
          <button type="button" onClick={() => model.focus(issue.atomIds)}>{issue.message}</button>
        </li>)}</ul>}
        <div className="constraint-diagnostic-list">{diagnosticRows.map(row => <button type="button" className="constraint-diagnostic" key={row.constraintId}
          onClick={() => model.focus(row.atomIds)} aria-label={`定位${constraintNames[row.kind]}约束 ${row.atomIds.map(atomLabel).join('、')}`}>
          <span className={row.satisfied ? 'constraint-pass' : 'constraint-fail'}>{row.satisfied ? '通过' : '未满足'}</span>
          <span>{constraintNames[row.kind]} · {row.atomIds.map(atomLabel).join(' / ')}</span>
          <span>{row.strength === 'hard' ? '硬约束' : '软偏好'}</span>
          <span>超出容差 {row.violation === null ? '不可测量' : `${row.violation.toFixed(4)} ${row.unit === 'angstrom' ? 'Å' : '°'}`}</span>
        </button>)}</div>
      </details>
      <details><summary>结构化约束与检查报告</summary><pre>{JSON.stringify({ request: model.request, preview: model.preview && {
        baseRevision: model.preview.baseRevision, nextRevision: model.preview.nextRevision, movedAtomIds: model.preview.movedAtomIds,
      }, diagnostics: model.diagnosticReport }, null, 2)}</pre></details>
    </section>
    <footer className="constraint-footnote">这是程序生成的重原子几何测试，不是经过验证的分子构象或能量优化。几何路径旋向不等于自动 P/M 指认；终点约束检查不保证移动过程不会穿越骨架。</footer>
  </main>
}
