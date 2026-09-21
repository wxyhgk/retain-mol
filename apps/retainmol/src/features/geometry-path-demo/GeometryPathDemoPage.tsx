import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, Focus, RotateCcw, RotateCw, ScanLine } from 'lucide-react'
import { Button } from '@retainmol/ui-kit'
import { createGeometryPathSession, GeometryPathViewport, type GeometryPathRenderer, type GeometryPathSession, type Molecule } from '@/domain/viewer/geometryPath'
import { motionFixture, type MotionScenario } from './model/motionFixture'
import { ribbonFixture } from './model/ribbonFixture'
import { useMotionDemo } from './model/useMotionDemo'
import './geometryPathDemo.css'

export default function GeometryPathDemoPage() {
  const [tab, setTab] = useState<'motion' | 'ribbon'>('motion')
  return <main className="geometry-path-demo">
    <header className="geometry-path-header"><div>
      <a href="/"><ArrowLeft size={15} />返回编辑器</a>
      <p className="geometry-path-eyebrow">RETAINMOL / GEOMETRY PATHS</p>
      <h1>看清过程，描述扭转</h1>
      <p>检查运动途中是否穿越，再用有序截面表达扭曲环带。</p>
    </div><span className="geometry-path-pill">程序生成的几何测试</span></header>
    <nav className="geometry-path-tabs" aria-label="几何演示模块">
      <button type="button" aria-pressed={tab === 'motion'} onClick={() => setTab('motion')}>01 · 连续运动检查</button>
      <button type="button" aria-pressed={tab === 'ribbon'} onClick={() => setTab('ribbon')}>02 · 扭曲环带引导</button>
    </nav>
    {tab === 'motion' ? <Session initial={motionFixture}>{session => <MotionDemo session={session} />}</Session> : <RibbonDemo />}
  </main>
}

function Session({ initial, children }: { initial: Molecule; children: (session: GeometryPathSession) => React.ReactNode }) {
  const [session, setSession] = useState<GeometryPathSession | null>(null)
  useEffect(() => {
    const next = createGeometryPathSession()
    next.currentApi.setMolecule(initial); next.currentApi.history.clear()
    next.previewApi.setMolecule(initial); next.previewApi.history.clear()
    let active = true
    queueMicrotask(() => { if (active) setSession(next) })
    return () => { active = false; next.dispose() }
  }, [initial])
  return session ? children(session) : <p role="status">正在准备几何视图…</p>
}

function Viewport({ session, side, title, subtitle, children }: {
  session: GeometryPathSession; side: 'current' | 'preview'; title: string; subtitle: string; children?: React.ReactNode;
}) {
  const ready = useCallback((renderer: GeometryPathRenderer | null) => session.bindRenderer(side, renderer), [session, side])
  return <section className="geometry-path-view" aria-label={title}>
    <div className="geometry-path-view-title"><div><span>{side === 'current' ? 'CURRENT / SOURCE' : 'LINEAR TRAJECTORY'}</span><h2>{title}</h2></div>{children}</div>
    <div className="geometry-path-canvas"><GeometryPathViewport runtime={side === 'current' ? session.currentRuntime : session.previewRuntime} interactionMode="read-only" onRendererChange={ready} /></div>
    <div className="geometry-path-view-footer"><span>{subtitle}</span><Button variant="ghost" size="sm" onClick={() => session.fit(side)}>适配{side === 'current' ? '当前' : '预览'}视口</Button></div>
  </section>
}

const statuses = { safe: '安全', collision: '发现碰撞', indeterminate: '无法判定', 'invalid-input': '输入无效' } as const
const issueNames = { 'atom-atom': '原子—原子', 'atom-bond': '原子—键段', 'bond-bond': '键段—键段', 'invalid-input': '输入错误', 'budget-exhausted': '预算耗尽' } as const

