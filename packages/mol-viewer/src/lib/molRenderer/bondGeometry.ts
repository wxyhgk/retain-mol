import * as THREE from 'three'
import type { Atom, Bond } from '../molecule'

/**
 * 3Dmol.js 方式：用邻居原子确定双/三键偏移方向，使双键在分子平面内展开。
 * 算法：找 a1（或 a2）最不共线的邻居，计算 (neighbor_dir × bond_dir) × bond_dir，
 * 即邻居方向在键法线平面内的分量 → 偏移方向在分子平面内，化学上正确。
 */
export function getSideBondPerp(
  a1: Atom, a2: Atom, dirHat: THREE.Vector3,
  atomById?: Map<string, Atom>, allBonds?: readonly Bond[],
): THREE.Vector3 {
  const p1 = new THREE.Vector3(a1.x, a1.y, a1.z)
  const p2 = new THREE.Vector3(a2.x, a2.y, a2.z)
  let bestV = new THREE.Vector3()
  let bestLen = 0

  if (atomById && allBonds) {
    // 优先用 a1 的邻居
    for (const bond of allBonds) {
      let nid: string | null = null
      if (bond.atomId1 === a1.id && bond.atomId2 !== a2.id) nid = bond.atomId2
      else if (bond.atomId2 === a1.id && bond.atomId1 !== a2.id) nid = bond.atomId1
      if (!nid) continue
      const nb = atomById.get(nid)
      if (!nb) continue
      const d = new THREE.Vector3(nb.x - p1.x, nb.y - p1.y, nb.z - p1.z)
      const v = d.clone().cross(dirHat)
      const l = v.lengthSq()
      if (l > bestLen) { bestLen = l; bestV = v.clone() }
    }
    // a1 无其他邻居，改用 a2 的邻居
    if (bestLen < 0.001) {
      for (const bond of allBonds) {
        let nid: string | null = null
        if (bond.atomId1 === a2.id && bond.atomId2 !== a1.id) nid = bond.atomId2
        else if (bond.atomId2 === a2.id && bond.atomId1 !== a1.id) nid = bond.atomId1
        if (!nid) continue
        const nb = atomById.get(nid)
        if (!nb) continue
        const d = new THREE.Vector3(nb.x - p2.x, nb.y - p2.y, nb.z - p2.z)
        const v = d.clone().cross(dirHat)
        const l = v.lengthSq()
        if (l > bestLen) { bestLen = l; bestV = v.clone() }
      }
    }
  }

  if (bestLen > 0.001) {
    // (neighbor × bond) × bond = 邻居方向在键垂直平面内的分量（在分子平面内）
    bestV.cross(dirHat)
  } else {
    // 孤立键（无邻居），回退到任意垂直方向
    bestV.crossVectors(dirHat, new THREE.Vector3(0, 1, 0))
    if (bestV.lengthSq() < 0.001) bestV.set(1, 0, 0)
  }

  bestV.normalize()
  // 固定符号：保证同一根键两端算出的方向一致
  if (Math.abs(bestV.x) > 0.001) { if (bestV.x < 0) bestV.negate() }
  else if (Math.abs(bestV.y) > 0.001) { if (bestV.y < 0) bestV.negate() }
  else if (bestV.z < 0) { bestV.negate() }
  return bestV
}
