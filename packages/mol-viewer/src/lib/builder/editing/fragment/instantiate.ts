import * as THREE from 'three'
import { newAtom, newBond, type Atom } from '../../../molecule'
import type { FragmentDef } from '../../fragmentLibrary'

/** 片段坐标 → 旋转 + 平移后实例化为新原子/键（可跳过指定索引的原子） */
export function instantiate(
  frag: FragmentDef,
  transform: (p: THREE.Vector3) => THREE.Vector3,
  skipIndex = -1,
) {
  const idByIndex = new Map<number, string>()
  const atoms: Atom[] = []
  for (let i = 0; i < frag.atoms.length; i++) {
    if (i === skipIndex) continue
    const fa = frag.atoms[i]
    const p = transform(new THREE.Vector3(fa.x, fa.y, fa.z))
    const baseAtom = newAtom(fa.symbol, p.x, p.y, p.z)
    const coordination = i === frag.attachIndex ? frag.coordination : undefined
    const atom: Atom = coordination ? {
      ...baseAtom,
      coordinationGeometry: coordination.geometryId,
      coordinationNumber: coordination.coordinationNumber,
      coordinationDirections: coordination.directions.map(direction => {
        const endpoint = transform(new THREE.Vector3(
          fa.x + direction[0],
          fa.y + direction[1],
          fa.z + direction[2],
        ))
        const worldDirection = endpoint.sub(p).normalize()
        return [worldDirection.x, worldDirection.y, worldDirection.z] as const
      }),
    } : baseAtom
    idByIndex.set(i, atom.id)
    atoms.push(atom)
  }
  const bonds = frag.bonds
    .filter(b => b.a !== skipIndex && b.b !== skipIndex)
    .map(b => newBond(idByIndex.get(b.a)!, idByIndex.get(b.b)!, b.order))
  return { atoms, bonds, idByIndex }
}
