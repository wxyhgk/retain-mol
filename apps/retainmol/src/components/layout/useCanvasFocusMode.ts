import { useCallback, useEffect, useState } from 'react'

export function isWorkspaceControlTarget(target: EventTarget | null) {
  if (!target || typeof (target as Element).closest !== 'function') return false
  return Boolean((target as Element).closest(
    '[data-workspace-floating="true"], [data-workspace-control="true"], button, input, select, textarea',
  ))
}

export function useCanvasFocusMode() {
  const [interacting, setInteracting] = useState(false)

  const begin = useCallback((target: EventTarget | null) => {
    if (isWorkspaceControlTarget(target)) return
    setInteracting(true)
  }, [])

  const finish = useCallback(() => {
    setInteracting(false)
  }, [])

  const pulse = useCallback((target: EventTarget | null) => {
    if (isWorkspaceControlTarget(target)) return
    begin(target)
    window.requestAnimationFrame(finish)
  }, [begin, finish])

  useEffect(() => {
    window.addEventListener('pointerup', finish)
    window.addEventListener('pointercancel', finish)
    return () => {
      window.removeEventListener('pointerup', finish)
      window.removeEventListener('pointercancel', finish)
    }
  }, [finish])

  return { interacting, begin, finish, pulse }
}
