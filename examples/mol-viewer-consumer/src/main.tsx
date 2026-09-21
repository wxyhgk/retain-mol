import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { type Molecule } from '@retainmol/mol-viewer/core'
import { parseMol, generate3D, registerForceFieldFromUrl } from '@retainmol/mol-viewer/io'
import { EditorPanel } from './EditorPanel'
import './style.css'

const samples = [
  ['fixture', '手性中心 CC(F)(Br)I'],
  ['fused', '稠环 · 萘'],
  ['spiro', '螺环 · 螺[5.5]十一烷'],
  ['chain101', '较大分子 · 101 原子（含 H）'],
] as const

async function sampleText(name: string) {
  const response = await fetch(`${import.meta.env.BASE_URL}${name}.mol`)
  if (!response.ok) throw new Error(`读取样例失败：${response.status}`)
  return response.text()
}

function App() {
  const [initial, setInitial] = useState<Molecule | null>(null)
  const [text, setText] = useState('')
  const [sample, setSample] = useState('fixture')
  const [message, setMessage] = useState('正在载入手性样例…')
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    let active = true
    void (async () => {
      try {
        const input = await sampleText('fixture')
        await registerForceFieldFromUrl(`${import.meta.env.BASE_URL}ocl/resources.json`)
        if (!active) return
        const generated = generate3D(parseMol(input))
        if (!generated.ok) throw new Error(generated.reason ?? '生成 3D 失败')
        setText(input)
        setInitial(generated.molecule)
        setMessage('左右均已载入同一分子，可独立编辑、撤销和调整视角。')
      } catch (error) {
        if (active) setMessage(`初始化失败：${error instanceof Error ? error.message : String(error)}`)
      }
    })()
    return () => { active = false }
  }, [])
  return <main>
    <header>
      <p className="eyebrow">RETAINMOL · VIEWER</p>
      <h1>分子编辑与可视化</h1>
      <p>两个独立编辑器。修改一侧，另一侧的分子、选择、历史与视角保持独立。</p>
    </header>
    <div className="source-panel">
      <div className="actions">
        <label>样例 <select value={sample} onChange={event => setSample(event.target.value)}>
          {samples.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select></label>
        <button disabled={busy} onClick={async () => {
          setBusy(true)
          try {
            setText(await sampleText(sample))
            setMessage('样例已填入，下方选择要载入的编辑器。')
          } catch (error) { setMessage(String(error)) } finally { setBusy(false) }
        }}>填入样例</button>
      </div>
      <p role="status">{message}</p>
      <details>
        <summary>MOL 输入文本</summary>
        <label className="sr-only" htmlFor="mol-text">MOL 输入文本</label>
        <textarea id="mol-text" value={text} onChange={event => setText(event.target.value)} spellCheck={false} />
      </details>
    </div>
    {initial && <div className="panels">
      <EditorPanel id="left" title="左侧编辑器" initialMolecule={initial} sourceText={text} />
      <EditorPanel id="right" title="右侧编辑器" initialMolecule={initial} sourceText={text} />
    </div>}
  </main>
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)
