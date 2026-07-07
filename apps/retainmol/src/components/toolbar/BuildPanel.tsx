import { useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { useEditorStore, useMoleculeStore, getElementConfig, centerMolecule, COMMON_ELEMENT_SYMBOLS, PERIODIC_TABLE_LAYOUT, FRAGMENTS, SAMPLE_MOLECULES, cn } from '@retainmol/mol-viewer'
import { X, GripVertical } from 'lucide-react'

const COMMON = new Set<string>(COMMON_ELEMENT_SYMBOLS)
const hex = (n: number) => '#' + n.toString(16).padStart(6, '0')

// 元素条只放杂化桩（GaussView Element Fragments 式），按 sp3 · sp2 · sp 排
const HYB_GROUPS = new Set(['sp3', 'sp2', 'sp'])
const GROUP_ORDER: Record<string, number> = { sp3: 0, sp2: 1, sp: 2 }
const GROUP_LABEL: Record<string, string> = { sp3: 'sp³', sp2: 'sp²', sp: 'sp' }

// 环系片段（group === 'ring'）——独立 tab，不混进元素杂化条
const RINGS = FRAGMENTS.filter(f => f.group === 'ring')

type PanelTab = 'build' | 'rings' | 'templates'

/**
 * 构建面板（GaussView 式）：可拖动浮层，三个 tab —
 *  · 元素/片段：整张周期表选元素 + 选中元素的杂化桩条（驱动 editorStore 笔刷）
 *  · 环系    ：苯/环己烷… 点空白放环、点键并环、点原子接上
 *  · 模板分子：整分子模板（水/甲烷/苯…），点击直接替换当前分子
 * 从工具栏元素 chip 打开；放置逻辑在 useBuilder。
 */
export default function BuildPanel({ onClose }: { onClose: () => void }) {
  const { activeElement, activeFragmentId, setActiveElement, setActiveFragment, setActiveTool } = useEditorStore()
  const { setMolecule } = useMoleculeStore()

  const [tab, setTab] = useState<PanelTab>('build')

  // 拖动：标题栏抓手拖动整个面板（相对初始锚点的位移）
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const dragRef = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null)
  const startDrag = (e: React.PointerEvent) => {
    dragRef.current = { sx: e.clientX, sy: e.clientY, ox: offset.x, oy: offset.y }
    const move = (ev: PointerEvent) => {
      const d = dragRef.current
      if (!d) return
      setOffset({ x: d.ox + ev.clientX - d.sx, y: d.oy + ev.clientY - d.sy })
    }
    const up = () => {
      dragRef.current = null
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  // 展示哪个元素的片段：以 activeElement 为上下文（选片段不改 activeElement，故并环时仍显示其片段）
  const shownEl = activeElement
  const elFragments = FRAGMENTS
    .filter(f => f.atoms[f.attachIndex]?.symbol === shownEl && HYB_GROUPS.has(f.group ?? ''))
    .sort((a, b) => (GROUP_ORDER[a.group ?? ''] ?? 9) - (GROUP_ORDER[b.group ?? ''] ?? 9))

  // 点周期表元素：设单原子笔刷 + 更新片段条，面板保持打开
  const pickElement = (sym: string) => { setActiveElement(sym); setActiveTool('select') }
  // 点「单原子」/片段：设笔刷并关闭，回去搭建
  const pickAtom = () => { setActiveElement(shownEl); setActiveTool('select'); onClose() }
  const pickFragment = (id: string) => { setActiveFragment(id); setActiveTool('select'); onClose() }
  // 点模板分子：整分子替换当前分子并关闭
  const pickTemplate = (mol: ReturnType<typeof SAMPLE_MOLECULES[number]['mol']>) => {
    setMolecule(centerMolecule(mol)); onClose()
  }

  const shownCfg = getElementConfig(shownEl)
  const shownHex = hex(shownCfg.color)

  return (
    <div
      className="absolute left-full top-8 ml-2 z-50 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden select-none"
      style={{ width: 588, transform: `translate(${offset.x}px, ${offset.y}px)` }}
    >
      {/* 标题栏（抓手区 = 拖动手柄；tab 与关闭按钮不触发拖动） */}
      <div className="flex items-center gap-2 px-2.5 py-2 border-b border-gray-100">
        <div
          onPointerDown={startDrag}
          className="flex items-center gap-1 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing pr-1"
          title="拖动移动面板"
        >
          <GripVertical size={14} />
        </div>
        {/* tab 切换 */}
        <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5">
          {([['build', '元素 / 片段'], ['rings', '环系'], ['templates', '模板分子']] as [PanelTab, string][]).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={cn(
                'px-3 py-1 rounded-md text-[12px] font-medium transition-all',
                tab === k ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <span className="text-[11px] text-gray-400 ml-auto mr-1">当前笔刷 · {activeFragmentId ? '片段' : activeElement}</span>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors" aria-label="关闭">
          <X size={15} />
        </button>
      </div>

      {tab === 'build' ? (
        <>
          {/* 周期表 */}
          <div className="px-3.5 pt-3.5 pb-1.5 flex flex-col gap-[3px]">
            {PERIODIC_TABLE_LAYOUT.map((row, ri) => (
              <div key={ri} className="flex gap-[3px]">
                {row.map((sym, ci) => {
                  if (!sym || sym === '*') return <div key={ci} className="w-[28px] h-[24px] shrink-0" />
                  const cfg = getElementConfig(sym)
                  const configured = cfg.atomicNumber !== 0
                  const c = hex(cfg.color)
                  const isSel = !activeFragmentId && activeElement === sym
                  const isCtx = activeElement === sym
                  const common = COMMON.has(sym)
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
                      className="w-[28px] h-[24px] shrink-0 rounded-md text-[11px] font-medium leading-none p-0 transition-all hover:scale-105 active:scale-95"
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
          <div className="px-3.5 pt-1.5 pb-4">
            <div className="text-[11px] text-gray-400 my-2 px-0.5">
              <span className="font-semibold" style={{ color: shownHex }}>{shownEl}</span> 杂化桩 · 点空白放原子 / 点已有原子按杂化接单·双·三键
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {/* 单原子 */}
              <button
                onClick={pickAtom}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 min-w-[56px] h-[52px] px-2.5 rounded-[10px] transition-all hover:scale-[1.03] active:scale-95',
                )}
                style={{ background: `${shownHex}1a`, border: `1.5px solid ${shownHex}66` }}
              >
                <span className="text-[12px] font-semibold" style={{ color: shownHex }}>单原子</span>
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
                    {f.group && <span className={cn('text-[9px] leading-none', isActive ? 'text-indigo-400' : 'text-gray-400')}>{GROUP_LABEL[f.group]}</span>}
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
        <div className="px-3.5 pt-3.5 pb-4">
          <div className="text-[11px] text-gray-400 mb-2.5 px-0.5">选环片段 · 点空白放环 / 点键并环 / 点原子接上</div>
          <div className="grid grid-cols-3 gap-1.5">
            {RINGS.map(f => {
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
        <div className="px-3.5 pt-3.5 pb-4">
          <div className="text-[11px] text-gray-400 mb-2.5 px-0.5">点击模板分子 · 替换当前画布</div>
          <div className="grid grid-cols-3 gap-1.5">
            {SAMPLE_MOLECULES.map(s => {
              // 名称形如 "水 (H₂O)" → 拆成主名 + 分子式副标
              const m = s.name.match(/^(.*?)\s*\((.+)\)\s*$/)
              const main = m ? m[1] : s.name
              const sub = m ? m[2] : ''
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
  )
}
