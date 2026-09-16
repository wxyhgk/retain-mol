import type { Molecule } from '../molecule'
import { cross, dot, sub, type Vec3 } from '../math/vec3'

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
 * 翻转手性：把配体 A、B 各自所在分支整体刚性平移互换位置。
 * 奇置换 ⟹ 体积变号，与 CIP 无关；R/S 标签是否翻转调用方负责（必翻）。
 * 只换位置不动拓扑；分支内部几何完整保留，中心两根键取对方原键长，
 * 调用后建议走一次几何 relax。退化（配体与中心重合）返回 null。
 */
export function flipTetraBranches(
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
  const bondedToCenter = (id: string): boolean =>
    mol.bonds.some(
      b =>
        (b.atomId1 === centerId && b.atomId2 === id) ||
        (b.atomId1 === id && b.atomId2 === centerId),
    )
  if (!bondedToCenter(ligandAId) || !bondedToCenter(ligandBId)) return null
  const dx = ligandB.x - ligandA.x
  const dy = ligandB.y - ligandA.y
  const dz = ligandB.z - ligandA.z
  if (Math.hypot(dx, dy, dz) < 1e-6) return null
  const branchA = branchBeyond(mol, centerId, ligandAId)
  const branchB = branchBeyond(mol, centerId, ligandBId)
  const atoms = mol.atoms.map(a => {
    if (branchA.has(a.id)) return { ...a, x: a.x + dx, y: a.y + dy, z: a.z + dz }
    if (branchB.has(a.id)) return { ...a, x: a.x - dx, y: a.y - dy, z: a.z - dz }
    return a
  })
  return { molecule: { ...mol, atoms }, result: { flippedAId: ligandAId, flippedBId: ligandBId } }
}
