import { useState, useEffect, useRef, Fragment } from 'react'
import { MousePointer2, Pencil, Ruler, Move } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useEditorStore, getElementConfig, getFragment, FRAGMENTS, cn } from '@retainmol/mol-viewer'
import type { Tool } from '@retainmol/mol-viewer'

interface ToolButton {
  key: string
  icon: React.ReactNode
  label: string
  shortcut: string
  active: boolean
  onClick: () => void
  separatorBefore?: boolean
}

const COMMON_ELEMENTS = ['H','C','N','O','F','P','S','Cl','Br','I','Si','B'] as const

/** 画布左侧竖向工具条 */
export default function ToolStrip() {
  const { activeTool, setActiveTool, activeElement, setActiveElement,
          activeFragmentId, setActiveFragment, brushArmed, disarmBrush } = useEditorStore()
  const [pickerOpen, setPickerOpen] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  // 点击外部关闭
  useEffect(() => {
    if (!pickerOpen) return
    const handler = (e: PointerEvent) => {
      if (pickerRef.current?.contains(e.target as Node)) return
      setPickerOpen(false)
    }
    document.addEventListener('pointerdown', handler)
    return () => document.removeEventListener('pointerdown', handler)
  }, [pickerOpen])

  const activeFragment = activeFragmentId ? getFragment(activeFragmentId) : undefined
  const elCfg = getElementConfig(activeElement)
  const elHex = activeFragment ? '#6366f1' : `#${elCfg.color.toString(16).padStart(6, '0')}`

  // 选择 / 编辑是同一个指针工具的两个显式态，互斥高亮
  const TOOLS: ToolButton[] = [
    {
      key: 'select', icon: <MousePointer2 size={16} />, shortcut: 'S',
      label: '选择（点击/框选/拖动移动选中）',
      active: activeTool === 'select' && !brushArmed,
      onClick: () => { setActiveTool('select'); disarmBrush() },
    },
    {
      key: 'build', icon: <Pencil size={16} />, shortcut: 'B',
      label: '编辑（点 H 生长 · 双击空白加原子 · 拖 H 成键）',
      active: activeTool === 'select' && brushArmed,
      onClick: () => { setActiveTool('select'); setActiveElement(activeElement) },
    },
    {
      key: 'move-object', icon: <Move size={16} />, shortcut: 'V',
      label: '移动分子（Alt=旋转）',
      active: activeTool === 'move-object',
      onClick: () => setActiveTool('move-object' as Tool),
    },
    {
      key: 'measure', icon: <Ruler size={16} />, shortcut: 'M',
      label: '测量',
      active: activeTool === 'measure',
      onClick: () => setActiveTool('measure' as Tool),
      separatorBefore: true,
    },
  ]

  return (
    <TooltipProvider delayDuration={200}>
      <div className="w-11 flex flex-col items-center py-2 gap-0.5 bg-white rounded-xl border border-gray-200 shadow-md select-none">

        {/* ── 元素选择器 (第一位) ── */}
        <div className="relative" ref={pickerRef}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => {
                  // 未武装时点 chip 直接恢复构建态（免去重选元素）
                  if (!brushArmed) { setActiveElement(activeElement); setActiveTool('select') }
                  setPickerOpen(v => !v)
                }}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all hover:opacity-80"
                style={brushArmed ? {
                  background: `${elHex}22`,
                  color: elHex,
                  border: `1.5px solid ${elHex}66`,
                  boxShadow: pickerOpen ? `0 0 0 2px ${elHex}44` : `0 0 0 2px ${elHex}33`,
                } : {
                  background: '#f3f4f6',
                  color: '#9ca3af',
                  border: '1.5px solid #e5e7eb',
                }}
              >
                {activeFragment ? activeFragment.short : activeElement}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs bg-gray-800 text-white border-gray-700">
              {brushArmed
                ? (activeFragment ? `构建中 · ${activeFragment.name} · Esc 切回选择` : `构建中 · ${activeElement} · Esc 切回选择`)
                : '已暂停构建 · 点击恢复'}
            </TooltipContent>
          </Tooltip>

          {/* 元素气泡 */}
          {pickerOpen && (
            <div
              className="absolute left-full top-0 ml-2 z-50 bg-white border border-gray-200 rounded-xl shadow-xl p-2"
              style={{ minWidth: 190 }}
            >
              <div className="text-[10px] text-gray-400 mb-1.5 px-0.5">选择元素</div>
              <div className="grid grid-cols-4 gap-1">
                {COMMON_ELEMENTS.map(sym => {
                  const cfg = getElementConfig(sym)
                  const hex = `#${cfg.color.toString(16).padStart(6, '0')}`
                  const isActive = !activeFragment && activeElement === sym
                  return (
                    <button
                      key={sym}
                      onClick={() => { setActiveElement(sym); setActiveTool('select'); setPickerOpen(false) }}
                      className={cn(
                        'w-8 h-8 rounded-lg text-[11px] font-bold transition-all hover:scale-105 active:scale-95',
                      )}
                      style={{
                        background: isActive ? `${hex}33` : `${hex}11`,
                        color: hex,
                        border: `1.5px solid ${isActive ? hex : `${hex}44`}`,
                        boxShadow: isActive ? `0 0 0 2px ${hex}33` : undefined,
                      }}
                    >
                      {sym}
                    </button>
                  )
                })}
              </div>

              <div className="text-[10px] text-gray-400 mt-2.5 mb-1.5 px-0.5">片段 · 点空白放置 / 点原子接上 / 点键并环</div>
              <div className="grid grid-cols-2 gap-1">
                {FRAGMENTS.map(f => {
                  const isActive = activeFragmentId === f.id
                  return (
                    <button
                      key={f.id}
                      onClick={() => {
                        setActiveFragment(f.id)
                        setActiveTool('select')   // 片段在编辑工具下使用，顺手切回
                        setPickerOpen(false)
                      }}
                      className={cn(
                        'h-8 px-2 rounded-lg text-[11px] font-medium transition-all hover:scale-[1.03] active:scale-95',
                        'flex items-center justify-between gap-1',
                        isActive
                          ? 'bg-indigo-50 text-indigo-600 border-[1.5px] border-indigo-400 shadow-[0_0_0_2px_rgba(99,102,241,0.2)]'
                          : 'bg-gray-50 text-gray-600 border-[1.5px] border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <span>{f.name}</span>
                      <span className="text-[9px] opacity-60">{f.short}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* 分隔线 */}
        <div className="w-6 h-px bg-gray-200 my-1" />

        {/* ── 工具按钮 ── */}
        {TOOLS.map((t) => (
          <Fragment key={t.key}>
            {t.separatorBefore && (
              <div className="w-6 h-px bg-gray-200 my-1" />
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={t.onClick}
                  className={cn(
                    'w-9 h-9 rounded-lg flex items-center justify-center transition-all',
                    t.active
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
                  )}
                >
                  {t.icon}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs bg-gray-800 text-white border-gray-700">
                {t.label} <span className="opacity-60 ml-1">{t.shortcut}</span>
              </TooltipContent>
            </Tooltip>
          </Fragment>
        ))}
      </div>
    </TooltipProvider>
  )
}
