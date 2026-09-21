import { useSyncExternalStore } from 'react'
import { setInspectorOpen, useInspectorStore } from '@/domain/inspectorStore'

const COMPACT_WIDTH = 1200
const getWidth = () => window.innerWidth
const subscribe = (notify: () => void) => {
  let compact = getWidth() < COMPACT_WIDTH
  const resize = () => {
    const nextCompact = getWidth() < COMPACT_WIDTH
    if (nextCompact !== compact) setInspectorOpen(false, true)
    compact = nextCompact
    notify()
  }
  window.addEventListener('resize', resize)
  return () => window.removeEventListener('resize', resize)
}

export function useInspectorLayout() {
  const width = useSyncExternalStore(subscribe, getWidth, () => 1440)
  const compact = width < COMPACT_WIDTH
  const open = useInspectorStore(state => compact ? state.compactOpen : state.dockOpen)
  return {
    compact, open,
    toggle: () => setInspectorOpen(!open, compact),
    close: () => setInspectorOpen(false, compact),
    minSize: 320 / width * 100,
    defaultSize: 380 / width * 100,
    maxSize: Math.min(40, 480 / width * 100),
  }
}
