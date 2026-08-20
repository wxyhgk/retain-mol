import { selectAppBusyMessage, useAppTaskStore } from '@/store/appTaskStore'

export function BusyOverlay() {
  const busy = useAppTaskStore(selectAppBusyMessage)
  if (!busy) return null
  return (
    <div className="absolute top-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2.5 rounded-full border border-border bg-card/95 px-4 py-2 text-xs text-foreground shadow-lg backdrop-blur-md pointer-events-none">
      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground" />
      {busy}
    </div>
  )
}
