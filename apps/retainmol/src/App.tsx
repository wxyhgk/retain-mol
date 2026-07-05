import { useEffect, useState } from 'react'
import Toolbar from '@/components/toolbar/Toolbar'
import ToolStrip from '@/components/toolbar/ToolStrip'
import {
  MolViewer, useMoleculeStore, useEditorStore, selectActiveMoleculeOrEmpty,
  useMoleculeTemporal, bondSelectedAtoms, parseClipboard, centerMolecule, getFragment, cn,
} from '@retainmol/mol-viewer'
import type { MolClipboard } from '@retainmol/mol-viewer'
import { RightPanel } from '@/components/panels'
import PubChemSearch from '@/components/search/PubChemSearch'
import { useStore } from 'zustand'

export default function App() {
  const { setActiveTool } = useEditorStore()
  const { addToScene } = useMoleculeStore()
  const { undo, redo } = useStore(useMoleculeTemporal)
  const [showInspector, setShowInspector] = useState(true)
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (!(e.metaKey || e.ctrlKey) || e.key !== 'c') return
      const st = useMoleculeStore.getState()
      const mol = selectActiveMoleculeOrEmpty(st)
      const { selectedAtomIds } = st
      if (selectedAtomIds.size === 0) return
      e.preventDefault()
      const selAtoms = mol.atoms.filter(a => selectedAtomIds.has(a.id))
      const idxMap = new Map(selAtoms.map((a, i) => [a.id, i]))
      const selBonds = mol.bonds.filter(b => idxMap.has(b.atomId1) && idxMap.has(b.atomId2))
      const cb: MolClipboard = {
        atoms: selAtoms.map(a => ({ symbol: a.symbol, x: a.x, y: a.y, z: a.z })),
        bonds: selBonds.map(b => ({ a: idxMap.get(b.atomId1)!, b: idxMap.get(b.atomId2)!, order: b.order, aromatic: b.aromatic })),
      }
      useEditorStore.getState().setClipboard(cb)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    const handler = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return
      const internalCb = useEditorStore.getState().clipboard
      if (internalCb) {
        e.preventDefault()
        const newIds = useMoleculeStore.getState().pasteAtoms(internalCb)
        useMoleculeStore.getState().selectAtoms(newIds, 'replace')
        return
      }
      const text = e.clipboardData?.getData('text')
      if (!text || text.length < 10) return
      try {
        const { format, molecule } = parseClipboard(text)
        addToScene(centerMolecule(molecule))
        e.preventDefault()
        console.log(`[paste] ${format.toUpperCase()} → ${molecule.atoms.length} atoms`)
      } catch { /* not a molecule */ }
    }
    window.addEventListener('paste', handler)
    return () => window.removeEventListener('paste', handler)
  }, [addToScene])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') { e.preventDefault(); undo(); return }
      if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) { e.preventDefault(); redo(); return }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(true); return }
      // S = 纯选择态；B = 恢复构建态（或选中两原子时成键）
      if (e.key === 's' || e.key === 'S') {
        setActiveTool('select')
        useEditorStore.getState().disarmBrush()
        return
      }
      if (e.key === 'v' || e.key === 'V') { setActiveTool('move-object'); return }
      if (e.key === 'm' || e.key === 'M') { setActiveTool('measure'); return }
      if (e.key === 'b' || e.key === 'B') {
        const { selectedAtomIds } = useMoleculeStore.getState()
        if (selectedAtomIds.size === 2) {
          const r = bondSelectedAtoms()
          if (!r.ok) useEditorStore.getState().flashHint(r.reason ?? '无法成键')
        } else {
          const ed = useEditorStore.getState()
          setActiveTool('select')
          ed.setActiveElement(ed.activeElement)   // 重新武装当前元素笔刷
        }
        return
      }
      if (e.key === 'Enter' && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
        const { activeTool, commitPendingMeasure } = useEditorStore.getState()
        if (activeTool === 'measure') { commitPendingMeasure(); return }
      }
      if (e.key === 'Escape') {
        const { activeTool, pendingAtomIds, cancelPendingMeasure } = useEditorStore.getState()
        if (activeTool === 'measure' && pendingAtomIds.length > 0) { cancelPendingMeasure(); return }
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const { selectedAtomIds, selectedBondIds, removeAtom, removeBond } = useMoleculeStore.getState()
        selectedBondIds.forEach(id => removeBond(id))
        selectedAtomIds.forEach(id => removeAtom(id))
        return
      }

      // H 键：给选中原子各加一个 H
      if ((e.key === 'h' || e.key === 'H') && !e.metaKey && !e.ctrlKey) {
        const { selectedAtomIds, addOneHydrogen, beginTransaction, endTransaction } = useMoleculeStore.getState()
        if (selectedAtomIds.size > 0) {
          e.preventDefault()
          beginTransaction()
          selectedAtomIds.forEach(id => addOneHydrogen(id))
          endTransaction()
        }
        return
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [setActiveTool, undo, redo])

  return (
    <div className="h-screen w-screen flex flex-col bg-[#EBEBEB] overflow-hidden">

      {/* ── 唯一一条顶栏 ── */}
      <Toolbar
        showInspector={showInspector}
        onToggleInspector={() => setShowInspector(v => !v)}
        onSearchOpen={() => setSearchOpen(true)}
      />
      <PubChemSearch open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* ── 画布层：填满剩余高度，所有浮动面板都是绝对定位的子元素 ── */}
      <div className="flex-1 relative overflow-hidden">

        {/* 画布本体 */}
        <div className="absolute inset-0">
          <MolViewer />
        </div>

        {/* 浮动左侧工具条 */}
        <div className="absolute left-3 top-3 z-10">
          <ToolStrip />
        </div>

        {/* 画布信息标签（分子名 + 分子式 + 选中计数） */}
        <CanvasLabel />

        {/* 浮动右侧 Inspector */}
        {showInspector && (
          <div className="absolute right-3 top-3 bottom-3 w-[300px] z-10 rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden flex flex-col">
            <RightPanel />
          </div>
        )}

        {/* 画布空状态 */}

        {/* 底部状态栏 */}
        <StatusBar />
      </div>
    </div>
  )
}

