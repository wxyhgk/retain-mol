import { useRef, useState, type ReactNode } from 'react'
import { Minus, Plus } from 'lucide-react'
import type { Atom } from '@retainmol/mol-viewer/core'
import { getElementConfig } from '@retainmol/mol-viewer/core'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function InspectorLayout({ children }: { children: ReactNode }) {
  return <div className="min-w-0 space-y-4 p-3 text-sm text-foreground">{children}</div>
}

export function InspectorSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="min-w-0 space-y-2">
      <div className="truncate text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground" title={title}>
        {title}
      </div>
      {children}
    </section>
  )
}

export function PropertyList({ children }: { children: ReactNode }) {
  return <div className="divide-y divide-border overflow-hidden rounded-md border border-border bg-background">{children}</div>
}

export function PropertyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-center gap-3 px-2.5 py-2">
      <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
      <span className="min-w-0 flex-1 break-words text-right font-mono text-xs text-foreground">{value}</span>
    </div>
  )
}

export function PropertyControlRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 items-center gap-3 px-2.5 py-1.5">
      <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
      <div className="ml-auto min-w-0">{children}</div>
    </div>
  )
}

export function IntegerStepper({
  value, min, max, format = String, onChange,
}: {
  value: number
  min: number
  max: number
  format?: (value: number) => string
  onChange: (value: number) => void
}) {
  return (
    <div className="grid h-7 grid-cols-[28px_minmax(36px,1fr)_28px] overflow-hidden rounded-md border border-border bg-white">
      <button type="button" title="减少" aria-label="减少" disabled={value <= min} onClick={() => onChange(value - 1)} className="flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-30">
        <Minus size={12} />
      </button>
      <span className="flex min-w-0 items-center justify-center border-x border-border px-1 font-mono text-[11px] tabular-nums text-foreground">{format(value)}</span>
      <button type="button" title="增加" aria-label="增加" disabled={value >= max} onClick={() => onChange(value + 1)} className="flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-30">
        <Plus size={12} />
      </button>
    </div>
  )
}

export function LabeledNumberInput({
  label, value, decimals, min, max, unit, onCommit,
}: {
  label: string
  value: number
  decimals: number
  min?: number
  max?: number
  unit?: string
  onCommit: (value: number) => void
}) {
  const formatValue = (next: number) => next.toFixed(decimals)
  const [draft, setDraft] = useState('')
  const [editing, setEditing] = useState(false)
  const cancelNextBlur = useRef(false)
  const commit = () => {
    if (cancelNextBlur.current) {
      cancelNextBlur.current = false
      setEditing(false)
      return
    }
    const next = Number(draft.trim())
    if (!Number.isFinite(next) || (min !== undefined && next < min) || (max !== undefined && next > max)) {
      setEditing(false)
      return
    }
    if (next !== value) onCommit(next)
    setEditing(false)
  }

  return (
    <label className="block min-w-0">
      <span className="mb-1 block truncate text-[10px] font-medium text-muted-foreground">{label}</span>
      <span className="flex h-8 min-w-0 items-center overflow-hidden rounded-md border border-border bg-background focus-within:border-ring focus-within:ring-1 focus-within:ring-ring">
        <input
          type="text" inputMode="decimal" aria-label={label} data-escape="cancel-edit"
          value={editing ? draft : formatValue(value)}
          onChange={event => setDraft(event.target.value)} onBlur={commit}
          onFocus={event => { setDraft(formatValue(value)); setEditing(true); event.currentTarget.select() }}
          onKeyDown={event => {
            if (event.key === 'Enter') { event.preventDefault(); event.currentTarget.blur() }
            else if (event.key === 'Escape') { event.preventDefault(); cancelNextBlur.current = true; event.currentTarget.blur() }
          }}
          className="h-full min-w-0 flex-1 bg-transparent px-2 font-mono text-[11px] tabular-nums text-foreground outline-none"
        />
        {unit && <span className="shrink-0 pr-2 text-[10px] text-muted-foreground">{unit}</span>}
      </span>
    </label>
  )
}

export function ActionButton({ icon, label, danger = false, className, title, disabled, onClick }: {
  icon: ReactNode
  label: string
  danger?: boolean
  className?: string
  title?: string
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <Button type="button" variant="outline" disabled={disabled} title={title ?? label} onClick={onClick} className={cn(
      'h-9 min-w-0 justify-center overflow-hidden rounded-md px-2 text-xs shadow-none',
      danger ? 'border-foreground bg-background text-foreground hover:bg-foreground hover:text-background' : 'border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground',
      className,
    )}>
      {icon}<span className="truncate">{label}</span>
    </Button>
  )
}

export function CountTile({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-md border border-border bg-background px-2.5 py-2.5">
      <span className="flex size-7 shrink-0 items-center justify-center rounded bg-background text-muted-foreground [&_svg]:size-3.5">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[10px] text-muted-foreground">{label}</span>
        <span className="block font-mono text-sm font-semibold tabular-nums text-foreground">{value}</span>
      </span>
    </div>
  )
}

export function EndpointBadge({ atom, number, compact = false }: { atom: Atom; number: number; compact?: boolean }) {
  return (
    <div className={cn('flex min-w-0 items-center gap-1.5 rounded-md border border-border bg-background', compact ? 'px-1.5 py-1' : 'flex-1 px-2 py-1.5')}>
      <ElementSwatch symbol={atom.symbol} />
      <span className="min-w-0 truncate text-xs font-medium text-foreground">{atom.symbol} <span className="font-normal text-muted-foreground">#{number}</span></span>
    </div>
  )
}

export function ElementSwatch({ symbol, size = 'sm' }: { symbol: string; size?: 'sm' | 'lg' }) {
  const element = getElementConfig(symbol)
  return (
    <span className={cn('flex shrink-0 items-center justify-center rounded-full font-bold text-white ring-1 ring-black/5', size === 'lg' ? 'size-9 text-xs' : 'size-5 text-[9px]')} style={{ backgroundColor: `#${element.color.toString(16).padStart(6, '0')}` }}>
      {symbol}
    </span>
  )
}
