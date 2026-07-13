import { newAtom, newBond, type Atom, type Bond } from '../../../molecule'
import type { FragmentDef } from '../../fragmentLibrary'
import { normalize, sub, type Vec3 } from '../../math'

/** 片段坐标 → 旋转 + 平移后实例化为新原子/键（可跳过指定索引的原子） */
export function instantiate(
  frag: FragmentDef,
  transform: (p: Vec3) => Vec3,
  skipIndex = -1,
) {
  const idByIndex = new Map<number, string>()
  const atoms: Atom[] = []
  for (const [i, fa] of frag.atoms.entries()) {
    if (i === skipIndex) continue
    const p = transform([fa.x, fa.y, fa.z])
    const baseAtom = newAtom(fa.symbol, p[0], p[1], p[2])
    const coordination = i === frag.attachIndex ? frag.coordination : undefined
    const atom: Atom = coordination ? {
      ...baseAtom,
      coordinationGeometry: coordination.geometryId,
      coordinationNumber: coordination.coordinationNumber,
      coordinationDirections: coordination.directions.map(direction => {
        const endpoint = transform([
          fa.x + direction[0],
          fa.y + direction[1],
          fa.z + direction[2],
        ])
        const worldDirection = normalize(sub(endpoint, p))
        return [worldDirection[0], worldDirection[1], worldDirection[2]] as const
      }),
      coordinationSites: coordination.sites.map(site => {
        const endpoint = transform([
          fa.x + site.direction[0],
          fa.y + site.direction[1],
          fa.z + site.direction[2],
        ])
        const worldDirection = normalize(sub(endpoint, p))
        return {
          ...site,
          direction: [worldDirection[0], worldDirection[1], worldDirection[2]] as const,
        }
      }),
    } : baseAtom
    idByIndex.set(i, atom.id)
    atoms.push(atom)
  }
  const bonds: Bond[] = []
  for (const fragmentBond of frag.bonds) {
    if (fragmentBond.a === skipIndex || fragmentBond.b === skipIndex) continue
    const atomId1 = idByIndex.get(fragmentBond.a)
    const atomId2 = idByIndex.get(fragmentBond.b)
    if (atomId1 === undefined || atomId2 === undefined) {
      throw new Error(`${frag.name}: 模板键引用了未实例化的原子`)
    }
    const bond = newBond(atomId1, atomId2, fragmentBond.order)
    if (!fragmentBond.coordinationSiteId) {
      bonds.push(bond)
      continue
    }
    const coordinationAtomId = fragmentBond.a === frag.attachIndex
      ? atomId1
      : fragmentBond.b === frag.attachIndex
        ? atomId2
        : undefined
    bonds.push(coordinationAtomId ? {
      ...bond,
      coordinationSites: [{ atomId: coordinationAtomId, siteId: fragmentBond.coordinationSiteId }],
    } : bond)
  }
  return { atoms, bonds, idByIndex }
}
