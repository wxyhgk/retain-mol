import { useState } from 'react'
import type { CSSProperties } from 'react'
import { useEditorStore, useMoleculeStore } from '@/domain/viewerAdapter'
import { getElementConfig, PERIODIC_TABLE_LAYOUT } from '@retainmol/mol-viewer/core'
import {
  COMMON_ELEMENTS,
  HYBRID_GROUP_LABEL,
  RING_FRAGMENTS,
  TEMPLATE_MOLECULES,
  getElementHex,
  getHybridFragmentsForElement,
  setCenteredMolecule,
  splitTemplateName,
  type TemplateMolecule,
} from '@/domain/buildTools'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

type PanelTab = 'build' | 'rings' | 'templates'

/**
 * 构建面板（ChemDraw 式）：停靠在左侧的常驻工具抽屉，三个 tab —
 *  · 元素/片段：整张周期表选元素 + 选中元素的杂化桩条（驱动 editorStore 笔刷）
 *  · 环系    ：苯/环己烷… 点空白放环、点键并环、点原子接上
 *  · 模板分子：整分子模板（水/甲烷/苯…），点击直接替换当前分子
 * 由左工具条元素 chip 切换开关（uiStore）；放置分子后不关闭 —— 可连续搭建。
 */
export default function BuildPanel({ onClose }: { onClose: () => void }) {
  const { activeElement, activeFragmentId, setActiveElement, setAtomClickMode, setActiveFragment, setActiveTool } = useEditorStore()
  const { setMolecule } = useMoleculeStore()

  const [tab, setTab] = useState<PanelTab>('build')

  // 展示哪个元素的片段：以 activeElement 为上下文（选片段不改 activeElement，故并环时仍显示其片段）
  const shownEl = activeElement
  const elFragments = getHybridFragmentsForElement(shownEl)

  // 面板里点元素只切换为原子替换笔刷；实际替换发生在下一次点画布原子时。
  const applyAtom = (sym: string) => {
    setAtomClickMode('replace')
    setActiveElement(sym)
    setActiveTool('select')
  }
  const pickElement = (sym: string) => applyAtom(sym)
  const pickAtom = () => applyAtom(shownEl)
  const pickFragment = (id: string) => { setActiveFragment(id); setActiveTool('select') }
  const pickTemplate = (mol: TemplateMolecule) => {
    setCenteredMolecule(setMolecule, mol)
  }

  const shownHex = getElementHex(shownEl)
  const tabs: { id: PanelTab; label: string }[] = [
    { id: 'build', label: '元素' },
    { id: 'rings', label: '环系' },
    { id: 'templates', label: '模板' },
  ]
  const title = tab === 'build' ? '元素' : tab === 'rings' ? '环系片段' : '模板分子'
  const subtitle = tab === 'build'
    ? '选元素替换 · 选杂化桩构建键'
    : tab === 'rings'
      ? '点空白放环 · 点键并环 · 点原子接上'
      : '点击后替换当前画布'

  return (
    <div className="w-full h-full bg-white/95 border border-gray-200 rounded-xl shadow-xl overflow-hidden select-none backdrop-blur flex">
      <div className="w-[74px] shrink-0 border-r border-gray-100 bg-gray-50/80 p-2 flex flex-col">
        <div className="mb-2">
          <div className="text-[11px] font-semibold text-gray-500 px-1">构建</div>
          <div
            className="mt-1 flex h-9 items-center justify-center rounded-lg text-[11px] font-bold"
            style={{
              background: `${activeFragmentId ? '#6366f1' : shownHex}18`,
              color: activeFragmentId ? '#6366f1' : shownHex,
              border: `1px solid ${activeFragmentId ? '#6366f155' : `${shownHex}55`}`,
            }}
            title={activeFragmentId ? '当前笔刷 · 片段' : `当前笔刷 · ${activeElement}`}
          >
            {activeFragmentId ? '片段' : activeElement}
          </div>
        </div>

        <div className="space-y-1">
          {tabs.map(item => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={cn(
                'w-full h-9 rounded-lg text-[12px] font-semibold transition-all',
                tab === item.id
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'text-gray-500 hover:bg-white hover:text-gray-800'
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-auto h-8 w-full rounded-lg text-gray-400 hover:bg-white hover:text-gray-700 transition-colors"
          aria-label="关闭"
          title="关闭构建面板"
        >
          <X size={15} className="mx-auto" />
        </button>
      </div>

      <div className="min-w-0 flex-1 flex flex-col">
        <div className="px-3 py-2.5 border-b border-gray-100">
          <div className="text-[13px] font-semibold text-gray-900 leading-none">{title}</div>
          <div className="mt-1 text-[11px] text-gray-400">{subtitle}</div>
        </div>

        <div className="flex-1 overflow-y-auto">
        {tab === 'build' ? (
          <>
          {/* 周期表 */}
          <div className="px-3 pt-3 pb-1.5 flex flex-col gap-px">
            {PERIODIC_TABLE_LAYOUT.map((row, ri) => (
              <div key={ri} className="flex gap-px">
                {row.map((sym, ci) => {
                  if (!sym || sym === '*') return <div key={ci} className="w-[17px] h-[19px] shrink-0" />
                  const cfg = getElementConfig(sym)
                  const configured = cfg.atomicNumber !== 0
                  const c = getElementHex(sym)
                  const isSel = !activeFragmentId && activeElement === sym
                  const isCtx = activeElement === sym
                  const common = COMMON_ELEMENTS.has(sym)
                  const style: CSSProperties = isSel || isCtx
                    ? { background: `${c}26`, color: c, border: `1.5px solid ${c}`, boxShadow: `0 0 0 2px ${c}33` }
                    : common
                      ? { background: `${c}14`, color: c, border: `1px solid ${c}40` }
                      : configured
                        ? { background: `${c}0d`, color: `${c}cc`, border: `1px solid ${c}26` }
                        : { background: '#fafafa', color: '#b8bcc2', border: '1px solid #eef0f2' }
                  return (
                    <button
                      key={ci}
                      onClick={() => pickElement(sym)}
                      className="w-[17px] h-[19px] shrink-0 rounded text-[9px] font-medium leading-none p-0 transition-all hover:scale-105 active:scale-95"
                      style={style}
                      title={configured ? `${sym} · ${cfg.name}` : sym}
                    >
                      {sym}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>

          {/* 片段条 */}
          <div className="px-3 pt-1.5 pb-4">
            <div className="text-[11px] text-gray-400 my-2 px-0.5">
              <span className="font-semibold" style={{ color: shownHex }}>{shownEl}</span> 原子替换 · 杂化桩接单·双·三键
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {/* 单原子 */}
              <button
                onClick={pickAtom}
                title={`${shownEl} 原子替换`}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 min-w-[56px] h-[52px] px-2.5 rounded-[10px] transition-all hover:scale-[1.03] active:scale-95',
                )}
                style={{ background: `${shownHex}1a`, border: `1.5px solid ${shownHex}66` }}
              >
                <span className="text-[12px] font-semibold" style={{ color: shownHex }}>原子</span>
                <span className="text-[11px]" style={{ color: shownHex, opacity: 0.8 }}>{shownEl}</span>
              </button>

              {/* 该元素的片段 */}
              {elFragments.map(f => {
                const isActive = activeFragmentId === f.id
                return (
                  <button
                    key={f.id}
                    onClick={() => pickFragment(f.id)}
                    title={f.name}
                    className={cn(
                      'flex flex-col items-center justify-center gap-0.5 min-w-[56px] h-[54px] px-2.5 rounded-[10px] transition-all hover:scale-[1.03] active:scale-95',
                      isActive
                        ? 'bg-indigo-50 border-[1.5px] border-indigo-400 shadow-[0_0_0_2px_rgba(99,102,241,0.2)]'
                        : 'bg-gray-50 border-[1.5px] border-gray-200 hover:border-gray-300'
                    )}
                  >
                    {f.group && <span className={cn('text-[9px] leading-none', isActive ? 'text-indigo-400' : 'text-gray-400')}>{HYBRID_GROUP_LABEL[f.group]}</span>}
                    <span className={cn('text-[16px] font-semibold leading-none tracking-tight', isActive ? 'text-indigo-600' : 'text-gray-700')}>{f.short}</span>
                  </button>
                )
              })}
              {elFragments.length === 0 && (
                <div className="flex items-center text-[11px] text-gray-300 px-2 h-[52px]">该元素暂无预设片段</div>
              )}
            </div>
          </div>
          </>
        ) : tab === 'rings' ? (
          /* 环系 tab */
          <div className="px-3 pt-3 pb-4">
            <div className="grid grid-cols-2 gap-1.5">
              {RING_FRAGMENTS.map(f => {
                const isActive = activeFragmentId === f.id
                return (
                  <button
                    key={f.id}
                    onClick={() => pickFragment(f.id)}
                    title={f.name}
                    className={cn(
                      'flex flex-col items-center justify-center gap-0.5 h-[56px] px-2 rounded-[10px] transition-all hover:scale-[1.03] active:scale-95',
                      isActive
                        ? 'bg-indigo-50 border-[1.5px] border-indigo-400 shadow-[0_0_0_2px_rgba(99,102,241,0.2)]'
                        : 'bg-gray-50 border-[1.5px] border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <span className={cn('text-[12px] font-semibold leading-tight text-center', isActive ? 'text-indigo-600' : 'text-gray-700')}>{f.name}</span>
                    <span className={cn('text-[10px] leading-none', isActive ? 'text-indigo-400' : 'text-gray-400')}>{f.formula}</span>
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          /* 模板分子 tab */
          <div className="px-3 pt-3 pb-4">
            <div className="grid grid-cols-2 gap-1.5">
              {TEMPLATE_MOLECULES.map(s => {
                const { main, sub } = splitTemplateName(s.name)
                return (
                  <button
                    key={s.name}
                    onClick={() => pickTemplate(s.mol())}
                    className="flex flex-col items-center justify-center gap-0.5 h-[54px] px-2 rounded-[10px] bg-gray-50 border-[1.5px] border-gray-200 hover:border-gray-300 hover:bg-gray-100 transition-all hover:scale-[1.03] active:scale-95"
                  >
                    <span className="text-[12px] font-semibold text-gray-700 leading-tight">{main}</span>
                    {sub && <span className="text-[11px] text-gray-400 leading-none">{sub}</span>}
                  </button>
                )
              })}
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
