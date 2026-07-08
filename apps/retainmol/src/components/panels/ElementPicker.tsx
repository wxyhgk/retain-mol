import { useState } from 'react'
import { useMoleculeStore, useEditorStore } from '@/domain/viewerAdapter'
import {
  getElementConfig as getElement,
  COMMON_ELEMENT_SYMBOLS as COMMON_ELEMENTS,
  PERIODIC_TABLE_LAYOUT as PERIODIC_TABLE,
} from '@retainmol/mol-viewer/core'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

function colorHexToCss(hex: number) {
  return `#${hex.toString(16).padStart(6, '0')}`
}

function ElementButton({ sym, size = 'md', onSelect, activeElement }: {
  sym: string
  size?: 'sm' | 'md'
  onSelect: (sym: string) => void
  activeElement: string
}) {
  const el = getElement(sym)
  const isActive = activeElement === sym
  const sizeClass = size === 'sm' ? 'w-8 h-8 text-[9px]' : 'w-10 h-10 text-xs'

  return (
    <button
      onClick={() => onSelect(sym)}
      title={`${el.name} (${sym})`}
      className={cn(
        'relative rounded-lg font-bold border-2 transition-all flex flex-col items-center justify-center leading-none',
        sizeClass,
        isActive
          ? 'bg-gray-100 border-gray-900 text-gray-900 shadow-sm scale-105'
          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 hover:scale-105'
      )}
    >
      {/* CPK 色点：右上角小圆点，保留化学识别性但不影响整体风格 */}
      <span
        className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full"
        style={{ background: colorHexToCss(el.color) }}
      />
      <span>{sym}</span>
      {size === 'md' && <span className="text-[8px] font-normal opacity-50 mt-0.5">{el.atomicNumber}</span>}
    </button>
  )
}

export default function ElementPicker() {
  const { activeElement, setActiveElement } = useEditorStore()
  const { selectedAtomIds, replaceAtom } = useMoleculeStore()
  const [open, setOpen] = useState(false)
  const el = getElement(activeElement)
  const hasSelection = selectedAtomIds.size > 0

  // 点击元素：有选中原子则替换，否则只切换当前元素
  const handleSelectElement = (sym: string) => {
    if (hasSelection) {
      selectedAtomIds.forEach(id => replaceAtom(id, sym))
    }
    setActiveElement(sym)
    setOpen(false)
  }

  return (
    <div className="p-3 space-y-3">
      {/* 当前元素 */}
      <div className="flex items-center gap-3">
        <div className="relative w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold border-2 border-gray-900 bg-gray-100 text-gray-900 shrink-0">
          <span
            className="absolute top-1 right-1 w-2 h-2 rounded-full"
            style={{ background: colorHexToCss(el.color) }}
          />
          {el.symbol}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-gray-800">{el.name}</div>
          <div className="text-xs text-gray-400 mt-0.5">Z = {el.atomicNumber}  ·  M = {el.atomicMass}</div>
        </div>
      </div>

      {/* 有选中原子时的提示 */}
      {hasSelection && (
        <div className="text-[11px] text-gray-700 bg-gray-100 border border-gray-200 rounded-lg px-2 py-1.5">
          点击元素将替换 {selectedAtomIds.size} 个选中原子
        </div>
      )}

      {/* 常用元素 */}
      <div className="flex flex-wrap gap-1.5">
        {COMMON_ELEMENTS.map(sym => (
          <ElementButton key={sym} sym={sym} size="sm" onSelect={handleSelectElement} activeElement={activeElement} />
        ))}
      </div>

      {/* 打开完整周期表 */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button className="w-full mt-1 py-1.5 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            完整元素周期表 →
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-gray-800">元素周期表</DialogTitle>
          </DialogHeader>
          <div className="overflow-x-auto pb-2">
            <div className="space-y-1 min-w-max">
              {PERIODIC_TABLE.map((row, ri) => (
                <div key={ri} className="flex gap-1">
                  {row.map((sym, ci) => {
                    if (!sym) return <div key={`${ri}-${ci}`} className="w-8 h-8" />
                    if (sym === '*') return (
                      <div key={`${ri}-${ci}`} className="w-8 h-8 flex items-center justify-center text-[9px] text-gray-400">*</div>
                    )
                    return (
                      <ElementButton key={sym} sym={sym} size="sm" onSelect={handleSelectElement} activeElement={activeElement} />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-2 p-2 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-lg flex items-center justify-center font-bold border-2 border-gray-900 bg-gray-100 text-gray-900 shrink-0">
              <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full" style={{ background: colorHexToCss(el.color) }} />
              {el.symbol}
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-semibold text-gray-800">{el.name}</span>
              <span className="mx-2 text-gray-300">|</span>
              Z = {el.atomicNumber}
              <span className="mx-2 text-gray-300">|</span>
              M = {el.atomicMass} g/mol
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
