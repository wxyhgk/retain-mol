import { useSyncExternalStore } from 'react'

/**
 * 全站共享的 1s 心跳：无论多少订阅者只跑一个 setInterval，
 * 无订阅者时自动停表。用于耗时跳动等低精度实时显示。
 */
const listeners = new Set<() => void>()
let now = Date.now()
let timer: ReturnType<typeof setInterval> | null = null

function subscribe(callback: () => void): () => void {
  listeners.add(callback)
  timer ??= setInterval(() => {
    now = Date.now()
    for (const listener of listeners) listener()
  }, 1000)
  return () => {
    listeners.delete(callback)
    if (listeners.size === 0 && timer) {
      clearInterval(timer)
      timer = null
    }
  }
}

export function useNowTick(): number {
  return useSyncExternalStore(subscribe, () => now, () => now)
}

/** 毫秒 → 「2h 11m」/「45m 12s」/「38s」。负值/非法输入返回 '—'。 */
export function formatDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return '—'
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  if (hours > 0) return `${hours}h ${String(minutes).padStart(2, '0')}m`
  if (minutes > 0) return `${minutes}m ${String(seconds).padStart(2, '0')}s`
  return `${seconds}s`
}
