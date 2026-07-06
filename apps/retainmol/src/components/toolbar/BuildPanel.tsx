import type { CSSProperties } from 'react'
import { useEditorStore, getElementConfig, COMMON_ELEMENT_SYMBOLS, PERIODIC_TABLE_LAYOUT, FRAGMENTS, cn } from '@retainmol/mol-viewer'
import { X } from 'lucide-react'

const COMMON = new Set<string>(COMMON_ELEMENT_SYMBOLS)
const hex = (n: number) => '#' + n.toString(16).padStart(6, '0')

/**
 * 构建面板（GaussView 式）：整张周期表选元素 + 选中元素的片段条。
 * 从工具栏元素类打开的浮层，替代原来挤在小气泡里的元素+片段网格。
 * 只驱动 editorStore 的笔刷状态（activeElement / activeFragmentId），放置逻辑在 useBuilder。
 */
export default function BuildPanel({ onClose }: { onClose: () => void }) {
  const { activeElement, activeFragmentId, setActiveElement, setActiveFragment, setActiveTool } = useEditorStore()

  // 展示哪个元素的片段：以 activeElement 为上下文（选片段不改 activeElement，故并环时仍显示其片段）
  const shownEl = activeElement
  const elFragments = FRAGMENTS.filter(f => f.atoms[f.attachIndex]?.symbol === shownEl)

  // 点周期表元素：设单原子笔刷 + 更新片段条，面板保持打开
  const pickElement = (sym: string) => { setActiveElement(sym); setActiveTool('select') }
  // 点「单原子」/片段：设笔刷并关闭，回去搭建
  const pickAtom = () => { setActiveElement(shownEl); setActiveTool('select'); onClose() }
  const pickFragment = (id: string) => { setActiveFragment(id); setActiveTool('select'); onClose() }

  const shownCfg = getElementConfig(shownEl)
  const shownHex = hex(shownCfg.color)

  return (
    <div
      className="absolute left-full top-8 ml-2 z-50 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden select-none"
      style={{ width: 588 }}
    >
      {/* 标题栏 */}
      <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-gray-100">
        <span className="text-[13px] font-semibold text-gray-800">元素 / 片段</span>
        <span className="text-[11px] text-gray-400 ml-auto mr-1">当前笔刷 · {activeElement}</span>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors" aria-label="关闭">
          <X size={15} />
        </button>
      </div>

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
          选择 <span className="font-semibold" style={{ color: shownHex }}>{shownEl}</span> 片段 · 点空白放置 / 点原子接上 / 点键并环
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
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 min-w-[56px] h-[52px] px-2.5 rounded-[10px] transition-all hover:scale-[1.03] active:scale-95',
                  isActive
                    ? 'bg-indigo-50 border-[1.5px] border-indigo-400 shadow-[0_0_0_2px_rgba(99,102,241,0.2)]'
                    : 'bg-gray-50 border-[1.5px] border-gray-200 hover:border-gray-300'
                )}
              >
                <span className={cn('text-[12px] font-semibold', isActive ? 'text-indigo-600' : 'text-gray-600')}>{f.name}</span>
                <span className={cn('text-[11px]', isActive ? 'text-indigo-400' : 'text-gray-400')}>{f.short}</span>
              </button>
            )
          })}
          {elFragments.length === 0 && (
            <div className="flex items-center text-[11px] text-gray-300 px-2 h-[52px]">该元素暂无预设片段</div>
          )}
        </div>
      </div>
    </div>
  )
}
