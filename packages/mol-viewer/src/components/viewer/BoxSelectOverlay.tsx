import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useMoleculeStore, selectActiveMoleculeOrEmpty } from '@/store/moleculeStore'
import { MolRenderer } from '@/lib/molRenderer'

interface Props {
  renderer: MolRenderer | null
}

/**
 * 框选 overlay。
 * 激活条件：按住 Shift 在"背景"处拖动（鼠标下方无原子时）
 *   ——避免抢走 shift+click 原子多选切换。
 * 释放时：shift → 加入当前选择（默认）；alt/cmd → 减去。
 */
export default function BoxSelectOverlay({ renderer }: Props) {
  const overlayRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!renderer) return
    const canvas = renderer.canvas
    const overlay = overlayRef.current
    if (!overlay) return

    const ctx = overlay.getContext('2d')!
    const dpr = () => window.devicePixelRatio || 1

    const sync = () => {
      const rect = canvas.getBoundingClientRect()
      const r = dpr()
      overlay.width = Math.max(1, Math.round(rect.width * r))
      overlay.height = Math.max(1, Math.round(rect.height * r))
      overlay.style.width = `${rect.width}px`
      overlay.style.height = `${rect.height}px`
    }
    sync()
    const ro = new ResizeObserver(sync)
    ro.observe(canvas)

    let state: { startX: number; startY: number; shift: boolean; alt: boolean } | null = null

    const clear = () => ctx.clearRect(0, 0, overlay.width, overlay.height)

    const draw = (x0: number, y0: number, x1: number, y1: number) => {
      const r = dpr()
      clear()
      ctx.save()
      ctx.scale(r, r)
      const x = Math.min(x0, x1), y = Math.min(y0, y1)
      const w = Math.abs(x1 - x0), h = Math.abs(y1 - y0)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)'
      ctx.strokeStyle = '#111827'
      ctx.lineWidth = 1
      ctx.setLineDash([4, 3])
      ctx.fillRect(x, y, w, h)
      ctx.strokeRect(x, y, w, h)
      ctx.restore()
    }

    const shouldActivate = (e: PointerEvent): boolean => {
      // 触发：右键 或 Shift+左键；都只在鼠标下方无选中原子时抢事件，
      //（避免覆盖 AtomContextMenu 的"右击选中原子出菜单"、和 shift+click 切换选中原子）
      const isRight = e.button === 2
      const isShiftLeft = e.button === 0 && e.shiftKey
      if (!isRight && !isShiftLeft) return false
      const atomId = renderer.pickAtomIdAt(e.clientX, e.clientY)
      if (!atomId) return true
      // 右键点中已选原子 → 让 AtomContextMenu 接手；否则放行
      if (isRight) {
        const sel = useMoleculeStore.getState().selectedAtomIds
        return !sel.has(atomId)
      }
      // shift+左键点原子 → 让 shift+click 切换选中生效
      return false
    }

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0 && e.button !== 2) return
      if (!shouldActivate(e)) return
      // 拦在 capture 阶段，阻止 MolRenderer / MolControls 接管
      e.stopImmediatePropagation()
      e.preventDefault()
      const rect = canvas.getBoundingClientRect()
      state = {
        startX: e.clientX - rect.left,
        startY: e.clientY - rect.top,
        shift: e.shiftKey,
        alt: e.altKey || e.metaKey,
      }
      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerup', onUp)
    }

    const onMove = (e: PointerEvent) => {
      if (!state) return
      const rect = canvas.getBoundingClientRect()
      draw(state.startX, state.startY, e.clientX - rect.left, e.clientY - rect.top)
    }

    const onUp = (e: PointerEvent) => {
      const s = state
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      clear()
      state = null
      if (!s) return

      const rect = canvas.getBoundingClientRect()
      const endX = e.clientX - rect.left
      const endY = e.clientY - rect.top
      const minX = Math.min(s.startX, endX), maxX = Math.max(s.startX, endX)
      const minY = Math.min(s.startY, endY), maxY = Math.max(s.startY, endY)

      // 太小当作误触，不动选择
      if (maxX - minX < 3 && maxY - minY < 3) return

      const { selectAtoms } = useMoleculeStore.getState()
      const molecule = selectActiveMoleculeOrEmpty(useMoleculeStore.getState())
      const w = rect.width, h = rect.height
      const hit: string[] = []
      const v = new THREE.Vector3()
      for (const a of molecule.atoms) {
        v.set(a.x, a.y, a.z)
        const p = renderer.projectLocalToScreen(v, w, h)
        if (p.x >= minX && p.x <= maxX && p.y >= minY && p.y <= maxY) hit.push(a.id)
      }
      const mode = s.shift ? 'add' : s.alt ? 'subtract' : 'replace'
      selectAtoms(hit, mode)
    }

    canvas.addEventListener('pointerdown', onDown, { capture: true })

    return () => {
      canvas.removeEventListener('pointerdown', onDown, { capture: true })
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      ro.disconnect()
      clear()
    }
  }, [renderer])

  return (
    <canvas
      ref={overlayRef}
      className="absolute inset-0 pointer-events-none"
    />
  )
}
