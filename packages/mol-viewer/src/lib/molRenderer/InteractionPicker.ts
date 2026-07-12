import * as THREE from 'three'

type MeshMap = () => Map<string, THREE.Mesh>
type BondMap = () => Map<string, THREE.Group>

export function isInteractionObjectPickable(object: THREE.Object3D): boolean {
  let current: THREE.Object3D | null = object
  while (current) {
    if (!current.visible) return false
    if ((current as THREE.Scene).isScene) break
    current = current.parent
  }
  return true
}

export function collectPickableBondObjects(groups: Iterable<THREE.Group>): THREE.Object3D[] {
  const objects: THREE.Object3D[] = []
  for (const group of groups) {
    group.traverse(child => {
      if (
        (child as THREE.Mesh).isMesh
        && child.userData.type === 'bond'
        && typeof child.userData.id === 'string'
        && isInteractionObjectPickable(child)
      ) objects.push(child)
    })
  }
  return objects
}

/**
 * Canvas-space picking for molecule interactions.
 *
 * This class deliberately knows nothing about gestures or editor commands. It
 * only translates client coordinates into rays and resolves visible atoms and
 * bonds, giving every interaction path the same picking semantics.
 */
export class InteractionPicker {
  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly camera: THREE.PerspectiveCamera,
    private readonly getAtomMeshes: MeshMap,
    private readonly getBondMeshes: BondMap,
  ) {}

  raycasterAt(clientX: number, clientY: number): THREE.Raycaster {
    const rect = this.canvas.getBoundingClientRect()
    const pointer = new THREE.Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1,
    )
    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(pointer, this.camera)
    return raycaster
  }

  atomHitAt(clientX: number, clientY: number): THREE.Intersection<THREE.Object3D> | null {
    return this.raycasterAt(clientX, clientY).intersectObjects(this.pickableAtoms())[0] ?? null
  }

  atomIdAt(clientX: number, clientY: number): string | null {
    return this.atomHitAt(clientX, clientY)?.object.userData.id ?? null
  }

  bondIdAt(clientX: number, clientY: number): string | null {
    const hit = this.raycasterAt(clientX, clientY).intersectObjects(this.pickableBonds())[0]
    return hit?.object.userData.id ?? null
  }

  private pickableAtoms(): THREE.Object3D[] {
    return [...this.getAtomMeshes().values()].filter(isInteractionObjectPickable)
  }

  private pickableBonds(): THREE.Object3D[] {
    return collectPickableBondObjects(this.getBondMeshes().values())
  }
}
