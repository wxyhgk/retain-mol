import { useEffect, useRef, useState } from 'react'
import { X, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RightPanel } from '@/components/panels'
import type { WorkspaceMode } from '@/App'

interface FloatingInspectorProps {
  open: boolean
  onClose: () => void
  workspaceMode: WorkspaceMode
}

export function FloatingInspector({ open, onClose, workspaceMode }: FloatingInspectorProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const dragRef = useRef<{ dx: number; dy: number } | null>(null)

  const [initial, setInitial] = useState(false)
  useEffect(() => {
    if (open && !initial) setInitial(true)
  }, [open, initial])

  const onPointerDown = (e: React.PointerEvent) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    dragRef.current = { dx: e.clientX - rect.left, dy: e.clientY - rect.top }
    ;(e.target as Element).setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return
    const vw = window.innerWidth
    const vh = window.innerHeight
    const el = ref.current
    const w = el?.offsetWidth ?? 380
    const h = el?.offsetHeight ?? 480
    let x = e.clientX - dragRef.current.dx
    let y = e.clientY - dragRef.current.dy
    x = Math.max(8, Math.min(vw - w - 8, x))
    y = Math.max(56, Math.min(vh - h - 8, y))
    setPos({ x, y })
  }
  const onPointerUp = (e: React.PointerEvent) => {
    dragRef.current = null
    try { (e.target as Element).releasePointerCapture(e.pointerId) } catch {}
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const hasDragged = pos.x !== 0 || pos.y !== 0
  const style: React.CSSProperties = hasDragged
    ? { left: pos.x, top: pos.y }
    : { right: 16, top: 64 }

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label="检查器"
      aria-modal={false}
      style={style}
      className="fixed z-[80] flex max-h-[calc(100dvh-72px)] w-[380px] max-w-[92vw] flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-2xl"
    >
      <div
        className="flex h-9 shrink-0 cursor-grab select-none items-center justify-between border-b border-border bg-muted/50 px-2 active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <GripVertical size={14} className="text-muted-foreground" />
          检查器
          <span className="hidden text-[10px] font-normal text-muted-foreground sm:inline">可拖拽 · Esc 关闭</span>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose} aria-label="关闭检查器">
          <X size={14} />
        </Button>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden bg-card">
        <RightPanel workspaceMode={workspaceMode} />
      </div>
    </div>
  )
}