// ─── 分子式（C 优先，H 其次）───────────────────────────────────────────────
function computeFormula(atoms: readonly { symbol: string }[]): string {
  if (atoms.length === 0) return ''
  const counts: Record<string, number> = {}
  for (const a of atoms) counts[a.symbol] = (counts[a.symbol] || 0) + 1
  const priority = ['C', 'H']
  const keys = [...priority.filter(s => counts[s]), ...Object.keys(counts).filter(s => !priority.includes(s)).sort()]
  return keys.map(s => `${s}${counts[s] > 1 ? counts[s] : ''}`).join('')
}

// ─── 画布左上角信息标签 ─────────────────────────────────────────────────────
function CanvasLabel() {
  const molecule = useMoleculeStore(selectActiveMoleculeOrEmpty)
  const { selectedAtomIds, selectedBondIds } = useMoleculeStore()
  const formula = computeFormula(molecule.atoms)
  const selTotal = selectedAtomIds.size + selectedBondIds.size

  return (
    <div className="absolute left-[64px] top-4 z-10 flex items-center gap-1.5 select-none pointer-events-none">
      <span className="text-xs font-medium text-gray-700 bg-white/85 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm border border-gray-200/60">
        {molecule.name || 'New Molecule'}
      </span>
      {formula && (
        <span className="text-[11px] text-gray-500 font-mono bg-white/85 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm border border-gray-200/60">
          {formula}
        </span>
      )}
      {selTotal > 0 && (
        <span className="text-[11px] font-medium text-white bg-gray-900/80 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm">
          {selTotal} 已选
        </span>
      )}
    </div>
  )
}

// ─── 底部状态栏（弱化） ──────────────────────────────────────────────────────
function StatusBar() {
  const { activeTool, activeElement, activeFragmentId, brushArmed } = useEditorStore()
  const fragment = activeFragmentId ? getFragment(activeFragmentId) : undefined

  const toolLabel: Record<string, string> = {
    select: brushArmed
      ? (fragment
          ? `编辑  ·  ${fragment.name}（${fragment.short}）`
          : `编辑  ·  ${activeElement}`)
      : '选择',
    'move-object': '移动  ·  Alt + 拖拽 = 旋转',
    measure: '测量  ·  点击原子  ·  Enter 提交  ·  Esc 取消',
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 h-6 flex items-center px-3 text-[11px] text-gray-400 select-none pointer-events-none">
      {toolLabel[activeTool] ?? activeTool}
    </div>
  )
}
