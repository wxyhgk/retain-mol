import { useState, useEffect, useRef, Fragment } from 'react'
import { MousePointer2, Pencil, Ruler, Move } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useEditorStore, getElementConfig, getFragment, cn } from '@retainmol/mol-viewer'
import type { Tool } from '@retainmol/mol-viewer'
import BuildPanel from './BuildPanel'

interface ToolButton {
  key: string
  icon: React.ReactNode
  label: string
  shortcut: string
  active: boolean
  onClick: () => void
  separatorBefore?: boolean
}

/** 画布左侧竖向工具条 */
export default function ToolStrip() {
  const { activeTool, setActiveTool, activeElement,
          activeFragmentId, brushArmed, armBrush, disarmBrush } = useEditorStore()
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
      onClick: () => { setActiveTool('select'); armBrush() },
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
                  // 未武装时点 chip 直接恢复构建态（armBrush 不清片段笔刷，保留上次的笔刷）
                  if (!brushArmed) { armBrush(); setActiveTool('select') }
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

          {/* 构建面板（周期表 + 片段条） */}
          {pickerOpen && <BuildPanel onClose={() => setPickerOpen(false)} />}
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
