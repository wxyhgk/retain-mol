import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useMoleculeStore, selectActiveMoleculeOrEmpty } from '../../store/moleculeStore'
import { useEditorStore } from '../../store/editorStore'
import { MolRenderer } from '../../lib/molRenderer'
import { ticker, Phase } from '../../lib/animation'
import { ATOM_LABEL as L } from '../../config/overlay.config'
import { CAMERA } from '../../config/camera.config'

interface Props {
  renderer: MolRenderer | null
}

export default function AtomLabelOverlay({ renderer }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !renderer) return

    // ── draw：每次 Ticker 触发都直接读 store 当前状态，不用 dirty flag ──────
    // 原因：dirty flag 在 zundo beginTransaction 期间容易丢失状态，
    //       而 draw 本身很轻（canvas 2D 文字），无需额外节流。
    const draw = () => {
      const { showAtomLabels } = useEditorStore.getState()
      const molecule = selectActiveMoleculeOrEmpty(useMoleculeStore.getState())

      const ctx = canvas.getContext('2d')
      if (!ctx) return
      const w = canvas.offsetWidth, h = canvas.offsetHeight
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h }
      ctx.clearRect(0, 0, w, h)

      if (!showAtomLabels || molecule.atoms.length === 0) return

      renderer.camera.updateMatrixWorld()

      const scale = Math.max(L.scaleMin, Math.min(L.scaleMax, CAMERA.initialZ / renderer.camera.position.z))
      const fontSize = Math.round(L.baseFontSize * scale)
      const paddingX = L.paddingX * scale
      const paddingY = L.paddingY * scale
      const height   = L.height   * scale
      const radius   = L.radius   * scale
      const offsetX  = L.offsetX  * scale
      const offsetY  = L.offsetY  * scale

      ctx.font = `bold ${fontSize}px monospace`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      const counters = new Map<string, number>()
      const labels = molecule.atoms.map(atom => {
        const n = (counters.get(atom.symbol) ?? 0) + 1
        counters.set(atom.symbol, n)
        return `${atom.symbol}${n}`
      })

      molecule.atoms.forEach((atom, i) => {
        const pos = new THREE.Vector3(atom.x, atom.y, atom.z)
        const { x, y } = renderer.projectLocalToScreen(pos, w, h)
        if (x < -L.viewportMargin || x > w + L.viewportMargin ||
            y < -L.viewportMargin || y > h + L.viewportMargin) return
        const text = labels[i]
        const tw = ctx.measureText(text).width
        const lx = x + offsetX
        const ly = y + offsetY
        ctx.fillStyle = L.backgroundColor
        ctx.beginPath()
        ctx.roundRect(lx - tw / 2 - paddingX, ly - paddingY, tw + paddingX * 2, height, radius)
        ctx.fill()
        ctx.fillStyle = L.textColor
        ctx.fillText(text, lx, ly)
      })
    }

    const invalidate = () => ticker.invalidate()

    const unsubTicker = ticker.subscribe('atom-label-overlay', Phase.Overlay, draw)

    // 任何会改变画面的事件 → 让 Ticker 跑一帧
    const unsubMolecule  = useMoleculeStore.subscribe(
      s => s.activeObjectId ? s.objectsById[s.activeObjectId]?.molecule.atoms : null,
      invalidate
    )
    const unsubPositions = useMoleculeStore.subscribe(s => s.atomPositionVersion,   invalidate)
    const unsubLabels    = useEditorStore.subscribe(s => s.showAtomLabels, () => {
      ticker.invalidate()
      draw() // 切换时同步画一次，即时响应
    })

    // 相机交互期间进入连续模式
    const unsubCamStart = renderer.controls.on('interactionstart', () => {
      ticker.startContinuous('label-cam')
    })
    const unsubCamEnd = renderer.controls.on('interactionend', () => {
      ticker.stopContinuous('label-cam')
      ticker.invalidate()
    })
    const unsubWheel = renderer.controls.on('wheel', invalidate)

    // 原子位置变化期间进入连续模式（拖动 / 旋转 gizmo）
    let posTimer: ReturnType<typeof setTimeout> | null = null
    const unsubPos2 = useMoleculeStore.subscribe(s => s.atomPositionVersion, () => {
      ticker.startContinuous('label-pos')
      if (posTimer) clearTimeout(posTimer)
      posTimer = setTimeout(() => {
        ticker.stopContinuous('label-pos')
        ticker.invalidate()
        posTimer = null
      }, 150)
    })

    ticker.invalidate() // 初始帧

    return () => {
      unsubTicker()
      unsubMolecule()
      unsubPositions()
      unsubLabels()
      unsubCamStart()
      unsubCamEnd()
      unsubWheel()
      unsubPos2()
      if (posTimer) clearTimeout(posTimer)
      ticker.stopContinuous('label-cam')
      ticker.stopContinuous('label-pos')
    }
  }, [renderer])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  )
}
