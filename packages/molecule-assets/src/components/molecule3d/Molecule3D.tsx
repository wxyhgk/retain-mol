import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { AromaticRingCache, MoleculeRenderer } from '@retainmol/mol-viewer/three'
import { resolveTheme, type ResolvedTheme } from '@retainmol/mol-viewer/styles'
import { centerMolecule } from '@retainmol/mol-viewer/core'
import type { Molecule } from '@retainmol/mol-viewer/core'

export interface Molecule3DProps {
  molecule: Molecule
  /** mol-viewer 主题 id（分子配色）；缺省 'default' */
  themeId?: string
  autoRotate?: boolean
  /** 拖拽旋转 */
  interactive?: boolean
  /** WebGL context 创建失败时回调（context 预算耗尽时优雅降级，调用方应退回 2D） */
  onUnavailable?: () => void
  className?: string
}

const FOV_DEG = 40
const ROTATE_SPEED = 0.4
const DRAG_SPEED = 0.008
const MAX_PITCH = Math.PI / 2 - 0.1

function safeResolveTheme(themeId: string): ResolvedTheme {
  try {
    return resolveTheme(themeId)
  } catch {
    return resolveTheme('default')
  }
}

function fitDistance(molecule: Molecule): number {
  let cx = 0, cy = 0, cz = 0
  for (const atom of molecule.atoms) {
    cx += atom.x
    cy += atom.y
    cz += atom.z
  }
  const n = Math.max(1, molecule.atoms.length)
  cx /= n; cy /= n; cz /= n
  let maxSq = 0
  for (const atom of molecule.atoms) {
    const dx = atom.x - cx, dy = atom.y - cy, dz = atom.z - cz
    maxSq = Math.max(maxSq, dx * dx + dy * dy + dz * dz)
  }
  const radius = Math.sqrt(maxSq) + 0.8 // 原子渲染半径余量
  return radius / Math.tan((FOV_DEG * Math.PI) / 360) * 1.15
}

/**
 * 单分子交互式 3D 视图（自有小 canvas）。
 * WebGL context 是稀缺资源——请勿直接在列表里批量使用，
 * 应经 MoleculeStructureView + molecule3dPool 控制同屏数量。
 */
export function Molecule3D({ molecule, themeId = 'default', autoRotate = true, interactive = true, onUnavailable, className }: Molecule3DProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const onUnavailableRef = useRef(onUnavailable)
  onUnavailableRef.current = onUnavailable

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    // context 预算是全局稀缺资源：创建失败（返回 null context）必须降级而非崩树
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    } catch {
      onUnavailableRef.current?.()
      return
    }
    renderer.setClearColor(0x000000, 0)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(FOV_DEG, 1, 0.1, 500)
    camera.position.z = fitDistance(molecule)

    scene.add(new THREE.AmbientLight(0xffffff, 0.9))
    const key = new THREE.DirectionalLight(0xffffff, 1.6)
    key.position.set(4, 8, 6)
    const fill = new THREE.DirectionalLight(0xffffff, 0.4)
    fill.position.set(-6, 4, -4)
    scene.add(key, fill)

    const group = new THREE.Group()
    scene.add(group)
    const theme = safeResolveTheme(themeId)
    const molRenderer = new MoleculeRenderer(group, () => theme)
    const centered = centerMolecule(molecule)
    molRenderer.render(centered, 'ball-stick', new Set(), new Set(), new AromaticRingCache().centroids(centered), 'realistic', {})

    let yaw = 0
    let pitch = 0
    let dragging = false
    let lastX = 0
    let lastY = 0

    const onPointerDown = (event: PointerEvent) => {
      if (!interactive) return
      dragging = true
      lastX = event.clientX
      lastY = event.clientY
      canvas.setPointerCapture(event.pointerId)
    }
    const onPointerMove = (event: PointerEvent) => {
      if (!dragging) return
      yaw += (event.clientX - lastX) * DRAG_SPEED
      pitch = Math.max(-MAX_PITCH, Math.min(MAX_PITCH, pitch + (event.clientY - lastY) * DRAG_SPEED))
      lastX = event.clientX
      lastY = event.clientY
    }
    const onPointerUp = (event: PointerEvent) => {
      dragging = false
      canvas.releasePointerCapture(event.pointerId)
    }
    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerup', onPointerUp)
    canvas.style.cursor = interactive ? 'grab' : 'default'

    const applySize = () => {
      const rect = container.getBoundingClientRect()
      const width = Math.max(1, rect.width)
      const height = Math.max(1, rect.height)
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }
    applySize()
    const resizeObserver = new ResizeObserver(applySize)
    resizeObserver.observe(container)

    const clock = new THREE.Clock()
    let rafId = 0
    const tick = () => {
      const delta = clock.getDelta()
      if (autoRotate && !dragging) yaw += delta * ROTATE_SPEED
      group.rotation.set(pitch, yaw, 0, 'XYZ')
      renderer.render(scene, camera)
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafId)
      resizeObserver.disconnect()
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerup', onPointerUp)
      molRenderer.dispose()
      renderer.dispose()
      // 立即归还 context，池位轮转时不等 GC（审查定论：视图反复切换会累积 context）
      renderer.forceContextLoss()
    }
  }, [molecule, themeId, autoRotate, interactive])

  return (
    <div ref={containerRef} className={className ?? 'h-full w-full'}>
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  )
}
