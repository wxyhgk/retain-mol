import { useRef, useState } from 'react'
import { Maximize2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function MiniPreview({
  title,
  onExpand,
  onClose,
  children,
  defaultPos = { x: 16, y: 16 },
  defaultSize = { w: 360, h: 260 },
}: {
  title: string
  onExpand: () => void
  onClose?: () => void
  children: React.ReactNode
  defaultPos?: { x: number; y: number }
  defaultSize?: { w: number; h: number }
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState(defaultPos)
  const [size] = useState(defaultSize)
  const dragRef = useRef<{ dx: number; dy: number } | null>(null)

  const onPointerDown = (e: React.PointerEvent) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    dragRef.current = { dx: e.clientX - rect.left, dy: e.clientY - rect.top }
    ;(e.target as Element).setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return
    let x = e.clientX - dragRef.current.dx
    let y = e.clientY - dragRef.current.dy
    const vw = window.innerWidth
    const vh = window.innerHeight
    x = Math.max(8, Math.min(vw - size.w - 72, x))
    y = Math.max(56, Math.min(vh - size.h - 12, y))
    setPos({ x, y })
  }
  const onPointerUp = (e: React.PointerEvent) => {
    dragRef.current = null
    try { (e.target as Element).releasePointerCapture(e.pointerId) } catch { /* capture may already be released */ }
  }

  return (
    <div
      ref={ref}
      className="absolute z-[6] flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl"
      style={{ left: pos.x, top: pos.y, width: size.w, height: size.h }}
    >
      <div
        className="flex h-8 shrink-0 cursor-grab select-none items-center justify-between border-b border-border bg-muted/50 px-2 active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <div className="text-xs font-semibold">{title}</div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onExpand} aria-label="切换到主画布">
            <Maximize2 size={13} />
          </Button>
          {onClose && (
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose} aria-label="关闭预览">
              <X size={13} />
            </Button>
          )}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden bg-white">{children}</div>
    </div>
  )
}
