import type { Molecule } from './molecule'

export interface SceneObject {
  readonly id: string
  readonly molecule: Molecule
  readonly name: string
  readonly visible: boolean
  readonly locked: boolean
  readonly offset: { readonly x: number; readonly y: number; readonly z: number }
  readonly createdAt: number
}

export function createSceneObject(molecule: Molecule, name?: string): SceneObject {
  return {
    id: crypto.randomUUID().slice(0, 8),
    molecule,
    name: name ?? molecule.name ?? 'Molecule',
    visible: true,
    locked: false,
    offset: { x: 0, y: 0, z: 0 },
    createdAt: Date.now(),
  }
}
