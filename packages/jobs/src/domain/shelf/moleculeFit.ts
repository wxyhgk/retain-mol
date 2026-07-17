export interface Vec3 {
  x: number
  y: number
  z: number
}

/** 以质心为球心的包围球；margin 近似原子渲染半径，保证单原子也有非零半径。 */
export function moleculeBoundingSphere(
  atoms: readonly { x: number; y: number; z: number }[],
  atomRadiusMargin = 0.4,
): { center: Vec3; radius: number } {
  if (atoms.length === 0) return { center: { x: 0, y: 0, z: 0 }, radius: atomRadiusMargin }
  let cx = 0, cy = 0, cz = 0
  for (const atom of atoms) {
    cx += atom.x
    cy += atom.y
    cz += atom.z
  }
  const center = { x: cx / atoms.length, y: cy / atoms.length, z: cz / atoms.length }
  let maxSq = 0
  for (const atom of atoms) {
    const dx = atom.x - center.x
    const dy = atom.y - center.y
    const dz = atom.z - center.z
    maxSq = Math.max(maxSq, dx * dx + dy * dy + dz * dz)
  }
  return { center, radius: Math.sqrt(maxSq) + atomRadiusMargin }
}

/** 把包围球缩进盒内可用空间；小分子最多放大到 maxScale，不无限放大。 */
export function fitScaleForBox(radius: number, innerHalfExtent: number, maxScale = 1.1): number {
  if (radius <= 0) return maxScale
  return Math.min(maxScale, innerHalfExtent / radius)
}
