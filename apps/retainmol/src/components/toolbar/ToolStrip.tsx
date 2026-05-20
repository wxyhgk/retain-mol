import { useState, useEffect, useRef, Fragment } from 'react'
import { MousePointer2, Atom, Link2, Trash2, Ruler, Move } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useEditorStore, getElementConfig, cn } from '@retainmol/mol-viewer'
import type { Tool } from '@retainmol/mol-viewer'

const TOOLS: { id: Tool; icon: React.ReactNode; label: string; shortcut: string }[] = [
  { id: 'select',      icon: <MousePointer2 size={16} />, label: '选择',    shortcut: 'S' },
  { id: 'move-object', icon: <Move size={16} />,          label: '移动分子（Alt=旋转）', shortcut: 'V' },
  { id: 'add-atom',    icon: <Atom size={16} />,          label: '添加原子', shortcut: 'A' },
  { id: 'add-bond',    icon: <Link2 size={16} />,         label: '添加键',   shortcut: 'B' },
  { id: 'delete',      icon: <Trash2 size={16} />,        label: '删除',     shortcut: 'D' },
  { id: 'measure',     icon: <Ruler size={16} />,         label: '测量',     shortcut: 'M' },
]

const COMMON_ELEMENTS = ['H','C','N','O','F','P','S','Cl','Br','I','Si','B'] as const

/** 画布左侧竖向工具条 */
export default function ToolStrip() {
  const { activeTool, setActiveTool, activeElement, setActiveElement } = useEditorStore()
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

  const elCfg = getElementConfig(activeElement)
  const elHex = `#${elCfg.color.toString(16).padStart(6, '0')}`

  return (
    <TooltipProvider delayDuration={200}>
      <div className="w-11 shrink-0 flex flex-col items-center py-2 gap-0.5 bg-white border-r border-gray-200 select-none">

        {/* ── 元素选择器 (第一位) ── */}
        <div className="relative" ref={pickerRef}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setPickerOpen(v => !v)}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-[11px] font-bold transition-all hover:opacity-80"
                style={{
                  background: `${elHex}22`,
                  color: elHex,
                  border: `1.5px solid ${elHex}66`,
                  boxShadow: pickerOpen ? `0 0 0 2px ${elHex}44` : undefined,
                }}
              >
                {activeElement}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs bg-gray-800 text-white border-gray-700">
              当前元素 · 点击切换
            </TooltipContent>
          </Tooltip>

          {/* 元素气泡 */}
          {pickerOpen && (
            <div
              className="absolute left-full top-0 ml-2 z-50 bg-white border border-gray-200 rounded-xl shadow-xl p-2"
              style={{ minWidth: 152 }}
            >
              <div className="text-[10px] text-gray-400 mb-1.5 px-0.5">选择元素</div>
              <div className="grid grid-cols-4 gap-1">
                {COMMON_ELEMENTS.map(sym => {
                  const cfg = getElementConfig(sym)
                  const hex = `#${cfg.color.toString(16).padStart(6, '0')}`
                  const isActive = activeElement === sym
                  return (
                    <button
                      key={sym}
                      onClick={() => { setActiveElement(sym); setPickerOpen(false) }}
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
            </div>
          )}
        </div>

        {/* 分隔线 */}
        <div className="w-6 h-px bg-gray-200 my-1" />

        {/* ── 工具按钮 ── */}
        {TOOLS.map((t) => (
          <Fragment key={t.id}>
            {t.id === 'delete' && (
              <div className="w-6 h-px bg-gray-200 my-1" />
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setActiveTool(t.id)}
                  className={cn(
                    'w-9 h-9 rounded-lg flex items-center justify-center transition-all',
                    activeTool === t.id
                      ? 'bg-[#007AFF]/10 text-[#007AFF]'
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