function MotionDemo({ session }: { session: GeometryPathSession }) {
  const model = useMotionDemo(session)
  const movingZ = model.snapshot.molecule.atoms.find(atom => atom.id === 'motion-y-top')!.z
  return <>
    <section className="geometry-path-controls" aria-label="运动设置">
      <label>线性运动场景<select aria-label="线性运动场景" value={model.scenario} disabled={model.busy} onChange={event => model.load(event.target.value as MotionScenario)}>
        <option value="crossing">穿越 · z = +1 → −1</option><option value="safe">安全 · z = +1 → +2</option>
      </select></label>
      <p>固定 x 向线段，移动 y 向线段。<br />4 个端点不重合，仍可能发生中途键段相交。</p>
      <Button variant="outline" disabled={model.busy} onClick={() => model.load(model.scenario)}>恢复初态</Button>
      <Button disabled={model.busy} onClick={() => void model.analyze()}><ScanLine size={16} />{model.busy ? '正在检查…' : '检查运动并生成预览'}</Button>
    </section>
    <p className="geometry-path-status" role="status">{model.message}</p>
    <div className="geometry-path-viewports">
      <Viewport session={session} side="current" title="当前结构" subtitle={`移动线段当前 z = ${movingZ.toFixed(3)} Å`}><span className="geometry-path-pill" data-testid="motion-current-z">z = {movingZ.toFixed(3)}</span></Viewport>
      <Viewport session={session} side="preview" title={model.progress === 1 ? '目标姿态' : '运动中途'} subtitle={model.preview ? '通过检查的候选轨迹 · 线性插值，不修改当前结构。' : '指定目标轨迹 · 线性插值，不代表可应用的候选。'}>
        <span className="geometry-path-pill" data-testid="motion-progress">t = {model.progress.toFixed(2)}</span></Viewport>
    </div>
    <section className="geometry-path-timeline" aria-label="线性轨迹进度">
      <div><label htmlFor="motion-progress-slider">沿线性轨迹查看</label><span>0 起点 → 0.5 中途 → 1 目标</span></div>
      <input id="motion-progress-slider" aria-label="线性轨迹进度" type="range" min="0" max="1" step="0.01" value={model.progress} onChange={event => model.setProgress(Number(event.target.value))} />
      <div className="geometry-path-time-buttons">{[0, 0.5, 1].map(value => <Button key={value} size="sm" variant="ghost" onClick={() => model.setProgress(value)}>{value === 0 ? '起点' : value === 1 ? '目标' : '中途 50%'}</Button>)}</div>
    </section>
    <section className="geometry-path-results" aria-label="运动检查结果">
      <div className="geometry-path-result-heading"><div><h2>整条轨迹的结论</h2><p>检测原子—原子、原子—键段、键段—键段间距；无法判定也会阻止应用。</p></div>
        <div className="geometry-path-actions"><Button variant="outline" size="sm" disabled={model.busy || !model.snapshot.history.canUndo} onClick={() => model.history('undo')}><RotateCcw size={14} />撤销</Button>
          <Button variant="outline" size="sm" disabled={model.busy || !model.snapshot.history.canRedo} onClick={() => model.history('redo')}><RotateCw size={14} />重做</Button>
          <Button disabled={model.busy || !model.preview || !model.report?.safe} onClick={model.apply}>应用安全目标<ArrowRight size={14} /></Button></div>
      </div>
      <div className="geometry-path-metrics"><div><span>运动状态</span><strong data-testid="motion-result-status" className={model.report?.safe ? 'geometry-path-good' : 'geometry-path-alert'}>{model.report ? statuses[model.report.status] : '待检查'}</strong></div>
        <div><span>检查几何对</span><strong>{model.report?.checkedPairs ?? '—'}</strong></div><div><span>距离计算次数</span><strong>{model.report?.evaluations ?? '—'}</strong></div></div>
      {model.report?.issues.length ? <ul className="geometry-path-issues">{model.report.issues.map((issue, index) => <li key={index}>
        <button type="button" onClick={() => model.focusIssue(issue)}><Focus size={15} /><strong>{issueNames[issue.kind]}</strong>
          <span>{issue.sampleTime !== undefined ? `t = ${issue.sampleTime.toFixed(4)}` : issue.timeInterval ? `t ∈ [${issue.timeInterval.map(value => value.toFixed(4)).join(', ')}]` : issue.message}</span>
          <span>{issue.distance !== undefined ? `间距 ${issue.distance.toFixed(4)} Å` : '查看诊断'}</span>
        </button><small>{issue.atomIds.length} 个端点 · {issue.bondIds.length} 条键段 · 点击定位右侧视图</small>
      </li>)}</ul> : null}
    </section>
    <details className="geometry-path-json"><summary>结构化运动请求与报告</summary><pre>{JSON.stringify({ request: model.request, displayedTrajectory: model.preview ? 'accepted-candidate' : 'specified-target', motionReport: model.report, solverMotionReport: model.solverMotionReport }, null, 2)}</pre></details>
    <footer className="geometry-path-footnote">测试使用两条 4 Å 几何线段，渲染为碳节点与连线，不是化学键长示例。安全结论只覆盖所声明的直线插值、间距阈值和邻域排除规则；不保证沿途键角或化学手性保持，也不证明全局拓扑或其他路径安全。</footer>
  </>
}

