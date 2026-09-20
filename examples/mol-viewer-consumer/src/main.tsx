import { StrictMode, useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { createRoot } from 'react-dom/client'
import { MolViewer, type RendererPort } from '@retainmol/mol-viewer/viewer'
import { createViewerRuntime, type ViewerRuntime } from '@retainmol/mol-viewer/runtime'
import { getModelingContext } from '@retainmol/mol-viewer/modeling'
import { type Molecule } from '@retainmol/mol-viewer/core'
import { parseMol, generate3D, exportMol, registerForceFieldFromUrl } from '@retainmol/mol-viewer/io'
import { useMoleculeStore, selectActiveMoleculeOrEmpty } from '@retainmol/mol-viewer/state'
import { EMPTY, describeMolecule, stereoCenter } from './moleculeSummary'
import './style.css'

function ReferenceViewer({ molecule }: { molecule: Molecule }) {
  const [runtime, setRuntime] = useState<ViewerRuntime | null>(null)
  const [actual, setActual] = useState('点击“检查副本”读取实例实际状态')
  const [changes, setChanges] = useState(0)
  const [selections, setSelections] = useState(0)
  const renderer = useRef<RendererPort | null>(null)
  // Allocate in the effect so StrictMode's setup/cleanup replay gets a fresh runtime.
  // Only this owner disposes the isolated runtime; never dispose defaultViewerRuntime.
  useEffect(() => {
    const instance = createViewerRuntime()
    setRuntime(instance)
    return () => instance.dispose()
  }, [])
  const bindRenderer = useCallback((port: RendererPort | null) => { renderer.current = port }, [])
  const inspect = () => {
    if (!runtime) return
    const context = getModelingContext(runtime)
    setActual(describeMolecule(context.objects[0]?.molecule ?? EMPTY))
  }
  return <section aria-label="只读副本">
    <h2>独立只读副本</h2>
    <p>保持导入时的分子，左侧修改后可检查隔离结果。</p>
    <div className="actions">
      <button disabled={!runtime} onClick={inspect}>检查副本</button>
      <button onClick={() => renderer.current?.fitToMolecule([...molecule.atoms])}>适配副本视口</button>
    </div>
    <output data-testid="reference-state">{actual}</output>
    <p data-testid="reference-events">分子回调 {changes} · 选择回调 {selections}</p>
    <div className="viewport" data-testid="reference-viewport">
      {runtime && <MolViewer runtime={runtime} molecule={molecule} interactionMode="read-only"
        onMoleculeChange={() => setChanges(count => count + 1)}
        onSelectionChange={() => setSelections(count => count + 1)}
        onRendererChange={bindRenderer} />}
    </div>
  </section>
}

function App() {
  // These public store exports address only the default runtime.
  const molecule = useMoleculeStore(selectActiveMoleculeOrEmpty)
  const selectedCount = useMoleculeStore(state => state.selectedAtomIds.size)
  const canUndo = useSyncExternalStore(useMoleculeStore.temporal.subscribe,
    () => useMoleculeStore.temporal.getState().pastStates.length > 0, () => false)
  const canRedo = useSyncExternalStore(useMoleculeStore.temporal.subscribe,
    () => useMoleculeStore.temporal.getState().futureStates.length > 0, () => false)
  const [reference, setReference] = useState<Molecule>(EMPTY)
  const [text, setText] = useState('')
  const [saved, setSaved] = useState('')
  const [message, setMessage] = useState('先填入测试 MOL，再导入并生成 3D。')
  const [busy, setBusy] = useState(false)
  const [visible, setVisible] = useState(true)
  const [mounts, setMounts] = useState(1)
  const [changes, setChanges] = useState(0)
  const [rendererReady, setRendererReady] = useState(false)
  const renderer = useRef<RendererPort | null>(null)
  const bindRenderer = useCallback((port: RendererPort | null) => {
    renderer.current = port
    setRendererReady(port !== null)
  }, [])
  const center = stereoCenter(molecule)
  const hydrogen = molecule.atoms.find(atom => atom.symbol === 'H')
  const run = (operation: () => void | Promise<void>) => async () => {
    setBusy(true)
    try { await operation() } catch (error) {
      setMessage(`操作失败：${error instanceof Error ? error.message : String(error)}`)
    } finally { setBusy(false) }
  }
  const specify = (value: 'R' | 'S' | 'none') => {
    if (!center) return
    const result = useMoleculeStore.getState().setChirality(center.id, value)
    if (!result.ok) throw new Error(result.reason ?? '无法设置手性')
    setMessage(value === 'none' ? '已清除指定，保留当前几何构型' : `已指定 ${value}`)
  }
  async function load() {
    // Resolve resources relative to the deployment base, including subdirectory hosts.
    await registerForceFieldFromUrl(`${import.meta.env.BASE_URL}ocl/resources.json`)
    const parsed = parseMol(text)
    if (!parsed.atoms.length) throw new Error('MOL 中没有原子')
    const generated = generate3D(parsed)
    if (!generated.ok) throw new Error(generated.reason ?? '生成 3D 失败')
    useMoleculeStore.getState().setMolecule(generated.molecule)
    useMoleculeStore.temporal.getState().clear()
    setReference(generated.molecule)
    setSaved('')
    setChanges(0)
    setMessage('已导入并生成 3D；只读副本保存导入时状态')
  }
  return <main>
    <h1>mol-viewer 独立接入示例</h1>
    <p>导入、编辑与 MOL 往返；双实例、只读模式与视口挂载验证。</p>
    <fieldset disabled={busy} className="actions">
      <button onClick={run(async () => {
        const response = await fetch(`${import.meta.env.BASE_URL}fixture.mol`)
        if (!response.ok) throw new Error(`读取示例失败：${response.status}`)
        setText(await response.text())
      })}>填入测试 MOL</button>
      <button disabled={!text.trim()} onClick={run(load)}>导入并生成 3D</button>
      <button disabled={!center} onClick={run(() => specify('R'))}>指定 R</button>
      <button disabled={!center} onClick={run(() => specify('S'))}>指定 S</button>
      <button disabled={!center} onClick={run(() => specify('none'))}>清除指定</button>
      <button disabled={!hydrogen} onClick={run(() => {
        if (!hydrogen) return
        useMoleculeStore.getState().replaceAtom(hydrogen.id, 'Cl')
        setMessage('已将一个 H 替换为 Cl')
      })}>H 替换为 Cl</button>
      <button disabled={!canUndo} onClick={run(() => { useMoleculeStore.temporal.getState().undo(); setMessage('已撤销') })}>撤销</button>
      <button disabled={!canRedo} onClick={run(() => { useMoleculeStore.temporal.getState().redo(); setMessage('已重做') })}>重做</button>
      <button disabled={!molecule.atoms.length} onClick={run(() => {
        const output = exportMol(molecule)
        setSaved(output); setText(output); setMessage('已导出 MOL，可在文本框复制')
      })}>导出 MOL</button>
      <button disabled={!saved} onClick={run(() => {
        // Reload coordinates directly; generating a new conformer would hide round-trip errors.
        useMoleculeStore.getState().setMolecule(parseMol(saved))
        setMessage('已重载导出，未重新生成 3D')
      })}>重载导出</button>
      <button onClick={() => {
        setVisible(value => !value)
        if (!visible) setMounts(count => count + 1)
      }}>{visible ? '卸载视口' : '重新挂载'}</button>
    </fieldset>
    <p role="status">{busy ? '处理中…' : message} · 挂载次数 {mounts}</p>
    <label htmlFor="mol-text">MOL 文本</label>
    <textarea id="mol-text" value={text} onChange={event => setText(event.target.value)} spellCheck={false} />
    {visible ? <div className="panels">
      <section aria-label="编辑实例">
        <h2>编辑实例</h2><p>点击原子选择，拖动空白区域旋转；上方按钮执行编辑。</p>
        <button disabled={!rendererReady} onClick={() => renderer.current?.fitToMolecule([...molecule.atoms])}>适配编辑视口</button>
        <output data-testid="editor-state">{describeMolecule(molecule)}</output>
        <p data-testid="editor-events">分子回调 {changes} · 已选原子 {selectedCount} · 渲染器 {rendererReady ? '已连接' : '未连接'}</p>
        <div className="viewport" data-testid="editor-viewport">
          <MolViewer interactionMode="select" onRendererChange={bindRenderer}
            onMoleculeChange={() => setChanges(count => count + 1)} />
        </div>
      </section>
      <ReferenceViewer molecule={reference} />
    </div> : <p>视口已卸载。编辑数据保留；重新挂载时为副本创建新的独立 runtime。</p>}
  </main>
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)
