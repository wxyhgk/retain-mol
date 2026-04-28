/**
 * OptimizeCurveOverlay — 三维优化曲线叠加层
 *
 * 坐标系：
 *   X = 优化步数
 *   Y = 量的种类（每条曲线一个平面，沿 Y 排列）
 *   Z = 该量的数值
 *
 * 以后加新量（力常数等）只需在 TRACKS 里新增一项。
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import { useXtbStore, type XtbFrame } from '@/store/xtbStore'
import { useMoleculeStore } from '@/store/moleculeStore'

// ── 画布尺寸 ───────────────────────────────────────────────────────────────────
const W = 340
const H = 220

// ── 轨道定义（以后加量只需加这里）────────────────────────────────────────────
interface TrackDef {
  key: keyof XtbFrame & ('energy' | 'gnorm')
  label: string
  color: number     // hex
  glowColor: string // css hex for label
}

const TRACKS: TrackDef[] = [
  { key: 'energy', label: 'Energy (Eh)', color: 0x00d4ff, glowColor: '#00d4ff' },
  { key: 'gnorm',  label: '‖g‖',         color: 0xff9500, glowColor: '#ff9500' },
]

const TRACK_Y_STEP = 0.9   // Y 间距
const X_RANGE      = 1.6   // X 轴总长（步数）
const Z_RANGE      = 0.7   // Z 轴幅度
const HIT_RADIUS   = 0.08  // 点击吸附半径（world units）

// ── Three.js 场景封装 ─────────────────────────────────────────────────────────
interface ChartScene {
  renderer: THREE.WebGLRenderer
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  group: THREE.Group        // 可旋转的内容组
  hitMeshes: THREE.Mesh[]   // 用于射线检测的不可见球体
  frameSteps: number[]      // hitMeshes 对应的 step 值
  dispose: () => void
}

function createScene(canvas: HTMLCanvasElement): ChartScene {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(W, H)
  renderer.setClearColor(0x000000, 0)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(42, W / H, 0.01, 100)
  camera.position.set(2.2, 1.2, 2.8)
  camera.lookAt(0, (TRACKS.length - 1) * TRACK_Y_STEP * 0.5, 0)

  const group = new THREE.Group()
  scene.add(group)

  // 环境光
  scene.add(new THREE.AmbientLight(0xffffff, 0.3))

  return {
    renderer, scene, camera, group,
    hitMeshes: [], frameSteps: [],
    dispose: () => { renderer.dispose() },
  }
}

// ── 曲线构建工具 ──────────────────────────────────────────────────────────────
function normX(step: number, minS: number, maxS: number) {
  return ((step - minS) / (maxS - minS || 1) - 0.5) * X_RANGE
}
function normZ(val: number, lo: number, hi: number) {
  return ((val - lo) / (hi - lo || 1e-10) - 0.5) * Z_RANGE
}

function buildGlowTube(
  curve: THREE.CatmullRomCurve3,
  color: number,
  segments: number,
): THREE.Object3D {
  const group = new THREE.Group()
  const specs = [
    { r: 0.022, opacity: 0.10 },
    { r: 0.010, opacity: 0.28 },
    { r: 0.004, opacity: 0.90 },
  ]
  for (const { r, opacity } of specs) {
    const geo = new THREE.TubeGeometry(curve, Math.max(segments * 3, 20), r, 6, false)
    const mat = new THREE.MeshBasicMaterial({
      color: opacity > 0.5 ? 0xffffff : color,
      transparent: true, opacity,
      depthWrite: false,
    })
    group.add(new THREE.Mesh(geo, mat))
  }
  return group
}

function buildAxisPlane(yPos: number, color: number, minS: number, maxS: number): THREE.Object3D {
  const g = new THREE.Group()
  g.position.y = yPos

  // X 轴线
  const xMat = new THREE.LineBasicMaterial({ color: 0x334466, transparent: true, opacity: 0.5 })
  const xGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-X_RANGE / 2, 0, -Z_RANGE / 2),
    new THREE.Vector3( X_RANGE / 2, 0, -Z_RANGE / 2),
  ])
  g.add(new THREE.Line(xGeo, xMat))

  // Z 轴线
  const zGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-X_RANGE / 2, 0, -Z_RANGE / 2),
    new THREE.Vector3(-X_RANGE / 2, 0,  Z_RANGE / 2),
  ])
  g.add(new THREE.Line(zGeo, xMat))

  // 网格线（轻）
  const gridMat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.06 })
  const pts: THREE.Vector3[] = []
  const GRID = 4
  for (let i = 0; i <= GRID; i++) {
    const x = -X_RANGE / 2 + (i / GRID) * X_RANGE
    pts.push(new THREE.Vector3(x, 0, -Z_RANGE / 2), new THREE.Vector3(x, 0, Z_RANGE / 2))
  }
  for (let i = 0; i <= GRID; i++) {
    const z = -Z_RANGE / 2 + (i / GRID) * Z_RANGE
    pts.push(new THREE.Vector3(-X_RANGE / 2, 0, z), new THREE.Vector3(X_RANGE / 2, 0, z))
  }
  const gridGeo = new THREE.BufferGeometry().setFromPoints(pts)
  g.add(new THREE.LineSegments(gridGeo, gridMat))

  return g
}

// Y 轨道之间的竖向连接线（视觉引导）
function buildYConnectors(frames: XtbFrame[], minS: number, maxS: number): THREE.Object3D {
  const mat = new THREE.LineBasicMaterial({ color: 0x223344, transparent: true, opacity: 0.25 })
  const group = new THREE.Group()
  const step = Math.max(1, Math.floor(frames.length / 8))
  for (let i = 0; i < frames.length; i += step) {
    const f = frames[i]
    const x = normX(f.step, minS, maxS)
    const pts = TRACKS.map((t, ti) => {
      const vals = frames.map(fr => fr[t.key] as number)
      const lo = Math.min(...vals), hi = Math.max(...vals)
      return new THREE.Vector3(x, ti * TRACK_Y_STEP, normZ(f[t.key] as number, lo, hi))
    })
    const geo = new THREE.BufferGeometry().setFromPoints(pts)
    group.add(new THREE.Line(geo, mat))
  }
  return group
}

// ── 重建图表内容 ──────────────────────────────────────────────────────────────
function rebuildChart(cs: ChartScene, frames: XtbFrame[]) {
  // 清空旧内容（保留 group 本身）
  while (cs.group.children.length) {
    const c = cs.group.children[0]
    cs.group.remove(c)
    if (c instanceof THREE.Mesh || c instanceof THREE.Line) {
      (c as THREE.Mesh).geometry?.dispose()
    }
  }
  cs.hitMeshes.length = 0
  cs.frameSteps.length = 0

  if (frames.length < 2) return

  const minS = frames[0].step
  const maxS = frames[frames.length - 1].step

  // 连接线
  cs.group.add(buildYConnectors(frames, minS, maxS))

  // 每个量的平面 + 曲线
  for (let ti = 0; ti < TRACKS.length; ti++) {
    const track = TRACKS[ti]
    const yPos = ti * TRACK_Y_STEP
    const vals = frames.map(f => f[track.key] as number)
    const lo = Math.min(...vals), hi = Math.max(...vals)

    // 轴平面
    cs.group.add(buildAxisPlane(yPos, track.color, minS, maxS))

    // 曲线点
    const pts3d = frames.map(f => new THREE.Vector3(
      normX(f.step, minS, maxS),
      yPos,
      normZ(f[track.key] as number, lo, hi),
    ))

    const curve = new THREE.CatmullRomCurve3(pts3d, false, 'centripetal', 0.5)
    cs.group.add(buildGlowTube(curve, track.color, frames.length))

    // 终点发光球
    const endPt = pts3d[pts3d.length - 1]
    const sphereGeo = new THREE.SphereGeometry(0.025, 8, 8)
    const sphereMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 })
    const sphere = new THREE.Mesh(sphereGeo, sphereMat)
    sphere.position.copy(endPt)
    cs.group.add(sphere)
  }

  // 不可见点击球体（只用 energy 轨道定位，y 方向范围覆盖所有轨道）
  const energyVals = frames.map(f => f.energy)
  const elo = Math.min(...energyVals), ehi = Math.max(...energyVals)
  const hitGeo = new THREE.SphereGeometry(HIT_RADIUS, 6, 6)
  const hitMat = new THREE.MeshBasicMaterial({ visible: false })
  for (const f of frames) {
    const mesh = new THREE.Mesh(hitGeo, hitMat)
    mesh.position.set(
      normX(f.step, minS, maxS),
      TRACK_Y_STEP * (TRACKS.length - 1) * 0.5,  // 居中在所有轨道之间
      normZ(f.energy, elo, ehi),
    )
    mesh.userData.step = f.step
    cs.group.add(mesh)
    cs.hitMeshes.push(mesh)
    cs.frameSteps.push(f.step)
  }
}

// ── label 信息（投影到屏幕）────────────────────────────────────────────────────
interface LabelInfo { id: string; x: number; y: number; text: string; color: string; size: number }

function computeLabels(cs: ChartScene, frames: XtbFrame[]): LabelInfo[] {
  if (frames.length < 2) return []
  const labels: LabelInfo[] = []
  const minS = frames[0].step, maxS = frames[frames.length - 1].step

  const project = (v: THREE.Vector3) => {
    const w = v.clone()
    cs.group.localToWorld(w)
    const p = w.project(cs.camera)
    return { sx: (p.x + 1) / 2 * W, sy: (1 - (p.y + 1) / 2) * H }
  }

  // 轨道名称标签（Z 轴末端）
  for (let ti = 0; ti < TRACKS.length; ti++) {
    const track = TRACKS[ti]
    const yPos = ti * TRACK_Y_STEP
    const p = project(new THREE.Vector3(-X_RANGE / 2 - 0.05, yPos, Z_RANGE / 2))
    labels.push({ id: `track-${ti}`, x: p.sx, y: p.sy, text: track.label, color: track.glowColor, size: 9 })
  }

  // X 轴刻度（最后一个轨道下方）
  const lastY = (TRACKS.length - 1) * TRACK_Y_STEP
  const ticks = Math.min(maxS - minS, 5)
  for (let i = 0; i <= ticks; i++) {
    const s = Math.round(minS + (i / ticks) * (maxS - minS))
    const p = project(new THREE.Vector3(normX(s, minS, maxS), lastY, -Z_RANGE / 2 - 0.04))
    labels.push({ id: `xtick-${i}`, x: p.sx, y: p.sy, text: String(s), color: 'rgba(255,255,255,0.35)', size: 8 })
  }

  // Step 轴标题
  const p = project(new THREE.Vector3(0, lastY, -Z_RANGE / 2 - 0.18))
  labels.push({ id: 'xlabel', x: p.sx, y: p.sy, text: 'Step', color: 'rgba(255,255,255,0.3)', size: 8 })

  return labels
}

// ── 主组件 ────────────────────────────────────────────────────────────────────
export default function OptimizeCurveOverlay() {
  const { frames, showCurve, corner, scrubStep, setShowCurve, setCorner, setScrubStep } = useXtbStore()
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const csRef      = useRef<ChartScene | null>(null)
  const rafRef     = useRef<number>(0)
  const [labels, setLabels] = useState<LabelInfo[]>([])
  const [hoverStep, setHoverStep] = useState<number | null>(null)
  const [tooltipFrame, setTooltipFrame] = useState<XtbFrame | null>(null)

  // 拖转状态
  const dragRef = useRef({ active: false, lastX: 0, lastY: 0 })
  const rotRef  = useRef({ x: 0.25, y: -0.45 })

  // ── 渲染 ────────────────────────────────────────────────────────────────────
  const renderFrame = useCallback(() => {
    const cs = csRef.current
    if (!cs) return
    const { group, camera, scene, renderer } = cs

    // 旋转
    group.rotation.x = rotRef.current.x
    group.rotation.y = rotRef.current.y

    renderer.render(scene, camera)
    setLabels(computeLabels(cs, useXtbStore.getState().frames))
  }, [])

  // ── 初始化 Three.js ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!canvasRef.current || !showCurve) return
    const cs = createScene(canvasRef.current)
    csRef.current = cs
    renderFrame()
    return () => {
      cancelAnimationFrame(rafRef.current)
      cs.dispose()
      csRef.current = null
    }
  }, [showCurve]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── 数据变化时重建图表 ───────────────────────────────────────────────────────
  useEffect(() => {
    const cs = csRef.current
    if (!cs) return
    rebuildChart(cs, frames)
    renderFrame()
  }, [frames, renderFrame])

  // ── 鼠标拖转 ────────────────────────────────────────────────────────────────
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    dragRef.current = { active: true, lastX: e.clientX, lastY: e.clientY }
    e.currentTarget.setPointerCapture?.((e.nativeEvent as PointerEvent).pointerId)
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (dragRef.current.active) {
      const dx = e.clientX - dragRef.current.lastX
      const dy = e.clientY - dragRef.current.lastY
      rotRef.current.y += dx * 0.012
      rotRef.current.x += dy * 0.012
      rotRef.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotRef.current.x))
      dragRef.current.lastX = e.clientX
      dragRef.current.lastY = e.clientY
      cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(renderFrame)
      return
    }

    // hover：射线检测
    const cs = csRef.current
    if (!cs || !canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / W) * 2 - 1,
      -((e.clientY - rect.top) / H) * 2 + 1,
    )
    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(mouse, cs.camera)
    const hits = raycaster.intersectObjects(cs.hitMeshes)
    if (hits.length > 0) {
      const step = hits[0].object.userData.step as number
      setHoverStep(step)
      setTooltipFrame(useXtbStore.getState().frames.find(f => f.step === step) ?? null)
    } else {
      setHoverStep(null)
      if (scrubStep === null) setTooltipFrame(null)
    }
  }, [renderFrame, scrubStep])

  const handleMouseUp = useCallback(() => { dragRef.current.active = false }, [])

  // ── 点击 scrub ──────────────────────────────────────────────────────────────
  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (Math.abs(e.movementX) + Math.abs(e.movementY) > 4) return  // 拖动后不触发
    const cs = csRef.current
    if (!cs || !canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / W) * 2 - 1,
      -((e.clientY - rect.top) / H) * 2 + 1,
    )
    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(mouse, cs.camera)
    const hits = raycaster.intersectObjects(cs.hitMeshes)
    if (hits.length === 0) return

    const step = hits[0].object.userData.step as number
    const fr = useXtbStore.getState().frames.find(f => f.step === step)
    if (!fr) return

    const { molecule, setAtomPositions } = useMoleculeStore.getState()
    const positions = new Map<string, { x: number; y: number; z: number }>()
    molecule.atoms.forEach((a, i) => {
      if (fr.atoms[i]) positions.set(a.id, { x: fr.atoms[i].x, y: fr.atoms[i].y, z: fr.atoms[i].z })
    })
    setAtomPositions(positions)
    setScrubStep(step)
    setTooltipFrame(fr)
  }, [setScrubStep])

  // ── 回到末帧 ────────────────────────────────────────────────────────────────
  const resetToLast = useCallback(() => {
    const { frames: fs, setScrubStep: ss } = useXtbStore.getState()
    if (!fs.length) return
    const last = fs[fs.length - 1]
    const { molecule, setAtomPositions } = useMoleculeStore.getState()
    const positions = new Map<string, { x: number; y: number; z: number }>()
    molecule.atoms.forEach((a, i) => {
      if (last.atoms[i]) positions.set(a.id, { x: last.atoms[i].x, y: last.atoms[i].y, z: last.atoms[i].z })
    })
    setAtomPositions(positions)
    ss(null)
    setTooltipFrame(null)
  }, [])

  if (!showCurve) return null

  const posClass: Record<typeof corner, string> = {
    br: 'bottom-8 right-3', bl: 'bottom-8 left-3',
    tr: 'top-3 right-3',    tl: 'top-3 left-3',
  }
  const C_ENERGY = '#00d4ff'

  return (
    <div
      className={`absolute ${posClass[corner]} z-20 select-none`}
      style={{ width: W, borderRadius: 10, overflow: 'hidden', boxShadow: '0 4px 32px rgba(0,0,0,0.6)' }}
    >
      {/* header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '4px 8px', background: 'rgba(6,12,24,0.95)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}>
        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, fontFamily: 'system-ui' }}>
          xTB 优化曲线 · 拖动旋转
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* corner picker */}
          <div style={{ display: 'flex', gap: 2 }}>
            {(['tl','tr','bl','br'] as const).map(c => (
              <button key={c} onClick={() => setCorner(c)} style={{
                width: 9, height: 9, borderRadius: 2, border: 'none', cursor: 'pointer', padding: 0,
                background: corner === c ? C_ENERGY : 'rgba(255,255,255,0.12)',
                boxShadow: corner === c ? `0 0 5px ${C_ENERGY}` : 'none',
              }} />
            ))}
          </div>
          {scrubStep !== null && (
            <button onClick={resetToLast} style={{
              color: C_ENERGY, fontSize: 9, background: 'none', border: 'none',
              cursor: 'pointer', fontFamily: 'system-ui',
            }}>回到末帧</button>
          )}
          <button onClick={() => setShowCurve(false)} style={{
            color: 'rgba(255,255,255,0.35)', fontSize: 12, background: 'none',
            border: 'none', cursor: 'pointer', lineHeight: 1, padding: '0 2px',
          }}>✕</button>
        </div>
      </div>

      {/* 3D canvas + label overlay */}
      <div
        style={{ position: 'relative', width: W, height: H, background: 'rgba(6,12,24,0.82)', cursor: dragRef.current.active ? 'grabbing' : 'grab' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleClick}
      >
        <canvas ref={canvasRef} width={W} height={H} style={{ display: 'block', width: W, height: H }} />

        {/* axis labels (projected from 3D) */}
        {labels.map(l => (
          <span key={l.id} style={{
            position: 'absolute',
            left: l.x, top: l.y,
            transform: 'translate(-50%, -50%)',
            color: l.color,
            fontSize: l.size,
            fontFamily: l.id.startsWith('track') ? 'system-ui' : 'monospace',
            fontWeight: l.id.startsWith('track') ? 600 : 400,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            textShadow: `0 0 8px ${l.color}`,
          }}>{l.text}</span>
        ))}

        {/* hover/scrub 十字线 + 高亮点（通过重渲染实现，这里只做 tooltip） */}
        {frames.length === 0 && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'rgba(255,255,255,0.3)', fontSize: 11, fontFamily: 'system-ui',
          }}>等待优化数据…</div>
        )}
      </div>

      {/* tooltip */}
      {(tooltipFrame ?? (hoverStep !== null ? frames.find(f => f.step === hoverStep) : null)) && (() => {
        const tf = tooltipFrame ?? frames.find(f => f.step === hoverStep)!
        return (
          <div style={{
            background: 'rgba(6,12,24,0.95)', borderTop: '1px solid rgba(255,255,255,0.07)',
            padding: '4px 10px', display: 'flex', gap: 12, alignItems: 'center',
            fontFamily: 'monospace', fontSize: 10,
          }}>
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>步骤 {tf.step}</span>
            <span style={{ color: '#00d4ff' }}>{tf.energy.toFixed(6)} Eh</span>
            <span style={{ color: '#ff9500' }}>‖g‖ {tf.gnorm.toFixed(4)}</span>
            {scrubStep === tf.step && <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 9 }}>已定位</span>}
          </div>
        )
      })()}
    </div>
  )
}