function RibbonDemo() {
  const [halfTwists, setHalfTwists] = useState(3)
  const data = useMemo(() => ribbonFixture(halfTwists), [halfTwists])
  return <Session key={halfTwists} initial={data.molecule}>{session => <RibbonContent session={session} data={data} halfTwists={halfTwists} setHalfTwists={setHalfTwists} />}</Session>
}

function RibbonContent({ session, data, halfTwists, setHalfTwists }: {
  session: GeometryPathSession; data: ReturnType<typeof ribbonFixture>; halfTwists: number; setHalfTwists: (value: number) => void;
}) {
  const [section, setSection] = useState(0)
  const validTurns = data.measurements.turnsDegrees.filter((value): value is number => value !== null)
  const width = data.measurements.widthsAngstrom.find(value => value !== null)
  const locate = (index: number) => {
    setSection(index)
    const selected = data.region.sections[index]!
    session.currentApi.selection.set([selected.leftAtomId, selected.rightAtomId], [`ribbon-section-${index}`])
  }
  return <>
    <section className="geometry-path-controls" aria-label="环带引导设置"><label>带符号的半扭数<select aria-label="带符号的半扭数" value={halfTwists} onChange={event => setHalfTwists(Number(event.target.value))}>
      {[0, 1, -1, 3, -3].map(value => <option key={value} value={value}>{value > 0 ? '+' : ''}{value} 个半扭</option>)}</select></label>
      <p>24 个有序截面 · 中心半径 3 Å · 带宽 1 Å<br />奇数半扭使用左右交叉闭合，零半扭使用同侧闭合。</p>
      <span className="geometry-path-pill">程序几何骨架 · 不写入编辑器</span></section>
    <p className="geometry-path-status" role="status">当前 {halfTwists} 个半扭；{data.validation.ok && data.measurements.ok ? '区域连接和局部几何可测量。' : '区域或测量存在问题，请查看诊断。'}该形状不是论文中的分子结构。</p>
    <div className="geometry-path-ribbon-layout">
      <Viewport session={session} side="current" title="扭曲环带程序骨架" subtitle="48 个采样节点 · 两条轨道与截面参考连线"><span className="geometry-path-pill">{data.region.closure === 'crossed' ? '交叉闭合' : '同侧闭合'}</span></Viewport>
      <section className="geometry-path-ribbon-details" aria-label="环带区域诊断"><h2>有序截面定义区域</h2><p>每个截面用一对稳定 ID 表示左右采样点。闭合方式保存在 region 中，不依赖原子数组的存储顺序。</p>
        <dl><dt>区域连接校验</dt><dd data-testid="ribbon-validation">{data.validation.ok ? '通过' : '未通过'}</dd><dt>局部几何测量</dt><dd>{data.measurements.ok ? '可测量' : '存在退化'}</dd>
          <dt>截面数量</dt><dd>{data.region.sections.length}</dd><dt>截面宽度</dt><dd>{width?.toFixed(3) ?? '—'} Å</dd><dt>局部扭转范围</dt><dd>{validTurns.length ? `${Math.min(...validTurns).toFixed(2)}° ～ ${Math.max(...validTurns).toFixed(2)}°` : '不可测量'}</dd>
          <dt>末端接缝</dt><dd>{data.region.closure === 'crossed' ? 'L23 → R0，R23 → L0' : 'L23 → L0，R23 → R0'}</dd></dl>
        <label className="geometry-path-section-select">高亮截面<select aria-label="高亮环带截面" value={section} onChange={event => locate(Number(event.target.value))}>{data.region.sections.map((_, index) => <option value={index} key={index}>截面 {index} · L{index} / R{index}</option>)}</select></label>
        {data.validation.issues.concat(data.measurements.issues).map((issue, index) => <p className="geometry-path-alert" key={index}>{issue.message}</p>)}
      </section>
    </div>
    <div className="geometry-path-json-grid"><details className="geometry-path-json"><summary>区域 JSON · 稳定 ID 与闭合方式</summary><pre>{JSON.stringify(data.region, null, 2)}</pre></details>
      <details className="geometry-path-json"><summary>程序参数与几何诊断</summary><pre>{JSON.stringify({ source: 'procedural-guide', parameters: { sectionCount: 24, radius: 3, halfWidth: 0.5, halfTwists }, validation: data.validation, measurements: data.measurements }, null, 2)}</pre></details></div>
    <footer className="geometry-path-footnote">坐标由程序解析生成。局部扭转测量不自动指认化学 P/M，不证明全局拓扑类型或不存在自穿越；该引导骨架没有进行化学构象和能量验证。</footer>
  </>
}
