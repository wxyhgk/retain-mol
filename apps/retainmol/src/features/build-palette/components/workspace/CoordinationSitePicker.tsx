import { useEffect, useRef } from 'react'
import { ArrowLeft, Check, MousePointer2, Rotate3D } from 'lucide-react'
import * as THREE from 'three'
import type { FragmentAttachmentSite } from '@retainmol/mol-viewer/fragments'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { AttachmentSitePickerModel } from '../../domain/attachmentSiteOptions'

interface CoordinationSitePickerProps {
  model: AttachmentSitePickerModel
  siteOptions: readonly FragmentAttachmentSite[]
  selectedSiteId: string | null
  onSelect: (siteId: string) => void
  onBack: () => void
}

const BOND_LENGTH = 2.15
const CENTER_RADIUS = 0.34
const SITE_RADIUS = 0.2

export function CoordinationSitePicker({
  model,
  siteOptions,
  selectedSiteId,
  onSelect,
  onBack,
}: CoordinationSitePickerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const onSelectRef = useRef(onSelect)
  const rotationRef = useRef(
    new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.22, 0.42, 0)),
  )

  useEffect(() => {
    onSelectRef.current = onSelect
  }, [onSelect])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearAlpha(0)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100)
    camera.position.set(0, 0, 7.2)
    camera.lookAt(0, 0, 0)

    const root = new THREE.Group()
    const savedRotation = rotationRef.current
    root.quaternion.copy(savedRotation)
    scene.add(root)

    const styles = getComputedStyle(document.documentElement)
    const foreground = colorFromToken(styles, '--foreground')
    const mutedForeground = colorFromToken(styles, '--muted-foreground')
    const primary = colorFromToken(styles, '--primary')
    const background = colorFromToken(styles, '--background')

    scene.add(new THREE.HemisphereLight(background, mutedForeground, 2.6))
    const keyLight = new THREE.DirectionalLight(foreground, 2.8)
    keyLight.position.set(4, 6, 8)
    scene.add(keyLight)
    const fillLight = new THREE.DirectionalLight(foreground, 1.2)
    fillLight.position.set(-5, -2, 4)
    scene.add(fillLight)

    const center = new THREE.Mesh(
      new THREE.SphereGeometry(CENTER_RADIUS, 32, 24),
      new THREE.MeshStandardMaterial({
        color: foreground,
        roughness: 0.38,
        metalness: 0.14,
      }),
    )
    root.add(center)

    const endpointMeshes: THREE.Mesh[] = []
    for (const site of model.sites) {
      const direction = new THREE.Vector3(...site.direction).normalize()
      const endpoint = direction.clone().multiplyScalar(BOND_LENGTH)
      const selected = sitesAreEquivalent(site, model.sites.find(candidate => candidate.id === selectedSiteId))
      const bondColor = selected ? primary : mutedForeground

      addBond(root, direction, site.bondOrder, bondColor)

      const endpointMesh = new THREE.Mesh(
        new THREE.SphereGeometry(selected ? SITE_RADIUS * 1.14 : SITE_RADIUS, 28, 20),
        new THREE.MeshStandardMaterial({
          color: selected ? primary : foreground,
          roughness: 0.42,
          metalness: 0.06,
          emissive: selected ? primary : background,
          emissiveIntensity: selected ? 0.16 : 0,
        }),
      )
      endpointMesh.position.copy(endpoint)
      endpointMesh.userData.siteId = site.id
      endpointMeshes.push(endpointMesh)
      root.add(endpointMesh)

      if (selected) {
        const halo = new THREE.Mesh(
          new THREE.SphereGeometry(SITE_RADIUS * 1.48, 24, 18),
          new THREE.MeshBasicMaterial({
            color: primary,
            transparent: true,
            opacity: 0.22,
            depthWrite: false,
          }),
        )
        endpointMesh.add(halo)
      }
    }

    const render = () => renderer.render(scene, camera)
    const resize = () => {
      const width = Math.max(canvas.clientWidth, 1)
      const height = Math.max(canvas.clientHeight, 1)
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      render()
    }
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas)
    resize()

    const raycaster = new THREE.Raycaster()
    const pointerDownAt = new THREE.Vector2()
    let dragging = false
    let lastX = 0
    let lastY = 0
    const horizontalRotation = new THREE.Quaternion()
    const verticalRotation = new THREE.Quaternion()
    const worldUp = new THREE.Vector3(0, 1, 0)
    const screenRight = new THREE.Vector3(1, 0, 0)

    const normalizedPointer = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect()
      return new THREE.Vector2(
        ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
        -((event.clientY - bounds.top) / bounds.height) * 2 + 1,
      )
    }
    const pointerDown = (event: PointerEvent) => {
      pointerDownAt.set(event.clientX, event.clientY)
      lastX = event.clientX
      lastY = event.clientY
      dragging = true
      canvas.setPointerCapture(event.pointerId)
    }
    const pointerMove = (event: PointerEvent) => {
      if (!dragging) return
      const dx = event.clientX - lastX
      const dy = event.clientY - lastY
      if (Math.hypot(event.clientX - pointerDownAt.x, event.clientY - pointerDownAt.y) > 4) {
        horizontalRotation.setFromAxisAngle(worldUp, dx * 0.01)
        verticalRotation.setFromAxisAngle(screenRight, dy * 0.01)
        root.quaternion.premultiply(horizontalRotation).premultiply(verticalRotation).normalize()
        render()
      }
      lastX = event.clientX
      lastY = event.clientY
    }
    const pointerUp = (event: PointerEvent) => {
      if (!dragging) return
      dragging = false
      if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId)
      if (Math.hypot(event.clientX - pointerDownAt.x, event.clientY - pointerDownAt.y) > 4) return

      raycaster.setFromCamera(normalizedPointer(event), camera)
      const hit = raycaster.intersectObjects(endpointMeshes, false)[0]
      const siteId = hit?.object.userData.siteId
      if (typeof siteId === 'string') onSelectRef.current(siteId)
    }
    const pointerCancel = (event: PointerEvent) => {
      dragging = false
      if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId)
    }

    canvas.addEventListener('pointerdown', pointerDown)
    canvas.addEventListener('pointermove', pointerMove)
    canvas.addEventListener('pointerup', pointerUp)
    canvas.addEventListener('pointercancel', pointerCancel)

    return () => {
      savedRotation.copy(root.quaternion)
      resizeObserver.disconnect()
      canvas.removeEventListener('pointerdown', pointerDown)
      canvas.removeEventListener('pointermove', pointerMove)
      canvas.removeEventListener('pointerup', pointerUp)
      canvas.removeEventListener('pointercancel', pointerCancel)
      root.traverse(object => {
        if (!(object as THREE.Mesh).isMesh) return
        const mesh = object as THREE.Mesh
        mesh.geometry.dispose()
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
        materials.forEach(material => material.dispose())
      })
      renderer.dispose()
    }
  }, [model, selectedSiteId])

  return (
    <div data-coordination-site-picker className="flex h-full min-h-0 flex-col gap-3 overflow-hidden">
      <div className="flex shrink-0 items-center gap-2 border-b border-border pb-3">
        <Button type="button" variant="ghost" size="icon" onClick={onBack} className="h-8 w-8" title="返回">
          <ArrowLeft />
          <span className="sr-only">返回</span>
        </Button>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-foreground">{model.name}</h3>
          <p className="mt-0.5 truncate font-mono text-[10px] text-muted-foreground">
            {model.element} · {model.geometryId}{model.pointGroup ? ` · ${model.pointGroup}` : ''}
          </p>
        </div>
      </div>

      <div className="shrink-0 overflow-hidden rounded-md border border-border bg-card">
        <div className="flex h-9 items-center gap-1.5 border-b border-border bg-muted px-2.5 text-[10px] text-muted-foreground">
          <MousePointer2 size={12} />
          <span>点击端点后立即启用该连接位点</span>
        </div>
        <div className="relative">
          <canvas
            ref={canvasRef}
            aria-label={`${model.name} 连接位点三维预览`}
            className="block h-[min(260px,32vh)] min-h-[180px] w-full cursor-grab touch-none bg-background active:cursor-grabbing"
          />
          <div className="pointer-events-none absolute bottom-2 right-2 flex items-center gap-1 rounded bg-card/90 px-1.5 py-1 text-[9px] text-muted-foreground shadow-sm">
            <Rotate3D size={11} />拖动旋转
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-md border border-border bg-card [scrollbar-color:currentColor_transparent] [scrollbar-width:thin]" aria-label="连接位点列表">
        {siteOptions.map((site, index) => {
          const selected = sitesAreEquivalent(site, model.sites.find(candidate => candidate.id === selectedSiteId))
          const equivalentCount = model.sites.filter(candidate => sitesAreEquivalent(site, candidate)).length
          return (
            <button
              key={site.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onSelect(site.id)}
              className={cn(
                'flex min-h-12 w-full items-center gap-2.5 px-3 text-left transition-colors hover:bg-accent hover:text-accent-foreground',
                index > 0 && 'border-t border-border',
                selected && 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground',
              )}
            >
              <span className={cn(
                'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border text-[9px] font-semibold',
                selected && 'border-primary-foreground/40 bg-primary-foreground text-primary',
              )}>
                {selected ? <Check size={12} /> : index + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[11px] font-semibold">{site.label.replace(/\s+\d+$/, '')}</span>
                <span className={cn('mt-0.5 block truncate font-mono text-[9px] text-muted-foreground', selected && 'text-primary-foreground/70')}>
                  {site.bondOrder === 1 ? '单键' : site.bondOrder === 2 ? '双键' : '三键'} · {equivalentCount} 个等价位点
                </span>
              </span>
            </button>
          )
        })}
      </div>

    </div>
  )
}

