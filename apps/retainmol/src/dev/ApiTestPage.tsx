/**
 * MolViewer API 测试页
 * 访问：http://localhost:5173/?test
 */

import { useState, useCallback } from 'react'
import { MolViewer } from '@/domain/viewer/viewport'
import { newAtom, newBond, centerMolecule } from '@retainmol/mol-viewer/core'
import type { DisplayMode, Molecule } from '@retainmol/mol-viewer/core'

// ── 工具：构造测试分子 ────────────────────────────────────────────────────────

function makeWater(): Molecule {
  const O  = newAtom('O',  0,    0,    0)
  const H1 = newAtom('H',  0.96, 0,    0)
  const H2 = newAtom('H', -0.24, 0.93, 0)
  return centerMolecule({ atoms: [O, H1, H2], bonds: [newBond(O.id, H1.id), newBond(O.id, H2.id)], name: 'Water' })
}

function makeEthanol(): Molecule {
  const C1 = newAtom('C', -1.2, 0, 0)
  const C2 = newAtom('C',  0,   0, 0)
  const O  = newAtom('O',  1.2, 0, 0)
  const H  = newAtom('H',  2.1, 0, 0)
  return centerMolecule({
    atoms: [C1, C2, O, H],
    bonds: [newBond(C1.id, C2.id), newBond(C2.id, O.id), newBond(O.id, H.id)],
    name: 'Ethanol',
  })
}

// ── ① 受控 molecule ───────────────────────────────────────────────────────────

function ControlledMoleculeTest() {
  const [mol, setMol] = useState<Molecule>(makeWater)
  const [log, setLog] = useState<string[]>(['就绪'])

  const push = (msg: string) =>
    setLog(p => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...p.slice(0, 8)])

  const handleChange = useCallback((m: Molecule) => {
    setMol(m); push(`onMoleculeChange → ${m.atoms.length} 原子`)
  }, [])

  return (
    <Card title="① molecule / onMoleculeChange"
      desc="验证：prop 写入不触发回调；用户编辑才触发">
      <div className="flex h-64">
        <div className="flex-1">
          <MolViewer molecule={mol} onMoleculeChange={handleChange} />
        </div>
        <Side>
          <Stat label="name"  value={mol.name ?? '—'} />
          <Stat label="atoms" value={String(mol.atoms.length)} />
          <Stat label="bonds" value={String(mol.bonds.length)} />
          <div className="mt-2 space-y-1">
            <Btn onClick={() => { setMol(makeWater());   push('外部→水分子') }}>水分子</Btn>
            <Btn onClick={() => { setMol(makeEthanol()); push('外部→乙醇') }}>乙醇</Btn>
            <Btn
              color="green"
              onClick={() => {
                const n = newAtom('N', 2, 1, 0)
                setMol(m => ({ ...m, atoms: [...m.atoms, n] }))
                push('AI 模拟：添加 N 原子（不应触发 onMoleculeChange）')
              }}>
              ▶ 模拟 AI 加原子
            </Btn>
          </div>
          <Log entries={log} />
        </Side>
      </div>
    </Card>
  )
}

// ── ② selectedAtomIds / onSelectionChange ────────────────────────────────────

function SelectionTest() {
  const [mol]      = useState<Molecule>(makeEthanol)
  const [sel, setSel] = useState<ReadonlySet<string>>(new Set())
  const [log, setLog] = useState<string[]>(['就绪'])

  const push = (msg: string) =>
    setLog(p => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...p.slice(0, 8)])

  const handleSel = useCallback((atomIds: Set<string>) => {
    setSel(atomIds)
    const symbols = [...atomIds].map(id => mol.atoms.find(a => a.id === id)?.symbol ?? '?')
    push(`onSelectionChange → [${symbols.join(', ')}]`)
  }, [mol])

  return (
    <Card title="② selectedAtomIds / onSelectionChange"
      desc="验证：外部选择不触发回调；点击原子才触发">
      <div className="flex h-64">
        <div className="flex-1">
          <MolViewer molecule={mol} selectedAtomIds={sel} onSelectionChange={handleSel} />
        </div>
        <Side>
          <div className="text-[11px] text-gray-500 mb-1">当前选中</div>
          <div className="font-mono text-xs bg-gray-50 rounded p-1.5 min-h-8 text-gray-700">
            {sel.size === 0 ? '无' : [...sel].map(id =>
              mol.atoms.find(a => a.id === id)?.symbol
            ).join(', ')}
          </div>
          <div className="mt-2 space-y-1">
            <Btn onClick={() => { setSel(new Set()); push('外部→清空选择（不触发回调）') }}>清空选择</Btn>
            <Btn onClick={() => {
              const first2 = new Set(mol.atoms.slice(0, 2).map(a => a.id))
              setSel(first2); push('外部→选前两个原子（不触发回调）')
            }}>选前两个</Btn>
          </div>
          <Log entries={log} />
        </Side>
      </div>
    </Card>
  )
}

// ── ③ readOnly ────────────────────────────────────────────────────────────────

function ReadOnlyTest() {
  const [count, setCount] = useState(0)
  const [molecule] = useState(makeEthanol)
  return (
    <Card title="③ readOnly"
      desc="验证：点击画布不触发 onMoleculeChange，计数应保持 0">
      <div className="flex h-56">
        <div className="flex-1">
          <MolViewer molecule={molecule} readOnly
            onMoleculeChange={() => setCount(c => c + 1)} />
        </div>
        <Side>
          <div className="text-center py-4">
            <div className="text-3xl font-bold font-mono text-gray-800">{count}</div>
            <div className="text-xs text-gray-500 mt-1">触发次数</div>
          </div>
          <div className={`text-xs font-medium text-center px-3 py-1 rounded-full ${
            count === 0 ? 'bg-primary text-primary-foreground' : 'border border-foreground bg-background text-foreground'
          }`}>
            {count === 0 ? '✓ 只读正常' : '✗ 出现意外编辑'}
          </div>
        </Side>
      </div>
    </Card>
  )
}

