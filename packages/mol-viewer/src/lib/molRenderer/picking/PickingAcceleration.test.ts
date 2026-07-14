import { describe, expect, it, vi } from 'vitest'
import * as THREE from 'three'
import {
  NonePickingAcceleration,
  type PickingAcceleration,
} from './PickingAcceleration'
import { InteractionPicker } from '../InteractionPicker'

class FakeCanvas {
  getBoundingClientRect() {
    return { left: 0, top: 0, width: 100, height: 100 }
  }
}

function atom(id: string, x: number) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.5), new THREE.MeshBasicMaterial())
  mesh.position.set(x, 0, 0)
  mesh.userData.id = id
  mesh.updateMatrixWorld()
  return mesh
}

describe('NonePickingAcceleration', () => {
  it('returns the original candidate array unchanged', () => {
    const candidates = [new THREE.Object3D(), new THREE.Object3D()]

    expect(new NonePickingAcceleration().selectCandidates({
      target: 'atom',
      raycaster: new THREE.Raycaster(),
      candidates,
    })).toBe(candidates)
  })
})

describe('InteractionPicker acceleration boundary', () => {
  it('passes selected atom candidates to Three.js for final hit resolution', () => {
    const first = atom('a1', 0)
    const second = atom('a2', 3)
    const selectCandidates = vi.fn(({ candidates }: { candidates: THREE.Object3D[] }) => candidates.slice(0, 1))
    const acceleration: PickingAcceleration = { id: 'first-only', selectCandidates }
    const camera = new THREE.PerspectiveCamera()
    const picker = new InteractionPicker(
      new FakeCanvas() as unknown as HTMLCanvasElement,
      camera,
      () => new Map([[first.userData.id as string, first], [second.userData.id as string, second]]),
      () => new Map(),
      acceleration,
    )
    vi.spyOn(picker, 'raycasterAt').mockReturnValue(new THREE.Raycaster(
      new THREE.Vector3(0, 0, 5),
      new THREE.Vector3(0, 0, -1),
    ))
    const intersectObjects = vi.spyOn(THREE.Raycaster.prototype, 'intersectObjects').mockReturnValue([
      {
        distance: 1,
        point: new THREE.Vector3(),
        object: first,
      },
    ])

    expect(picker.atomIdAt(50, 50)).toBe('a1')
    expect(selectCandidates).toHaveBeenCalledWith(expect.objectContaining({
      target: 'atom',
      candidates: [first, second],
    }))
    expect(intersectObjects).toHaveBeenCalledWith([first])

    first.geometry.dispose()
    ;(first.material as THREE.Material).dispose()
    second.geometry.dispose()
    ;(second.material as THREE.Material).dispose()
  })
})
