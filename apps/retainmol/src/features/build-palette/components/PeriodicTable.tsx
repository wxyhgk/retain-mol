import { useState } from 'react'
import { Ellipsis } from 'lucide-react'
import { getElementConfig } from '@retainmol/mol-viewer/core'
import { cn } from '@/lib/utils'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { FULL_PERIODIC_TABLE_LAYOUT, QUICK_ELEMENTS } from '../domain/periodicTableLayout'

export { FULL_PERIODIC_TABLE_LAYOUT, QUICK_ELEMENTS }

interface PeriodicTableProps {
  activeElement: string
  onSelect: (symbol: string) => void
}

export function PeriodicTable({ activeElement, onSelect }: PeriodicTableProps) {
  return (
    <div className="overflow-x-auto px-2 py-4 sm:px-4 snap-x">
      <div className="mx-auto grid min-w-[680px] w-max max-w-[860px] grid-cols-[repeat(18,minmax(0,1fr))] gap-1 snap-x">
        {FULL_PERIODIC_TABLE_LAYOUT.flatMap((row, rowIndex) => row.map((symbol, colIndex) => {
          if (!symbol || symbol === '*') return <span key={`${rowIndex}-${colIndex}`} className="h-10 min-w-0" />
          return (
            <ElementCell
              key={`${symbol}-${rowIndex}-${colIndex}`}
              symbol={symbol}
              active={activeElement === symbol}
              onClick={() => onSelect(symbol)}
            />
          )
        }))}
      </div>
    </div>
  )
}

export function PeriodicTableSheet({ activeElement, onSelect }: PeriodicTableProps) {
  const [open, setOpen] = useState(false)
  const handleSelect = (symbol: string) => {
    onSelect(symbol)
    setOpen(false)
  }
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="打开完整周期表"
          title="完整周期表"
          className="flex size-7 items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:border-foreground hover:bg-accent hover:text-foreground"
        >
          <Ellipsis size={15} />
        </button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        aria-describedby="periodic-table-desc"
        overlayClassName="bg-black/15 backdrop-blur dark:bg-foreground/10"
        className="inset-x-0 bottom-0 mx-auto w-full max-w-[920px] max-h-[min(84dvh,640px)] overflow-y-auto rounded-t-xl border border-border bg-card p-0 pb-[env(safe-area-inset-bottom)] text-card-foreground shadow-[0_18px_50px_rgba(0,0,0,0.22)] gap-0"
      >
        <SheetHeader className="sticky top-0 z-10 border-b border-border bg-card px-4 py-3">
          <SheetTitle className="text-sm">元素库 · 周期表</SheetTitle>
          <SheetDescription id="periodic-table-desc" className="text-[10px]">选择元素后返回绘制面板，再选择原子替换或可用构型。</SheetDescription>
        </SheetHeader>
        <PeriodicTable activeElement={activeElement} onSelect={handleSelect} />
      </SheetContent>
    </Sheet>
  )
}

function ElementCell({ symbol, active, onClick }: { symbol: string; active: boolean; onClick: () => void }) {
  const element = getElementConfig(symbol)
  const configured = element.atomicNumber !== 0
  return (
    <button
      type="button"
      title={configured ? `${symbol} · ${element.name}` : symbol}
      aria-label={configured ? `${symbol} ${element.name}` : symbol}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'flex h-10 min-w-0 flex-col items-center justify-center rounded-[3px] border text-[10px] font-semibold leading-none transition-colors',
        active
          ? 'z-10 border-primary bg-primary text-primary-foreground shadow-[0_0_0_1px_currentColor]'
          : 'border-border bg-card text-card-foreground hover:z-10 hover:border-foreground hover:bg-accent',
      )}
    >
      <span>{symbol}</span>
      <span className={cn('mt-0.5 max-w-full truncate text-[7px] font-normal', active ? 'text-primary-foreground/65' : 'text-muted-foreground')}>
        {element.name}
      </span>
    </button>
  )
}

export function QuickElementButton({ symbol, active, onClick }: { symbol: string; active: boolean; onClick: () => void }) {
  const element = getElementConfig(symbol)
  return (
    <button
      type="button"
      title={`${symbol} · ${element.name}`}
      aria-label={`${symbol} ${element.name}`}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'flex h-12 min-w-0 flex-col items-center justify-center rounded-md border transition-colors',
        active ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-card-foreground hover:border-foreground hover:bg-accent',
      )}
    >
      <span className="text-[12px] font-bold leading-none">{symbol}</span>
      <span className={cn('mt-1 text-[8px]', active ? 'text-primary-foreground/65' : 'text-muted-foreground')}>{element.name}</span>
    </button>
  )
}

export function CompactElementButton({ symbol, active, onClick }: { symbol: string; active: boolean; onClick: () => void }) {
  const element = getElementConfig(symbol)
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      title={`${symbol} · ${element.name}`}
      className={cn(
        'flex h-7 min-w-7 items-center justify-center rounded-md border px-1.5 text-[11px] font-bold transition-colors',
        active ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-foreground hover:bg-accent',
      )}
    >
      {symbol}
    </button>
  )
}
