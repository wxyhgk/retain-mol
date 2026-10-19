import * as THREE from 'three'
import type { Bond, Molecule } from '@retainmol/core'
import { detectAromaticity } from '@retainmol/core/internal/lib/analysis/aromaticity'

/**
 * 芳香环心缓存。
 * DFS findRings 的结果按 bonds 数组引用缓存：setAtomPositions 只改坐标不改 bonds，
 * 因此优化期间每帧命中缓存，不重复跑 DFS。
 * 环心从当前坐标实时算（代价低），这样优化时环心也跟着移动。
 */
export class AromaticRingCache {
  // bonds 数组引用 → 输入签名和 aromaticRings（原子 ID 数组）。
  // 坐标或键级变化时必须重新检测，不能只按数组引用命中。
  private _cache = new WeakMap<readonly Bond[], { signature: string; aromaticRings: string[][] }>()

  /** 返回 bondId → 所在环心（THREE.Vector3） */
  centroids(mol: Molecule): Map<string, THREE.Vector3> {
    const bonds = mol.bonds

    const signature = aromaticInputSignature(mol)
    const cached = this._cache.get(bonds)
    const aromaticRings = cached?.signature === signature
      ? cached.aromaticRings
      : detectAromaticity(mol).aromaticRings
    if (!cached || cached.signature !== signature) {
      this._cache.set(bonds, { signature, aromaticRings })
    }

    // 用当前坐标计算环心（positions 每帧都在变，所以每帧重算，但操作量极小）
    const atomById = new Map(mol.atoms.map(a => [a.id, a]))
    const bondCentroid = new Map<string, THREE.Vector3>()

    for (const ring of aromaticRings) {
      let cx = 0, cy = 0, cz = 0
      for (const id of ring) {
        const a = atomById.get(id)
        if (a) { cx += a.x; cy += a.y; cz += a.z }
      }
      cx /= ring.length; cy /= ring.length; cz /= ring.length
      const centroid = new THREE.Vector3(cx, cy, cz)

      const ringSet = new Set(ring)
      for (const b of mol.bonds) {
        if (ringSet.has(b.atomId1) && ringSet.has(b.atomId2)) {
          bondCentroid.set(b.id, centroid)
        }
      }
    }

    return bondCentroid
  }
}

function aromaticInputSignature(mol: Molecule): string {
  const atoms = mol.atoms.map(atom => [atom.id, atom.symbol, atom.x, atom.y, atom.z].join(':')).join('|')
  const bonds = mol.bonds.map(bond => [
    bond.id, bond.atomId1, bond.atomId2, bond.order, bond.aromatic ? 1 : 0,
  ].join(':')).join('|')
  return `${atoms}||${bonds}`
}
