import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
import { MolViewer, type RendererPort } from '@retainmol/mol-viewer/viewer'
import { createViewerRuntime, getViewerApi, type ViewerApi, type ViewerRuntime, type DisplayMode, type Molecule } from '@retainmol/mol-viewer/runtime'
import { parseMol, generate3D, exportMol } from '@retainmol/mol-viewer/io'
import { describeMolecule, stereoCenter } from './moleculeSummary'

interface PanelProps {
  id: string
  title: string
  initialMolecule: Molecule
  sourceText: string
}
interface Session { runtime: ViewerRuntime; api: ViewerApi }

export function EditorPanel(props: PanelProps) {
  const [session, setSession] = useState<Session | null>(null)
  useEffect(() => {
    // Allocate and release in the same effect: StrictMode replay gets a fresh runtime.
    const runtime = createViewerRuntime()
    const api = getViewerApi(runtime)
    api.setMolecule(props.initialMolecule)
    api.history.clear()
    setSession({ runtime, api })
    return () => runtime.dispose()
  }, [props.initialMolecule])
  return session ? <ConnectedPanel {...props} {...session} /> : null
}

function ConnectedPanel({ id, title, sourceText, runtime, api }: PanelProps & Session) {
  const snapshot = useSyncExternalStore(api.subscribe, api.getSnapshot, api.getSnapshot)
  const [events, setEvents] = useState(0)
  const [moleculeEvents, setMoleculeEvents] = useState(0)
  const [selectionEvents, setSelectionEvents] = useState(0)
  const [visible, setVisible] = useState(true)
  const [mounts, setMounts] = useState(1)
  const [ready, setReady] = useState(false)
  const [readOnly, setReadOnly] = useState(false)
  const [saved, setSaved] = useState('')
  const [image, setImage] = useState<string | null>(null)
  const [message, setMessage] = useState('点击原子选择，拖动空白区域旋转。')
  const molecule = snapshot.molecule
  const center = stereoCenter(molecule)
  const hydrogen = molecule.atoms.find(atom => atom.symbol === 'H')
  useEffect(() => api.subscribe(() => setEvents(count => count + 1)), [api])
  const bindRenderer = useCallback((renderer: RendererPort | null) => {
    setReady(renderer !== null)
  }, [])
  const run = (operation: () => void) => () => {
    try { operation() } catch (error) {
      setMessage(`操作失败：${error instanceof Error ? error.message : String(error)}`)
    }
  }
  const specify = (value: 'R' | 'S' | 'none') => {
    if (!center) return
    const result = api.edit.setChirality(center.id, value)
    if (!result.ok) throw new Error(result.reason ?? '无法设置手性')
    setMessage(value === 'none' ? '已清除指定，保留当前几何构型' : `已指定 ${value}`)
  }
  return <section aria-label={title} data-testid={`${id}-panel`}>
    <div className="panel-heading"><h2>{title}</h2><span>{readOnly ? '只读交互' : '可编辑'}</span></div>
    <fieldset disabled={readOnly} className="actions">
      <button disabled={!sourceText.trim()} onClick={run(() => {
        const parsed = parseMol(sourceText)
        if (!parsed.atoms.length) throw new Error('MOL 中没有原子')
        const generated = generate3D(parsed)
        if (!generated.ok) throw new Error(generated.reason ?? '生成 3D 失败')
        api.setMolecule(generated.molecule)
        api.history.clear()
        api.view.fit()
        setSaved('')
        setMessage('已载入并生成 3D，开启新的编辑历史。')
      })}>载入此侧（生成 3D）</button>
      <button disabled={!center} onClick={run(() => specify('R'))}>指定 R</button>
      <button disabled={!center} onClick={run(() => specify('S'))}>指定 S</button>
      <button disabled={!center} onClick={run(() => specify('none'))}>清除指定</button>
      <button disabled={!hydrogen} onClick={run(() => {
        if (hydrogen) api.edit.replaceAtom(hydrogen.id, 'Cl')
        setMessage('已将一个 H 替换为 Cl')
      })}>H 替换为 Cl</button>
      <button disabled={!snapshot.selectedAtomIds.length && !snapshot.selectedBondIds.length}
        onClick={run(() => { api.edit.removeSelected(); setMessage('已删除选中内容') })}>删除选中</button>
      <button disabled={!snapshot.history.canUndo} onClick={run(() => { api.history.undo(); setMessage('已撤销') })}>撤销</button>
      <button disabled={!snapshot.history.canRedo} onClick={run(() => { api.history.redo(); setMessage('已重做') })}>重做</button>
      <button disabled={!saved} onClick={run(() => {
        api.setMolecule(parseMol(saved))
        setMessage('已重载导出，未重新生成 3D')
      })}>重载导出</button>
    </fieldset>
    <div className="actions view-controls">
      <label>显示模式 <select value={snapshot.displayMode}
        onChange={event => api.view.setDisplayMode(event.target.value as DisplayMode)}>
        <option value="ball-stick">球棍</option><option value="stick">棍状</option>
        <option value="spacefill">空间填充</option><option value="wireframe">线框</option>
      </select></label>
      <label><input type="checkbox" checked={snapshot.showAtomLabels}
        onChange={event => api.view.setShowAtomLabels(event.target.checked)} /> 原子标签</label>
      <label><input type="checkbox" checked={readOnly}
        onChange={event => setReadOnly(event.target.checked)} /> 只读交互</label>
      <button disabled={!ready} onClick={() => api.view.fit()}>适配视口</button>
      <button disabled={!ready || !snapshot.selectedAtomIds.length} onClick={() => api.view.focusSelection()}>聚焦选择</button>
      <button disabled={!ready} onClick={() => api.view.reset()}>重置视角</button>
    </div>
    <div className="viewport" data-testid={`${id}-viewport`}>
      {visible ? <MolViewer runtime={runtime} interactionMode={readOnly ? 'read-only' : 'select'}
        onRendererChange={bindRenderer}
        onMoleculeChange={() => setMoleculeEvents(count => count + 1)}
        onSelectionChange={() => setSelectionEvents(count => count + 1)} />
        : <div className="empty-viewport">视口已卸载，分子和编辑历史仍保留。</div>}
    </div>
    <p role="status">{message}</p>
    <output data-testid={`${id}-state`}>{describeMolecule(molecule)}</output>
    <p data-testid={`${id}-history`}>可撤销 {snapshot.history.undoCount} · 可重做 {snapshot.history.redoCount}</p>
    <p data-testid={`${id}-events`}>状态通知 {events} · 分子回调 {moleculeEvents} · 选择回调 {selectionEvents} · 已选原子 {snapshot.selectedAtomIds.length} / 键 {snapshot.selectedBondIds.length}</p>
    <p data-testid={`${id}-lifecycle`}>渲染器 {ready ? '已连接' : '未连接'} · 挂载次数 {mounts}</p>
    <div className="actions">
      <button disabled={readOnly || !center} onClick={() => { if (center) api.selection.set([center.id]) }}>选中手性中心</button>
      <button disabled={readOnly} onClick={() => api.selection.clear()}>清除选择</button>
      <button disabled={!molecule.atoms.length} onClick={run(() => {
        setSaved(exportMol(molecule)); setMessage('已导出 MOL，可展开文本复制。')
      })}>导出 MOL</button>
      <button disabled={!ready} onClick={run(() => setImage(api.view.captureImage()))}>视口截图</button>
      <button onClick={() => {
        setVisible(value => !value)
        if (!visible) setMounts(count => count + 1)
      }}>{visible ? '卸载视口' : '重新挂载'}</button>
    </div>
    {saved && <details open><summary>导出的 MOL</summary>
      <textarea aria-label={`${title}导出的 MOL`} value={saved} readOnly spellCheck={false} />
    </details>}
    {image && <details open><summary>视口截图预览</summary><img className="capture" src={image} alt={`${title}截图`} /></details>}
  </section>
}
