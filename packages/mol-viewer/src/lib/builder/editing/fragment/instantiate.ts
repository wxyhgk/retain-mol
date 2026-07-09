import * as THREE from 'three'
import { newAtom, newBond } from '../../../molecule'
import type { FragmentDef } from '../../fragmentLibrary'

/** 片段坐标 → 旋转 + 平移后实例化为新原子/键（可跳过指定索引的原子） */
export function instantiate(
  frag: FragmentDef,
  transform: (p: THREE.Vector3) => THREE.Vector3,
  skipIndex = -1,
) {
  const idByIndex = new Map<number, string>()
  const atoms = []
  for (let i = 0; i < frag.atoms.length; i++) {
    if (i === skipIndex) continue
    const fa = frag.atoms[i]
    const p = transform(new THREE.Vector3(fa.x, fa.y, fa.z))
    const atom = newAtom(fa.symbol, p.x, p.y, p.z)
    idByIndex.set(i, atom.id)
    atoms.push(atom)
  }
  const bonds = frag.bonds
    .filter(b => b.a !== skipIndex && b.b !== skipIndex)
    .map(b => newBond(idByIndex.get(b.a)!, idByIndex.get(b.b)!, b.order))
  return { atoms, bonds, idByIndex }
}
