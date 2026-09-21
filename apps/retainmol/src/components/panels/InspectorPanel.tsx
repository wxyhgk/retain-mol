import { useRef } from 'react'
import { PanelRightClose } from 'lucide-react'
import { Button, Dialog, DialogContent, DialogDescription, DialogTitle } from '@retainmol/ui-kit'
import { RightPanel } from '@/components/panels'
import { INSPECTOR_ID, INSPECTOR_TOGGLE_ID } from '@/domain/inspectorStore'
import { isTextEditingTarget } from '@/domain/shortcutScope'


function restoreToggleFocus() {
  document.getElementById(INSPECTOR_TOGGLE_ID)?.focus()
}

export function InspectorPanel({ compact, open, onClose }: {
  compact: boolean
  open: boolean
  onClose: () => void
}) {
  const panelRef = useRef<HTMLElement>(null)
  const closeDock = () => {
    if (panelRef.current?.contains(document.activeElement)) restoreToggleFocus()
    onClose()
  }

  if (compact) return (
    <Dialog open={open} onOpenChange={value => { if (!value) onClose() }}>
      <DialogContent
        id={INSPECTOR_ID}
        className="flex h-[min(720px,calc(100dvh-32px))] w-[calc(100vw-24px)] max-w-md flex-col gap-0 overflow-hidden p-0"
        onCloseAutoFocus={event => { event.preventDefault(); restoreToggleFocus() }}
        onEscapeKeyDown={event => {
          // Radix handles Escape at document capture, before the field's cancel handler.
          if (event.target instanceof Element && event.target.closest('[data-escape="cancel-edit"]')) event.preventDefault()
        }}
      >
        <div className="shrink-0 border-b border-border px-3 py-3 pr-12">
          <DialogTitle className="text-sm">检查器</DialogTitle>
          <DialogDescription className="mt-1 text-xs">关闭后继续编辑分子，当前绘制工具会保留。</DialogDescription>
        </div>
        <div className="min-h-0 flex-1"><RightPanel /></div>
      </DialogContent>
    </Dialog>
  )

  return (
    <aside
      id={INSPECTOR_ID}
      ref={panelRef}
      aria-label="检查器"
      data-shortcuts="local"
      className="flex h-full min-h-0 min-w-0 flex-col border-l border-border bg-card text-card-foreground"
      onKeyDown={event => {
        if (event.key !== 'Escape' || event.defaultPrevented || isTextEditingTarget(event.target)) return
        event.preventDefault()
        event.stopPropagation()
        closeDock()
      }}
    >
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-border px-3">
        <span className="text-xs font-semibold">检查器</span>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={closeDock} aria-label="收起检查器" title="收起检查器，保留绘制工具">
          <PanelRightClose size={15} />
        </Button>
      </div>
      <div className="min-h-0 flex-1"><RightPanel /></div>
    </aside>
  )
}
