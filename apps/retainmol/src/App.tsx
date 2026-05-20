import { useEffect, useState } from 'react'
import Toolbar from '@/components/toolbar/Toolbar'
import ToolStrip from '@/components/toolbar/ToolStrip'
import {
  MolViewer, useMoleculeStore, useEditorStore, selectActiveMoleculeOrEmpty,
  useMoleculeTemporal, bondSelectedAtoms, parseClipboard, centerMolecule, cn,
} from '@retainmol/mol-viewer'
import type { DisplayMode } from '@retainmol/mol-viewer'
import { RightPanel } from '@/components/panels'
import { useStore } from 'zustand'

export default function App() {
  const { setActiveTool } = useEditorStore()
  const { addToScene } = useMoleculeStore()
  const { undo, redo } = useStore(useMoleculeTemporal)
  const [showProperties, setShowProperties] = useState(false)

  // 全局 Ctrl+V 粘贴：自动识别 MOL / XYZ / GJF / 裸坐标
  useEffect(() => {
    const handler = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return
      const text = e.clipboardData?.getData('text')
      if (!text || text.length < 10) return
      try {
        const { format, molecule } = parseClipboard(text)
        addToScene(centerMolecule(molecule))
        e.preventDefault()
        const label = format === 'gjf' ? 'Gaussian GJF' : format.toUpperCase()
        console.log(`[粘贴] 识别为 ${label}，导入 ${molecule.atoms.length} 个原子`)
      } catch {
        // 非分子内容，放任默认行为
      }
    }
    window.addEventListener('paste', handler)
    return () => window.removeEventListener('paste', handler)
  }, [addToScene])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') { e.preventDefault(); undo(); return }
      if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) { e.preventDefault(); redo(); return }

      if (e.key === 's' || e.key === 'S') { setActiveTool('select'); return }
      if (e.key === 'v' || e.key === 'V') { setActiveTool('move-object'); return }
      if (e.key === 'a' || e.key === 'A') { setActiveTool('add-atom'); return }
      if (e.key === 'd' || e.key === 'D') { setActiveTool('delete'); return }
      if (e.key === 'm' || e.key === 'M') { setActiveTool('measure'); return }

      // B 键：已选中恰好两个原子时直接成键，否则切换到成键工具
      if (e.key === 'b' || e.key === 'B') {
        const { selectedAtomIds } = useMoleculeStore.getState()
        if (selectedAtomIds.size === 2) {
          const result = bondSelectedAtoms()
          if (!result.ok) alert(result.reason)
        } else {
          setActiveTool('add-bond')
        }
        return
      }

      // Enter：measure 工具下提交当前 pending
      if (e.key === 'Enter' && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
        const { activeTool, commitPendingMeasure } = useEditorStore.getState()
        if (activeTool === 'measure') { commitPendingMeasure(); return }
      }

      // Escape：measure 工具下取消 pending（不提交）
      if (e.key === 'Escape') {
        const { activeTool, pendingAtomIds, cancelPendingMeasure } = useEditorStore.getState()
        if (activeTool === 'measure' && pendingAtomIds.length > 0) { cancelPendingMeasure(); return }
      }

      // Delete / Backspace：删除选中的原子和键
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const { selectedAtomIds, selectedBondIds, removeAtom, removeBond } = useMoleculeStore.getState()
        selectedBondIds.forEach(id => removeBond(id))
        selectedAtomIds.forEach(id => removeAtom(id))
        return
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [setActiveTool, undo, redo])

  return (
    <div className="h-screen w-screen bg-[#F5F5F7] text-gray-800 flex flex-col overflow-hidden">
      {/* 顶部第1行：工具栏 */}
      <Toolbar showProperties={showProperties} onToggleProperties={() => setShowProperties(v => !v)} />
      {/* 顶部第2行：分子信息 + 渲染模式 */}
      <ContextBar />

      <div className="flex-1 flex overflow-hidden min-h-0">
        <div className="flex-1 flex">
          <ToolStrip />
          <div className="flex-1 relative">
            <MolViewer />
            <CanvasEmptyHint />
            <StatusBar />
          </div>
        </div>

        {/* 右侧属性面板：默认收起，点「属性」按钮展开 */}
        {showProperties && (
          <div className="w-72 shrink-0 bg-white border-l border-gray-200 flex flex-col overflow-hidden">
            <div className="px-3 py-2 border-b border-gray-200 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-700">属性</span>
              <button
                onClick={() => setShowProperties(false)}
                className="text-gray-400 hover:text-gray-600 text-xs leading-none px-1"
              >✕</button>
            </div>
            <div className="flex-1 overflow-hidden flex flex-col">
              <RightPanel />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── 分子式计算（C 优先，H 其次，其余字母序）───────────────────────
function computeFormula(atoms: readonly { symbol: string }[]): string {
  if (atoms.length === 0) return ''
  const counts: Record<string, number> = {}
  for (const a of atoms) counts[a.symbol] = (counts[a.symbol] || 0) + 1
  const priority = ['C', 'H']
  const keys = [
    ...priority.filter(s => counts[s]),
    ...Object.keys(counts).filter(s => !priority.includes(s)).sort(),
  ]
  return keys.map(s => `${s}${counts[s] > 1 ? counts[s] : ''}`).join('')
}

const DISPLAY_MODES: { id: DisplayMode; label: string }[] = [
  { id: 'ball-stick', label: '球棍' },
  { id: 'spacefill', label: '空填' },
  { id: 'stick',     label: '棍棒' },
  { id: 'wireframe', label: '线框' },
]

function ContextBar() {
  const { displayMode, setDisplayMode } = useEditorStore()
  const { selectedAtomIds, selectedBondIds } = useMoleculeStore()
  const molecule = useMoleculeStore(selectActiveMoleculeOrEmpty)
  const formula = computeFormula(molecule.atoms)
  const selAtoms = selectedAtomIds.size
  const selBonds = selectedBondIds.size
  const selTotal = selAtoms + selBonds

  // 单选原子时展示元素符号
  const singleEl = selAtoms === 1
    ? molecule.atoms.find(a => selectedAtomIds.has(a.id))?.symbol
    : null

  return (
    <div className="h-9 shrink-0 flex items-center px-3 gap-3 bg-white border-b border-gray-200 text-xs select-none">
      {/* 左侧：分子名 + 分子式 */}
      <span className="font-medium text-gray-800 truncate max-w-[120px]">
        {molecule.name || 'New Molecule'}
      </span>
      {formula && (
        <span className="text-gray-400">{formula}</span>
      )}

      {/* 选中信息胶囊 */}
      {selTotal > 0 && (
        <span className="px-2 py-0.5 rounded-full bg-gray-100 border border-gray-200 text-gray-500 whitespace-nowrap">
          {selTotal} selected{singleEl ? ` · ${singleEl}` : ''}
        </span>
      )}

      {/* 右侧：渲染模式 pill tabs */}
      <div className="ml-auto flex items-center rounded-[8px] bg-gray-100 p-0.5 gap-0.5">
        {DISPLAY_MODES.map(m => (
          <button
            key={m.id}
            onClick={() => setDisplayMode(m.id)}
            className={cn(
              'px-2.5 py-1 rounded-[6px] text-[11px] font-medium transition-all',
              displayMode === m.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-400 hover:text-gray-600'
            )}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function CanvasEmptyHint() {
  const molecule = useMoleculeStore(selectActiveMoleculeOrEmpty)
  if (molecule.atoms.length > 0) return null
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="text-center px-6 py-5 rounded-2xl bg-white/70 backdrop-blur-sm shadow-sm border border-gray-200/60">
        <p className="text-sm text-gray-500 leading-relaxed">
          选择添加原子工具后点击画布，或从文件导入分子
        </p>
      </div>
    </div>
  )
}

function StatusBar() {
  const { activeTool, activeElement } = useEditorStore()
  const { selectedAtomIds, selectedBondIds } = useMoleculeStore()

  const toolLabel: Record<string, string> = {
    select: '选择',
    'add-atom': `添加原子 [${activeElement}]`,
    'add-bond': '添加键',
    delete: '删除',
    measure: '测量',
  }

  const selCount = selectedAtomIds.size + selectedBondIds.size

  return (
    <div className="absolute bottom-0 left-0 right-0 h-6 bg-white/80 backdrop-blur-sm border-t border-gray-200/60 flex items-center px-3 gap-3 text-xs text-gray-500">
      <span className="font-medium text-[#007AFF]">{toolLabel[activeTool]}</span>
      {selCount > 0 && (
        <span className="text-gray-700 font-medium">已选 {selCount} 个</span>
      )}
    </div>
  )
}
