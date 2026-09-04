import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface PopoverPanelProps {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  side?: 'left' | 'right'
  width?: number
  children: React.ReactNode
}

export function PopoverPanel({ open, onClose, title, subtitle, side = 'left', width = 360, children }: PopoverPanelProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      const el = ref.current
      if (!el) return
      if (!el.contains(e.target as Node)) onClose()
    }
    const t = window.setTimeout(() => window.addEventListener('mousedown', onDown), 0)
    return () => {
      window.clearTimeout(t)
      window.removeEventListener('mousedown', onDown)
    }
  }, [open, onClose])

  if (!open) return null

  const posClass = side === 'left' ? 'left-[68px]' : 'right-[60px]'

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label={title}
      aria-modal={false}
      className={`absolute top-3 bottom-3 z-30 flex flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-2xl ${posClass}`}
      style={{ width }}
    >
      <div className="flex h-9 shrink-0 items-center justify-between border-b border-border bg-muted/40 px-3">
        <div className="min-w-0">
          <div className="text-xs font-semibold leading-none">{title}</div>
          {subtitle && <div className="text-[10px] text-muted-foreground leading-none mt-1">{subtitle}</div>}
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={onClose} aria-label={`关闭 ${title}`}>
          <X size={14} />
        </Button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-3 [scrollbar-width:thin]">{children}</div>
    </div>
  )
}
