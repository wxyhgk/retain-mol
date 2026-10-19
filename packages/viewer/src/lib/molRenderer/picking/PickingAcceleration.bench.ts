import { bench, describe } from 'vitest'
import * as THREE from 'three'
import { nonePickingAcceleration } from './PickingAcceleration'

const ATOM_COUNTS = [500, 1_000, 5_000] as const

function createAtomFixture(count: number) {
  const geometry = new THREE.SphereGeometry(0.35, 8, 6)
  const material = new THREE.MeshBasicMaterial()
  const columns = Math.ceil(Math.sqrt(count))
  const candidates: THREE.Object3D[] = []

  for (let index = 0; index < count; index += 1) {
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(
      ((index % columns) - Math.floor(columns / 2)) * 1.1,
      (Math.floor(index / columns) - Math.floor(columns / 2)) * 1.1,
      0,
    )
    mesh.updateMatrixWorld()
    candidates.push(mesh)
  }

  const raycaster = new THREE.Raycaster(new THREE.Vector3(0, 0, 20), new THREE.Vector3(0, 0, -1))
  return () => {
    const selected = nonePickingAcceleration.selectCandidates({
      target: 'atom',
      raycaster,
      candidates,
    })
    raycaster.intersectObjects(selected)
  }
}

describe('atom picking baseline (none acceleration)', () => {
  for (const count of ATOM_COUNTS) {
    bench(`${count} atoms`, createAtomFixture(count))
  }
})
