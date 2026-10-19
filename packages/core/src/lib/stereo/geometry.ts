import type { Molecule } from '../molecule'
import { add, cross, dot, length, sub, type Vec3 } from '../math/vec3'
import { applyQuat, quatFromUnitVectors, type Quat } from '../math/quat'

/**
 * 手性几何内核：纯函数，不依赖 OCL、不碰 store。
 *
 * R/S 只是 CIP 视角下的派生标签——换一个取代基（几何不动）标签都可能翻转，
 * 所以存储与校验一律绕开 R/S，只认“固定配体序下的有向体积符号”。
 * R/S 显示、CIP 排名全甩给 OCL。
 */

/** 退化阈值：|V| < EPS 视为配体共面，不判正负。只警告不改数据，选错代价低。 */
export const STEREO_VOLUME_EPS = 1e-4 // Å³

/** 四面体有向体积：V = dot(b-a, cross(c-a, d-a)) / 6 */
export function signedTetraVolume(a: Vec3, b: Vec3, c: Vec3, d: Vec3): number {
  return dot(sub(b, a), cross(sub(c, a), sub(d, a))) / 6
}

export interface StereoXYZ {
  readonly x: number
  readonly y: number
  readonly z: number
}

function toVec3(p: StereoXYZ): Vec3 {
  return [p.x, p.y, p.z]
}

/**
 * 按存储配体序从坐标算当前 parity = 配体四面体 (p,q,r,s) 的有向体积符号。
 * 交换任意两个配体必翻号；|V|<eps 返回 0（退化）。
 * 注意：只看配体相对位置，与中心坐标无关——拖动中心原子本身穿过配体平面
 * 属于已知盲区（罕见；见 checkTetraCenter 注释）。
 */
export function parityFromCoords(
  ligandsInStoredOrder: readonly [StereoXYZ, StereoXYZ, StereoXYZ, StereoXYZ],
): 1 | -1 | 0 {
  const [p, q, r, s] = ligandsInStoredOrder
  const volume = signedTetraVolume(toVec3(p), toVec3(q), toVec3(r), toVec3(s))
  if (Math.abs(volume) < STEREO_VOLUME_EPS) return 0
  return volume > 0 ? 1 : -1
}

/** 拖拽/松弛后对账的唯一入口 */
export type StereoCheck = 'ok' | 'inverted' | 'degenerate' | 'unspecified'

export function checkTetraCenter(
  storedParity: 1 | -1 | undefined,
  ligandsInStoredOrder: readonly [StereoXYZ, StereoXYZ, StereoXYZ, StereoXYZ],
): StereoCheck {
  if (storedParity === undefined) return 'unspecified'
  const current = parityFromCoords(ligandsInStoredOrder)
  if (current === 0) return 'degenerate'
  return current === storedParity ? 'ok' : 'inverted'
}

function branchBeyond(mol: Molecule, centerId: string, ligandId: string): Set<string> {
  const cut = mol.bonds.filter(b => b.atomId1 !== centerId && b.atomId2 !== centerId)
  const adj = new Map<string, string[]>()
  for (const a of mol.atoms) adj.set(a.id, [])
  for (const b of cut) {
    adj.get(b.atomId1)?.push(b.atomId2)
    adj.get(b.atomId2)?.push(b.atomId1)
  }
  const visited = new Set<string>([ligandId])
  const queue = [ligandId]
  while (queue.length > 0) {
    const id = queue.pop() as string
    for (const nb of adj.get(id) ?? []) {
      if (!visited.has(nb)) {
        visited.add(nb)
        queue.push(nb)
      }
    }
  }
  return visited
}

export interface FlipTetraResult {
  readonly flippedAId: string
  readonly flippedBId: string
}

/**
 * 绕中心对两个独立分支作互逆刚性旋转，交换键方向，保留各自键长。
 * 正旋转保留分支内部距离、连接角和其他手性中心；不镜像整个分支。
 * 中心及未参与分支固定。共享/环内分支、无效坐标返回 null。
 * 不保证分支之间无碰撞或达到能量极小；CIP 仍由调用方独立复核。
 */
export function swapBranchDirections(
  mol: Molecule,
  centerId: string,
  ligandAId: string,
  ligandBId: string,
): { molecule: Molecule; result: FlipTetraResult } | null {
  if (ligandAId === ligandBId) return null
  const atomById = new Map(mol.atoms.map(a => [a.id, a]))
  const center = atomById.get(centerId)
  const ligandA = atomById.get(ligandAId)
  const ligandB = atomById.get(ligandBId)
  if (!center || !ligandA || !ligandB) return null
  const ligandIds = mol.bonds.filter(b => b.atomId1 === centerId || b.atomId2 === centerId)
    .map(b => b.atomId1 === centerId ? b.atomId2 : b.atomId1)
  if (new Set(ligandIds).size !== ligandIds.length
    || !ligandIds.includes(ligandAId) || !ligandIds.includes(ligandBId)) return null
  const origin = toVec3(center)
  if (!origin.every(Number.isFinite)) return null
  const ligands = ligandIds.map(id => atomById.get(id))
  if (ligands.some(a => {
    if (!a || !toVec3(a).every(Number.isFinite)) return true
    const distance = length(sub(toVec3(a), origin))
    return !Number.isFinite(distance) || distance < 1e-6
  })) return null
  const branchA = branchBeyond(mol, centerId, ligandAId)
  const branchB = branchBeyond(mol, centerId, ligandBId)
  // A moving branch may attach to the center only at its own ligand.
  if (ligandIds.some(id => (id !== ligandAId && branchA.has(id))
    || (id !== ligandBId && branchB.has(id)))) return null
  if (mol.atoms.some(a => (branchA.has(a.id) || branchB.has(a.id))
    && !toVec3(a).every(Number.isFinite))) return null
  const rotationA = quatFromUnitVectors(sub(toVec3(ligandA), origin), sub(toVec3(ligandB), origin))
  const rotationB: Quat = [-rotationA[0], -rotationA[1], -rotationA[2], rotationA[3]]
  const atoms = mol.atoms.map(a => {
    const rotation = branchA.has(a.id) ? rotationA : branchB.has(a.id) ? rotationB : null
    if (!rotation) return a
    const [x, y, z] = add(origin, applyQuat(sub(toVec3(a), origin), rotation))
    return { ...a, x, y, z }
  })
  if (atoms.some(a => !toVec3(a).every(Number.isFinite))) return null
  return { molecule: { ...mol, atoms }, result: { flippedAId: ligandAId, flippedBId: ligandBId } }
}

/** Tetrahedral variant: require four ligands and verify inversion before returning. */
export function flipTetraBranches(
  mol: Molecule,
  centerId: string,
  ligandAId: string,
  ligandBId: string,
): { molecule: Molecule; result: FlipTetraResult } | null {
  const ligandIds = mol.bonds.filter(b => b.atomId1 === centerId || b.atomId2 === centerId)
    .map(b => b.atomId1 === centerId ? b.atomId2 : b.atomId1)
  if (ligandIds.length !== 4) return null
  const flipped = swapBranchDirections(mol, centerId, ligandAId, ligandBId)
  if (!flipped) return null
  const parity = (molecule: Molecule) => {
    const byId = new Map(molecule.atoms.map(a => [a.id, a]))
    return parityFromCoords([byId.get(ligandIds[0]!)!, byId.get(ligandIds[1]!)!, byId.get(ligandIds[2]!)!, byId.get(ligandIds[3]!)!])
  }
  const before = parity(mol)
  if (before === 0 || parity(flipped.molecule) !== -before) return null
  return flipped
}
