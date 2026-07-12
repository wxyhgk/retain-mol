import { useEffect, useRef } from 'react'
import { Check, FlipHorizontal2, MousePointer2, Rotate3D } from 'lucide-react'
import * as THREE from 'three'
import { getElementConfig, type Molecule } from '@retainmol/mol-viewer/core'
import type { RuntimeTemplateSite } from '../application/runtimeTemplateBrush'

interface TemplateSitePickerProps {
  molecule: Molecule
  selection: RuntimeTemplateSite | null
  flipped: boolean
  onSelect: (site: RuntimeTemplateSite) => void
  onFlip: () => void
}

export function TemplateSitePicker({ molecule, selection, flipped, onSelect, onFlip }: TemplateSitePickerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const onSelectRef = useRef(onSelect)

  useEffect(() => {
    onSelectRef.current = onSelect
  }, [onSelect])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const width = Math.max(canvas.clientWidth, 280)
    const height = Math.max(canvas.clientHeight, 220)
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(width, height, false)
    renderer.setClearColor(0xffffff, 0)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 1000)
    const group = new THREE.Group()
    scene.add(group)
    scene.add(new THREE.HemisphereLight(0xffffff, 0x8b95a5, 2.4))
    const key = new THREE.DirectionalLight(0xffffff, 2.2)
    key.position.set(4, 6, 8)
    scene.add(key)

    const atomMeshes: THREE.Mesh[] = []
    const bondMeshes: THREE.Mesh[] = []
    const atomById = new Map(molecule.atoms.map(atom => [atom.id, atom]))
    const atomSitePreview = selection?.kind === 'atom'
      ? resolveAtomSitePreview(molecule, selection.atomId)
      : null
    const selectedAtomIds = selection?.kind === 'atom'
      ? new Set(atomSitePreview?.atomIds ?? [selection.atomId])
      : selection?.kind === 'edge'
        ? new Set(molecule.bonds.find(bond => bond.id === selection.bondId)
          ? [molecule.bonds.find(bond => bond.id === selection.bondId)!.atomId1, molecule.bonds.find(bond => bond.id === selection.bondId)!.atomId2]
          : [])
        : new Set<string>()

    for (const bond of molecule.bonds) {
      const a = atomById.get(bond.atomId1)
      const b = atomById.get(bond.atomId2)
      if (!a || !b) continue
      const selectedBond = (selection?.kind === 'edge' && selection.bondId === bond.id)
        || atomSitePreview?.bondId === bond.id
      const mesh = makeBond(a, b, selectedBond ? 0x35b978 : 0x48505a, selectedBond ? 0.12 : 0.085)
      mesh.userData = { type: 'bond', id: bond.id }
      bondMeshes.push(mesh)
      group.add(mesh)
    }
    for (const atom of molecule.atoms) {
      const selectedAtom = selectedAtomIds.has(atom.id)
      const radius = atom.symbol === 'H' ? 0.18 : 0.3
      const geometry = new THREE.SphereGeometry(selectedAtom ? radius * 1.18 : radius, 28, 20)
      const material = new THREE.MeshStandardMaterial({
        color: selectedAtom ? 0x64c58d : getElementConfig(atom.symbol).color,
        roughness: 0.58,
        metalness: 0.02,
        emissive: selectedAtom ? 0x123b25 : 0x000000,
        emissiveIntensity: selectedAtom ? 0.35 : 0,
      })
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.set(atom.x, atom.y, atom.z)
      mesh.userData = { type: 'atom', id: atom.id }
      if (selectedAtom) {
        const halo = new THREE.Mesh(
          new THREE.SphereGeometry(radius * 1.42, 24, 18),
          new THREE.MeshBasicMaterial({ color: 0x35b978, transparent: true, opacity: 0.28, depthWrite: false }),
        )
        halo.userData = { type: 'selection-halo' }
        mesh.add(halo)
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
    const onPointerDown = (event: PointerEvent) => {
      down.set(event.clientX, event.clientY)
      lastX = event.clientX
      lastY = event.clientY
      dragging = true
      canvas.setPointerCapture(event.pointerId)
    }
    const onPointerMove = (event: PointerEvent) => {
      if (!dragging) return
      const dx = event.clientX - lastX
      const dy = event.clientY - lastY
      if (Math.hypot(event.clientX - down.x, event.clientY - down.y) > 4) {
        group.rotation.y += dx * 0.01
        group.rotation.x += dy * 0.01
        render()
      }
      lastX = event.clientX
      lastY = event.clientY
    }
    const onPointerUp = (event: PointerEvent) => {
      dragging = false
      if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId)
      if (Math.hypot(event.clientX - down.x, event.clientY - down.y) > 4) return
      raycaster.setFromCamera(pointer(event), camera)
      const atomHit = raycaster.intersectObjects(atomMeshes)[0]
      if (atomHit) {
        onSelectRef.current({ kind: 'atom', atomId: atomHit.object.userData.id })
        return
      }
      const bondHit = raycaster.intersectObjects(bondMeshes)[0]
      if (bondHit) onSelectRef.current({ kind: 'edge', bondId: bondHit.object.userData.id })
    }
    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerup', onPointerUp)
    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerup', onPointerUp)
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
    <div className="space-y-3">
      <div className="grid grid-cols-[auto_1fr_auto_1fr_auto] items-center gap-1" aria-label="模板连接步骤">
        <StepNumber active done label="模板" number="1" />
        <span className="h-px bg-gray-200" />
        <StepNumber active={!selection} done={Boolean(selection)} label="选位点" number="2" />
        <span className="h-px bg-gray-200" />
        <StepNumber active={Boolean(selection)} done={false} label="画布连接" number="3" />
      </div>

      <div className="overflow-hidden rounded border border-border bg-muted">
        <div className="flex h-9 items-center justify-between border-b border-gray-200 bg-white px-2.5">
          <div className="flex min-w-0 items-center gap-1.5 text-[10px] text-gray-500">
            <MousePointer2 size={12} className="shrink-0" />
            <span className="truncate">点原子连接 · 点键并环</span>
          </div>
          <button
            type="button"
            onClick={onFlip}
            title="翻转模板连接方向"
            aria-pressed={flipped}
            className="flex h-7 shrink-0 items-center gap-1 rounded px-2 text-[10px] font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <FlipHorizontal2 size={13} />
            {flipped ? '已翻转' : '翻转'}
          </button>
        </div>
        <div className="relative">
          <canvas ref={canvasRef} className="block h-[220px] w-full cursor-grab touch-none active:cursor-grabbing" />
          <div className="pointer-events-none absolute bottom-2 right-2 flex items-center gap-1 rounded bg-white/85 px-1.5 py-1 text-[9px] text-gray-400 shadow-sm backdrop-blur-sm">
            <Rotate3D size={11} />拖动旋转
          </div>
        </div>
      </div>

      <div className={selection ? 'border-l-2 border-primary bg-primary px-2.5 py-2 text-primary-foreground' : 'border-l-2 border-border bg-muted px-2.5 py-2'}>
        <div className={selection ? 'flex items-center gap-1.5 text-[11px] font-semibold text-primary-foreground' : 'text-[11px] font-semibold text-foreground'}>
          {selection && <Check size={13} />}
          {selection ? (selection.kind === 'atom' ? '原子位点已就绪' : '并环边已就绪') : '选择连接位点'}
        </div>
        <div className={selection ? 'mt-0.5 text-[10px] leading-4 text-primary-foreground/70' : 'mt-0.5 text-[10px] leading-4 text-muted-foreground'}>
          {selection
            ? (selection.kind === 'atom' ? '现在去主画布点击目标原子完成连接。' : '现在去主画布点击目标键完成并环。')
            : '在上方预览中点击一个原子，或点击一根环边。'}
        </div>
      </div>
    </div>
  )
}

function StepNumber({ number, label, active, done }: { number: string; label: string; active: boolean; done: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className={done
        ? 'flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[9px] font-semibold text-primary-foreground'
        : active
          ? 'flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-[9px] font-semibold text-white'
          : 'flex h-5 w-5 items-center justify-center rounded-full border border-gray-300 bg-white text-[9px] font-semibold text-gray-400'}>
        {done ? <Check size={11} /> : number}
      </span>
      <span className={active || done ? 'whitespace-nowrap text-[9px] font-medium text-gray-700' : 'whitespace-nowrap text-[9px] text-gray-400'}>{label}</span>
    </div>
  )
}

function makeBond(a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }, color: number, radius: number) {
  const start = new THREE.Vector3(a.x, a.y, a.z)
  const end = new THREE.Vector3(b.x, b.y, b.z)
  const direction = end.clone().sub(start)
  const geometry = new THREE.CylinderGeometry(radius, radius, direction.length(), 16)
  const material = new THREE.MeshStandardMaterial({ color, roughness: 0.62 })
  const mesh = new THREE.Mesh(geometry, material)
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
