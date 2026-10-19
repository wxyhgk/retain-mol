import * as THREE from 'three'

export function disposeObject3D(root: THREE.Object3D) {
  root.traverse(object => {
    const renderable = object as THREE.Object3D & {
      geometry?: THREE.BufferGeometry
      material?: THREE.Material | THREE.Material[]
    }
    renderable.geometry?.dispose()
    if (!renderable.material) return
    const materials = Array.isArray(renderable.material)
      ? renderable.material
      : [renderable.material]
    materials.forEach(material => material?.dispose())
  })
}
