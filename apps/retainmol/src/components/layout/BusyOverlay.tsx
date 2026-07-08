import { useUiStore } from '@/lib/uiStore'

export function BusyOverlay() {
  const busy = useUiStore(s => s.busy)
  if (!busy) return null
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5
                    bg-gray-900/90 text-white text-xs px-4 py-2 rounded-full shadow-lg pointer-events-none">
      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      {busy}
    </div>
  )
}