function sitesAreEquivalent(
  left: FragmentAttachmentSite,
  right: FragmentAttachmentSite | undefined,
) {
  return right !== undefined &&
    left.equivalenceGroup === right.equivalenceGroup &&
    left.bondOrder === right.bondOrder
}

function addBond(group: THREE.Group, direction: THREE.Vector3, order: 1 | 2 | 3, color: THREE.Color) {
  const perpendicular = new THREE.Vector3()
    .crossVectors(direction, Math.abs(direction.z) < 0.9 ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(0, 1, 0))
    .normalize()
  const offsets = order === 1 ? [0] : order === 2 ? [-0.085, 0.085] : [-0.12, 0, 0.12]

  for (const offset of offsets) {
    const start = direction.clone().multiplyScalar(CENTER_RADIUS * 0.74).addScaledVector(perpendicular, offset)
    const end = direction.clone().multiplyScalar(BOND_LENGTH - SITE_RADIUS * 0.72).addScaledVector(perpendicular, offset)
    const delta = end.clone().sub(start)
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.035, delta.length(), 12),
      new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.04 }),
    )
    mesh.position.copy(start).add(end).multiplyScalar(0.5)
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize())
    group.add(mesh)
  }
}

function colorFromToken(styles: CSSStyleDeclaration, token: string) {
  const [h = 0, s = 0, l = 0] = styles.getPropertyValue(token).trim().match(/[\d.]+/g)?.map(Number) ?? []
  return new THREE.Color().setHSL(h / 360, s / 100, l / 100)
}
