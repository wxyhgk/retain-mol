import { useEffect, useRef } from 'react'
import { Check, FlipHorizontal2, MousePointer2, Rotate3D } from 'lucide-react'
import * as THREE from 'three'
import { getElementConfig, type Molecule } from '@retainmol/mol-viewer/core'
import type { RuntimeTemplateSite } from '../../application/runtimeTemplateBrush'

export function WorkspaceTemplateSiteCanvas({
  molecule,
  selection,
  flipped,
  onSelect,
  onFlip,
}: {
  molecule: Molecule
  selection: RuntimeTemplateSite | null
  flipped: boolean
  onSelect: (site: RuntimeTemplateSite) => void
  onFlip: () => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const onSelectRef = useRef(onSelect)

  useEffect(() => { onSelectRef.current = onSelect }, [onSelect])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const width = Math.max(canvas.clientWidth, 280)
    const height = Math.max(canvas.clientHeight, 240)
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(width, height, false)
    renderer.setClearColor(0x0f172a, 0)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 1000)
    const group = new THREE.Group()
    scene.add(group)
    scene.add(new THREE.HemisphereLight(0xffffff, 0x334155, 2.2))
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.4)
    keyLight.position.set(4, 6, 8)
    scene.add(keyLight)

    const atomMeshes: THREE.Mesh[] = []
    const bondMeshes: THREE.Mesh[] = []
    const atomById = new Map(molecule.atoms.map(atom => [atom.id, atom]))
    const atomPreview = selection?.kind === 'atom' ? resolveAtomSitePreview(molecule, selection.atomId) : null
    const selectedAtomIds = selection?.kind === 'atom'
      ? new Set(atomPreview?.atomIds ?? [selection.atomId])
      : selection?.kind === 'edge'
        ? new Set((() => {
            const bond = molecule.bonds.find(candidate => candidate.id === selection.bondId)
            return bond ? [bond.atomId1, bond.atomId2] : []
          })())
        : new Set<string>()

    for (const bond of molecule.bonds) {
      const first = atomById.get(bond.atomId1)
      const second = atomById.get(bond.atomId2)
      if (!first || !second) continue
      const active = (selection?.kind === 'edge' && selection.bondId === bond.id) || atomPreview?.bondId === bond.id
      const mesh = makeBond(first, second, active ? 0x38bdf8 : 0x64748b, active ? 0.12 : 0.08)
      mesh.userData = { type: 'bond', id: bond.id }
      bondMeshes.push(mesh)
      group.add(mesh)
    }

    for (const atom of molecule.atoms) {
      const active = selectedAtomIds.has(atom.id)
      const radius = atom.symbol === 'H' ? 0.18 : 0.3
      const material = new THREE.MeshStandardMaterial({
        color: active ? 0x38bdf8 : getElementConfig(atom.symbol).color,
        roughness: 0.52,
        metalness: 0.02,
        emissive: active ? 0x082f49 : 0x000000,
        emissiveIntensity: active ? 0.45 : 0,
      })
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(active ? radius * 1.16 : radius, 28, 20), material)
      mesh.position.set(atom.x, atom.y, atom.z)
      mesh.userData = { type: 'atom', id: atom.id }
      if (active) {
        mesh.add(new THREE.Mesh(
          new THREE.SphereGeometry(radius * 1.42, 24, 18),
          new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.2, depthWrite: false }),
        ))
      }
      atomMeshes.push(mesh)
      group.add(mesh)
    }

    const bounds = new THREE.Box3().setFromObject(group)
    const center = bounds.getCenter(new THREE.Vector3())
    const size = bounds.getSize(new THREE.Vector3())
    group.position.sub(center)
    group.rotation.y = flipped ? Math.PI : 0
    camera.position.set(0, 0, Math.max(size.length() * 1.45, 4.5))
    camera.lookAt(0, 0, 0)

    const render = () => renderer.render(scene, camera)
    render()
    const raycaster = new THREE.Raycaster()
    const down = new THREE.Vector2()
    let dragging = false
    let lastX = 0
    let lastY = 0
    const pointer = (event: PointerEvent) => new THREE.Vector2(
      ((event.clientX - canvas.getBoundingClientRect().left) / canvas.getBoundingClientRect().width) * 2 - 1,
      -((event.clientY - canvas.getBoundingClientRect().top) / canvas.getBoundingClientRect().height) * 2 + 1,
    )
    const pointerDown = (event: PointerEvent) => {
      down.set(event.clientX, event.clientY)
      lastX = event.clientX
      lastY = event.clientY
      dragging = true
      canvas.setPointerCapture(event.pointerId)
    }
    const pointerMove = (event: PointerEvent) => {
      if (!dragging) return
      if (Math.hypot(event.clientX - down.x, event.clientY - down.y) > 4) {
        group.rotation.y += (event.clientX - lastX) * 0.01
        group.rotation.x += (event.clientY - lastY) * 0.01
        render()
      }
      lastX = event.clientX
      lastY = event.clientY
    }
    const pointerUp = (event: PointerEvent) => {
      dragging = false
      if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId)
      if (Math.hypot(event.clientX - down.x, event.clientY - down.y) > 4) return
      raycaster.setFromCamera(pointer(event), camera)
      const atomHit = raycaster.intersectObjects(atomMeshes)[0]
      if (atomHit) return onSelectRef.current({ kind: 'atom', atomId: atomHit.object.userData.id })
      const bondHit = raycaster.intersectObjects(bondMeshes)[0]
      if (bondHit) onSelectRef.current({ kind: 'edge', bondId: bondHit.object.userData.id })
    }
    canvas.addEventListener('pointerdown', pointerDown)
    canvas.addEventListener('pointermove', pointerMove)
    canvas.addEventListener('pointerup', pointerUp)
    return () => {
      canvas.removeEventListener('pointerdown', pointerDown)
      canvas.removeEventListener('pointermove', pointerMove)
      canvas.removeEventListener('pointerup', pointerUp)
      group.traverse(object => {
        if (!(object as THREE.Mesh).isMesh) return
        const mesh = object as THREE.Mesh
        mesh.geometry.dispose()
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
        materials.forEach(material => material.dispose())
      })
      renderer.dispose()
    }
  }, [flipped, molecule, selection])

  return (
    <div className="space-y-2.5">
      <div className="overflow-hidden rounded-md border border-border bg-background">
        <div className="flex h-9 items-center justify-between border-b border-border px-2.5">
          <div className="flex min-w-0 items-center gap-1.5 text-[10px] text-muted-foreground">
            <MousePointer2 size={12} />
            <span className="truncate">点原子连接 · 点键并环</span>
          </div>
          <button
            type="button"
            onClick={onFlip}
            aria-pressed={flipped}
            className="flex h-7 items-center gap-1 rounded-md px-2 text-[10px] font-medium text-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <FlipHorizontal2 size={13} />{flipped ? '已翻转' : '翻转'}
          </button>
        </div>
        <div className="relative">
          <canvas ref={canvasRef} className="block h-[240px] w-full cursor-grab touch-none active:cursor-grabbing" />
          <div className="pointer-events-none absolute bottom-2 right-2 flex items-center gap-1 rounded bg-white/90 px-1.5 py-1 text-[9px] text-muted-foreground">
            <Rotate3D size={11} />拖动旋转
          </div>
        </div>
      </div>
      <div className={selection ? 'border-l-2 border-primary bg-primary px-2.5 py-2 text-primary-foreground' : 'border-l-2 border-border bg-background px-2.5 py-2'}>
        <div className={selection ? 'flex items-center gap-1.5 text-[11px] font-semibold text-primary-foreground' : 'text-[11px] font-semibold text-foreground'}>
          {selection && <Check size={13} />}
          {selection ? (selection.kind === 'atom' ? '原子连接位点已启用' : '并环边已启用') : '选择模板位点'}
        </div>
        <p className={selection ? 'mt-0.5 text-[10px] leading-4 text-primary-foreground/70' : 'mt-0.5 text-[10px] leading-4 text-muted-foreground'}>
          {selection
            ? (selection.kind === 'atom' ? '现在去主画布点击目标原子完成连接。' : '现在去主画布点击目标键完成并环。')
            : '在预览中点击一个原子，或点击一根环边。'}
        </p>
      </div>
    </div>
  )
}

