import { useEffect, useId, useRef } from 'react'
import * as THREE from 'three'
import { selectActiveMoleculeOrEmpty } from '../../store/moleculeStore'
import type { ThreeRendererPort } from '../../lib/molRenderer'
import { Phase } from '../../lib/animation'
import { useViewerRuntimeServices } from '../../runtime/ViewerRuntime'
import { ATOM_LABEL as L } from '../../config/overlay.config'
import { CAMERA } from '../../config/camera.config'
import { resolveRenderProfile } from '../../styles'
import { buildNumberedAtomLabels } from './atomLabels'
import { prepareOverlayCanvas } from '../../viewer/overlay/useOverlayCanvas'

interface Props {
  renderer: ThreeRendererPort | null
}

function modBrightness(color: THREE.Color, amount: number): THREE.Color {
  const target = amount > 0 ? 1 : 0
  const t = Math.min(1, Math.abs(amount))
  return new THREE.Color(
    color.r * (1 - t) + target * t,
    color.g * (1 - t) + target * t,
    color.b * (1 - t) + target * t,
  )
}

function rgba(color: THREE.Color, alpha = 1): string {
  const r = Math.round(color.r * 255)
  const g = Math.round(color.g * 255)
  const b = Math.round(color.b * 255)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function elementLabelColor(renderer: ThreeRendererPort, symbol: string, brightness = 0): string {
  const hex = renderer.theme.elements[symbol]?.color ?? renderer.theme.fallbackColor
  return rgba(modBrightness(new THREE.Color(hex), brightness), 0.96)
}

function projectedWorldSize(renderer: ThreeRendererPort, center: THREE.Vector3, worldSize: number, w: number, h: number): number {
  renderer.camera.updateMatrixWorld()
  const right = new THREE.Vector3().setFromMatrixColumn(renderer.camera.matrixWorld, 0).normalize()
  const p0 = renderer.projectToScreen(center, w, h)
  const p1 = renderer.projectToScreen(center.clone().addScaledVector(right, worldSize), w, h)
  return Math.hypot(p1.x - p0.x, p1.y - p0.y)
}

function iboviewDrawRadius(symbol: string): number {
  const radii: Record<string, number> = {
    H: 0.87, He: 1.60, Li: 2.52, Be: 2.03, B: 1.58, C: 1.43, N: 1.32, O: 1.29, F: 1.26, Ne: 1.74,
    Na: 2.91, Mg: 2.69, Al: 2.35, Si: 2.11, P: 2.08, S: 2.04, Cl: 1.97, Ar: 1.95,
    K: 3.69, Ca: 3.33, Fe: 2.35, Co: 2.20, Ni: 2.46, Cu: 2.25, Zn: 2.38, Br: 2.17, I: 2.61,
  }
  return radii[symbol] ?? radii.C ?? 1.43
}

export default function AtomLabelOverlay({ renderer }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { moleculeStore, editorStore, ticker } = useViewerRuntimeServices()
  const subscriptionId = useId()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !renderer) return

    // ── draw：每次 Ticker 触发都直接读 store 当前状态，不用 dirty flag ──────
    // 原因：dirty flag 在 zundo beginTransaction 期间容易丢失状态，
    //       而 draw 本身很轻（canvas 2D 文字），无需额外节流。
    const draw = () => {
      const { showAtomLabels } = editorStore.getState()
      const molecule = selectActiveMoleculeOrEmpty(moleculeStore.getState())

      const prepared = prepareOverlayCanvas(canvas)
      if (!prepared) return
      const { ctx, w, h } = prepared
      if (molecule.atoms.length === 0) return

      renderer.camera.updateMatrixWorld()
      const badgeScale = Math.max(L.scaleMin, Math.min(L.scaleMax, CAMERA.initialZ / renderer.camera.position.z))

      // ── 电荷/自由基徽标：始终显示（不受原子标签开关影响，否则看不出带电）──
      const badgeFont = Math.round(L.baseFontSize * badgeScale * 0.85)
      ctx.font = `bold ${badgeFont}px monospace`
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      for (const atom of molecule.atoms) {
        const p = renderer.projectLocalToScreen(new THREE.Vector3(atom.x, atom.y, atom.z), w, h)
        if (p.x < -L.viewportMargin || p.x > w + L.viewportMargin || p.y < -L.viewportMargin || p.y > h + L.viewportMargin) continue
        const q = atom.charge ?? 0
        const rad = atom.radical ?? 0
        const bx = p.x + 8 * badgeScale
        const by = p.y - 10 * badgeScale
        if (q !== 0 || rad !== 0) {
          const mag = Math.abs(q)
          const sign = q > 0 ? '+' : '−'
          const txt = (q === 0 ? '' : mag === 1 ? sign : `${mag}${sign}`) + (rad > 0 ? '•' : '')
          const tw = ctx.measureText(txt).width
          ctx.fillStyle = q > 0 ? 'rgba(59,130,246,0.92)' : q < 0 ? 'rgba(239,68,68,0.92)' : 'rgba(107,114,128,0.92)'
          ctx.beginPath()
          ctx.roundRect(bx - 3, by - badgeFont * 0.62, tw + 6, badgeFont * 1.24, 4)
          ctx.fill()
          ctx.fillStyle = '#fff'
          ctx.fillText(txt, bx, by)
        }
        // ── 手性徽标：只显示已指定的 R/S；未指定的潜在中心不显示
        // （没有手性中心就不显示，避免满屏问号干扰建模）
        const chiralTxt = atom.chirality ?? ''
        if (chiralTxt !== '') {
          const cx = p.x + 8 * badgeScale
          const cy = by + badgeFont * 1.15
          ctx.font = `bold ${badgeFont}px monospace`
          const ctw = ctx.measureText(chiralTxt).width
          ctx.beginPath()
          ctx.roundRect(cx - 3, cy - badgeFont * 0.62, ctw + 6, badgeFont * 1.24, 4)
          if (atom.chirality) {
            ctx.fillStyle = 'rgba(124,58,237,0.92)'
            ctx.fill()
            ctx.fillStyle = '#fff'
          } else {
            ctx.fillStyle = 'rgba(255,255,255,0.75)'
            ctx.fill()
            ctx.strokeStyle = 'rgba(107,114,128,0.9)'
            ctx.lineWidth = 1
            ctx.stroke()
            ctx.fillStyle = 'rgba(107,114,128,1)'
          }
          ctx.fillText(chiralTxt, cx, cy)
        }
      }

      const profileLabels = resolveRenderProfile(renderer.renderStyle).atomLabels
      const showElementLabels = !showAtomLabels && profileLabels?.mode === 'element-symbol'
      if (!showAtomLabels && !showElementLabels) return

      const scale = Math.max(L.scaleMin, Math.min(L.scaleMax, CAMERA.initialZ / renderer.camera.position.z))
      const fallbackFontSize = Math.round(L.baseFontSize * scale * (showElementLabels ? (profileLabels?.fontScale ?? 1) : 1))
      const paddingX = L.paddingX * scale
      const paddingY = L.paddingY * scale
      const height   = L.height   * scale
      const radius   = L.radius   * scale
      const offsetX  = L.offsetX  * scale
      const offsetY  = L.offsetY  * scale

      ctx.font = `bold ${fallbackFontSize}px monospace`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      const labels = showElementLabels
        ? molecule.atoms.map(atom => atom.symbol)
        : buildNumberedAtomLabels(molecule.atoms)

      molecule.atoms.forEach((atom, i) => {
        if (showElementLabels) {
          if (atom.symbol === 'H' && !profileLabels?.includeHydrogen) return
          if (atom.symbol === 'C' && !profileLabels?.includeCarbon) return
        }
        const pos = new THREE.Vector3(atom.x, atom.y, atom.z)
        const { x, y } = renderer.projectLocalToScreen(pos, w, h)
        if (x < -L.viewportMargin || x > w + L.viewportMargin ||
            y < -L.viewportMargin || y > h + L.viewportMargin) return
        const text = labels[i]
        if (text === undefined) return
        if (showElementLabels) {
          const worldPos = renderer.modelGroup.localToWorld(pos.clone())
          if (renderer.renderStyle === 'iboview') {
            const cameraDir = new THREE.Vector3()
            renderer.camera.getWorldDirection(cameraDir)
            const profile = resolveRenderProfile(renderer.renderStyle)
            const radius = iboviewDrawRadius(atom.symbol) * (profile.atomRadiusScale ?? 0.4)
            worldPos.addScaledVector(cameraDir, -radius)
          }
          const sourceWorldSize = (profileLabels?.sourceSize ?? 80) / 100
          const projectedSize = projectedWorldSize(renderer, worldPos, sourceWorldSize, w, h)
          const screenPos = renderer.projectToScreen(worldPos, w, h)
          const fontSize = Math.round(Math.max(
            profileLabels?.minFontSize ?? 10,
            Math.min(profileLabels?.maxFontSize ?? 48, projectedSize * (profileLabels?.fontScale ?? 1)),
          ))
          ctx.font = `700 ${fontSize}px Arial, Helvetica, sans-serif`
          ctx.shadowColor = profileLabels?.shadowColor ?? 'rgba(255, 255, 255, 0.4)'
          ctx.shadowBlur = Math.max(1, fontSize * 0.07)
          ctx.shadowOffsetX = 0
          ctx.shadowOffsetY = 0
          ctx.fillStyle = profileLabels?.colorPolicy === 'element-brightness'
            ? elementLabelColor(renderer, atom.symbol, profileLabels?.brightness ?? 0)
            : profileLabels?.color ?? '#111827'
          ctx.fillText(text, screenPos.x, screenPos.y)
          ctx.shadowBlur = 0
          return
        }
        ctx.font = `bold ${fallbackFontSize}px monospace`
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

    const unsubTicker = ticker.subscribe(`atom-label-overlay:${subscriptionId}`, Phase.Overlay, draw)

    // 任何会改变画面的事件 → 让 Ticker 跑一帧
    const unsubMolecule  = moleculeStore.subscribe(
      s => s.activeObjectId ? s.objectsById[s.activeObjectId]?.molecule.atoms : null,
      invalidate
    )
    const unsubPositions = moleculeStore.subscribe(s => s.atomPositionVersion,   invalidate)
    const unsubLabels    = editorStore.subscribe(s => s.showAtomLabels, () => {
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
    const unsubPos2 = moleculeStore.subscribe(s => s.atomPositionVersion, () => {
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
  }, [renderer, moleculeStore, editorStore, ticker, subscriptionId])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  )
}