// ── ④ displayMode + theme + showAtomLabels ────────────────────────────────────

function DisplayOptionsTest() {
  const MODES: DisplayMode[] = ['ball-stick', 'spacefill', 'stick', 'wireframe']
  const THEMES = ['default', 'dark', 'mono', 'pymol']
  const [mode,   setMode]   = useState<DisplayMode>('ball-stick')
  const [theme,  setTheme]  = useState('default')
  const [labels, setLabels] = useState(false)
  const [molecule] = useState(makeEthanol)

  return (
    <Card title="④ displayMode / theme / showAtomLabels"
      desc="验证：切换选项，3D 视图实时响应">
      <div className="flex h-64">
        <div className="flex-1">
          <MolViewer molecule={molecule} readOnly
            displayMode={mode} theme={theme} showAtomLabels={labels} />
        </div>
        <Side>
          <OptionGroup label="displayMode">
            {MODES.map(m => (
              <Btn key={m} active={mode === m} onClick={() => setMode(m)}>{m}</Btn>
            ))}
          </OptionGroup>
          <OptionGroup label="theme">
            {THEMES.map(t => (
              <Btn key={t} active={theme === t} onClick={() => setTheme(t)}>{t}</Btn>
            ))}
          </OptionGroup>
          <OptionGroup label="showAtomLabels">
            <Btn active={labels} onClick={() => setLabels(v => !v)}>
              {labels ? '✓ 显示中' : '隐藏'}
            </Btn>
          </OptionGroup>
        </Side>
      </div>
    </Card>
  )
}

// ── 小组件 ────────────────────────────────────────────────────────────────────

function Card({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <section className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
      <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
        <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
      </div>
      {children}
    </section>
  )
}

function Side({ children }: { children: React.ReactNode }) {
  return <div className="w-52 border-l border-gray-200 p-3 flex flex-col gap-2 bg-white text-sm">{children}</div>
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-[11px]">
      <span className="text-gray-400">{label}</span>
      <span className="font-mono text-gray-700">{value}</span>
    </div>
  )
}

function Btn({ children, onClick, color = 'gray', active = false }: {
  children: React.ReactNode; onClick?: () => void; color?: 'gray' | 'green'; active?: boolean
}) {
  const base = 'w-full px-2 py-1 rounded-lg text-xs border transition-colors text-left'
  const cls =
    active          ? 'bg-gray-900 text-white border-gray-900' :
    color === 'green' ? 'border-foreground bg-foreground text-background hover:opacity-80' :
    'border-gray-200 text-gray-600 hover:bg-gray-50'
  return <button className={`${base} ${cls}`} onClick={onClick}>{children}</button>
}

function Log({ entries }: { entries: string[] }) {
  return (
    <div className="mt-auto border-t border-gray-100 pt-2">
      <div className="text-[10px] font-medium text-gray-400 mb-1">事件日志</div>
      <div className="space-y-0.5 max-h-24 overflow-y-auto">
        {entries.map((e, i) => (
          <div key={i} className={`text-[10px] font-mono ${i === 0 ? 'text-foreground' : 'text-muted-foreground'}`}>{e}</div>
        ))}
      </div>
    </div>
  )
}

function OptionGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] text-gray-400 mb-1">{label}</div>
      <div className="space-y-1">{children}</div>
    </div>
  )
}

// ── 主页面 ────────────────────────────────────────────────────────────────────

export default function ApiTestPage() {
  type TestCase = 'molecule' | 'selection' | 'readonly' | 'display'
  const requested = new URLSearchParams(location.search).get('test')
  const initialCase: TestCase = requested === 'selection' || requested === 'readonly' || requested === 'display'
    ? requested
    : 'molecule'
  const [activeCase, setActiveCase] = useState<TestCase>(initialCase)
  const tests: Array<{ id: TestCase; label: string; content: React.ReactNode }> = [
    { id: 'molecule', label: '受控分子', content: <ControlledMoleculeTest /> },
    { id: 'selection', label: '受控选择', content: <SelectionTest /> },
    { id: 'readonly', label: '只读', content: <ReadOnlyTest /> },
    { id: 'display', label: '显示选项', content: <DisplayOptionsTest /> },
  ]

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto space-y-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">MolViewer API 测试</h1>
          <p className="text-sm text-gray-500 mt-0.5">验证所有受控 props 的数据流和防循环机制</p>
        </div>
        <div className="flex gap-2" role="tablist" aria-label="API 测试用例">
          {tests.map(test => (
            <button
              key={test.id}
              type="button"
              role="tab"
              aria-selected={activeCase === test.id}
              className={`px-3 py-1.5 rounded-md border text-xs font-medium ${
                activeCase === test.id
                  ? 'bg-gray-900 border-gray-900 text-white'
                  : 'bg-white border-gray-200 text-gray-600'
              }`}
              onClick={() => setActiveCase(test.id)}
            >
              {test.label}
            </button>
          ))}
        </div>
        {tests.find(test => test.id === activeCase)?.content}
      </div>
    </div>
  )
}