function makeBond(first: { x: number; y: number; z: number }, second: { x: number; y: number; z: number }, color: number, radius: number) {
  const start = new THREE.Vector3(first.x, first.y, first.z)
  const end = new THREE.Vector3(second.x, second.y, second.z)
  const direction = end.clone().sub(start)
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, direction.length(), 16),
    new THREE.MeshStandardMaterial({ color, roughness: 0.58 }),
  )
  mesh.position.copy(start).add(end).multiplyScalar(0.5)
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize())
  return mesh
}

function resolveAtomSitePreview(molecule: Molecule, atomId: string): { atomIds: string[]; bondId?: string } {
  const selected = molecule.atoms.find(atom => atom.id === atomId)
  if (!selected) return { atomIds: [atomId] }
  const bonds = molecule.bonds.filter(bond => bond.atomId1 === atomId || bond.atomId2 === atomId)
  if (selected.symbol === 'H') {
    const bond = bonds[0]
    const neighborId = bond ? (bond.atomId1 === atomId ? bond.atomId2 : bond.atomId1) : undefined
    return neighborId ? { atomIds: [atomId, neighborId], bondId: bond.id } : { atomIds: [atomId] }
  }
  const hydrogenBond = bonds.find(bond => {
    const neighborId = bond.atomId1 === atomId ? bond.atomId2 : bond.atomId1
    return molecule.atoms.some(atom => atom.id === neighborId && atom.symbol === 'H')
  })
  if (!hydrogenBond) return { atomIds: [atomId] }
  const hydrogenId = hydrogenBond.atomId1 === atomId ? hydrogenBond.atomId2 : hydrogenBond.atomId1
  return { atomIds: [atomId, hydrogenId], bondId: hydrogenBond.id }
}
