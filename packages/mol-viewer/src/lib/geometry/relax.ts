/**
 * relax.ts — 轻量几何松弛器（真·逐帧 2D→3D 展开）
 *
 * 为什么自己写：OpenChemLib 的 ConformerGenerator / MMFF94 都只能一次性返回
 * 最终构象，拿不到中间帧；而「看着分子从平面实时摊开成立体」这个动画，本质上
 * 需要能逐步取出的坐标。而且这里只用纯几何约束（键长 / 键角 / 原子斥力），
 * 不依赖任何力场参数，所以 MMFF94 无法处理的硼、过渡金属等元素在这里天然可用。
 *
 * 算法：Position-Based Dynamics 风格的距离约束松弛（类 SHAKE / 距离几何）——
 *   ① 键长约束（1-2）：把成键原子对拉到标准键长
 *   ② 键角约束（1-3）：把每个中心原子的相邻原子对，拉到 VSEPR 理想键角对应的
 *      1-3 距离（用余弦定理由两键长 + 理想角算出）
 *   ③ 非键斥力：靠得太近的非键原子对互相推开——既防重叠，又是「平面→立体」
 *      的展开驱动力；同时天然避免多片段互相坍缩（不像 MMFF 的 vdW 会吸引）
 * 初始给每个原子一个微小 z 扰动打破平面对称，让约束能把结构推入三维。
 * 每次 step() 做一遍 Gauss-Seidel 投影；调用方用 requestAnimationFrame 逐帧驱动 + 重绘。
 */

import type { Molecule } from '../molecule'
import { inferHybridization } from '../builder/analysis/hybridization'
import { lookupBondLengthByOrder, inferGeometry, GEOMETRY_RULES } from '../../config/geometry.config'
import { RELAX } from '../../config/relax.config'

interface DistConstraint { i: number; j: number; d: number; k: number }

function readAt<T>(values: ArrayLike<T>, index: number, label: string): T {
  if (!Number.isInteger(index) || index < 0 || index >= values.length) {
    throw new RangeError(`${label} index ${index} is outside 0..${values.length - 1}`)
  }
  const value = values[index]
  if (value === undefined) {
    throw new RangeError(`${label} has no value at index ${index}`)
  }
  return value
}

function resolveBondLength(symbolI: string, symbolJ: string, order: 1 | 2 | 3): number {
  const requested = lookupBondLengthByOrder(symbolI, symbolJ, order)
  if (requested !== null) return requested

  const single = lookupBondLengthByOrder(symbolI, symbolJ, 1)
  if (single === null) {
    throw new Error(`Unable to resolve a bond length for ${symbolI}-${symbolJ}`)
  }
  return single
}

export interface RelaxOptions {
  /** 初始 z 扰动幅度（Å），用于打破平面对称 */
  jitter?: number
  /** 键长约束强度 0..1 */
  bondK?: number
  /** 键角约束强度 0..1 */
  angleK?: number
  /** 非键斥力强度 0..1 */
  repulseK?: number
  /** 非键斥力触发距离（Å）：非键原子对近于此则互相推开 */
  repulseDist?: number
  /** 确定性随机种子（同结构每次展开一致，可复现） */
  seed?: number
  /**
   * 目标坐标（id→xyz）：若提供，每帧在几何约束之外再朝目标锚定，最终收敛到目标。
   * 用于「展开到 ConformerGenerator 的高质量最终结构」——过程由几何约束保证中间帧
   * 合理（键长稳定、不穿插），终点精确落在 CG 结果上（环正确、含 H）。
   */
  target?: ReadonlyMap<string, { x: number; y: number; z: number }>
  /** 目标锚定强度 0..1（每帧朝目标移动的比例） */
  attractK?: number
}

const DEG = Math.PI / 180

/** 确定性伪随机（避免 Math.random，保证同一结构每次展开路径一致） */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export class GeometryRelaxer {
  private ids: string[]
  private sym: string[]
  private x: Float64Array
  private y: Float64Array
  private z: Float64Array
  private bondCons: DistConstraint[] = []
  private angleCons: DistConstraint[] = []
  private nonbondPairs: Int32Array
  private repulseDist: number
  private repulseK: number
  private tx: Float64Array | null = null
  private ty: Float64Array | null = null
  private tz: Float64Array | null = null
  private attractK: number
  /** 上一次 step 的最大约束残差 |dist - target|（收敛判据） */
  maxResidual = Infinity

  constructor(mol: Molecule, opts: RelaxOptions = {}) {
    const {
      jitter = RELAX.jitter, bondK = RELAX.bondK, angleK = RELAX.angleK,
      repulseK = RELAX.repulseK, repulseDist = RELAX.repulseDist, seed = RELAX.seed,
      target, attractK = RELAX.attractK,
    } = opts
    const n = mol.atoms.length
    this.ids = mol.atoms.map(a => a.id)
    this.sym = mol.atoms.map(a => a.symbol)
    this.x = new Float64Array(n)
    this.y = new Float64Array(n)
    this.z = new Float64Array(n)
    this.repulseDist = repulseDist
    this.repulseK = repulseK
    this.attractK = attractK

    const idx = new Map<string, number>()
    mol.atoms.forEach((a, i) => idx.set(a.id, i))
    const rnd = mulberry32(seed)
    for (const [i, atom] of mol.atoms.entries()) {
      this.x[i] = atom.x
      this.y[i] = atom.y
      this.z[i] = atom.z + (rnd() - 0.5) * 2 * jitter
    }

    // 目标锚定坐标（若提供）
    if (target) {
      this.tx = new Float64Array(n)
      this.ty = new Float64Array(n)
      this.tz = new Float64Array(n)
      for (const [i, id] of this.ids.entries()) {
        const t = target.get(id)
        this.tx[i] = t ? t.x : readAt(this.x, i, 'x coordinate')
        this.ty[i] = t ? t.y : readAt(this.y, i, 'y coordinate')
        this.tz[i] = t ? t.z : readAt(this.z, i, 'z coordinate')
      }
    }

    // 邻接表 + 键长约束
    const nbr: { j: number; len: number }[][] = Array.from({ length: n }, () => [])
    for (const b of mol.bonds) {
      const i = idx.get(b.atomId1), j = idx.get(b.atomId2)
      if (i === undefined || j === undefined) continue
      const symbolI = readAt(this.sym, i, 'atom symbol')
      const symbolJ = readAt(this.sym, j, 'atom symbol')
      const len = resolveBondLength(symbolI, symbolJ, b.order)
      const neighborsI = readAt(nbr, i, 'neighbor list')
      const neighborsJ = readAt(nbr, j, 'neighbor list')
      this.bondCons.push({ i, j, d: len, k: bondK })
      neighborsI.push({ j, len })
      neighborsJ.push({ j: i, len })
    }

    // 键角（1-3）约束 + 记录已约束原子对（斥力要排除它们）
    const key = (a: number, b: number) => (a < b ? `${a},${b}` : `${b},${a}`)
    const constrained = new Set<string>()
    for (const c of this.bondCons) constrained.add(key(c.i, c.j))
    for (const [c, centerNeighbors] of nbr.entries()) {
      const deg = centerNeighbors.length
      // 度数 >4（八面体 / 超价）单一理想角不适用，跳过角约束，靠键 + 斥力自然展开
      if (deg < 2 || deg > 4) continue
      const centerId = readAt(this.ids, c, 'atom id')
      const centerSymbol = readAt(this.sym, c, 'atom symbol')
      const hyb = inferHybridization(mol.bonds, centerId)
      const geom = inferGeometry(centerSymbol, deg, hyb)
      const cosT = Math.cos(GEOMETRY_RULES[geom].bondAngle * DEG)
      for (let a = 0; a < deg; a++) {
        for (let b = a + 1; b < deg; b++) {
          const na = readAt(centerNeighbors, a, 'neighbor')
          const nb = readAt(centerNeighbors, b, 'neighbor')
          const d13 = Math.sqrt(na.len * na.len + nb.len * nb.len - 2 * na.len * nb.len * cosT)
          this.angleCons.push({ i: na.j, j: nb.j, d: d13, k: angleK })
          constrained.add(key(na.j, nb.j))
        }
      }
    }

    // 非键对（排除键 / 角约束对）——斥力候选
    const pairs: number[] = []
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        if (constrained.has(key(i, j))) continue
        pairs.push(i, j)
      }
    }
    this.nonbondPairs = Int32Array.from(pairs)
  }

  private _residual = 0

  private project(c: DistConstraint): void {
    const { i, j, d, k } = c
    const xi = readAt(this.x, i, 'x coordinate')
    const yi = readAt(this.y, i, 'y coordinate')
    const zi = readAt(this.z, i, 'z coordinate')
    const xj = readAt(this.x, j, 'x coordinate')
    const yj = readAt(this.y, j, 'y coordinate')
    const zj = readAt(this.z, j, 'z coordinate')
    let dx = xj - xi, dy = yj - yi, dz = zj - zi
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1e-6
    const res = dist - d
    if (Math.abs(res) > this._residual) this._residual = Math.abs(res)
    const f = (res / dist) * 0.5 * k
    dx *= f; dy *= f; dz *= f
    this.x[i] = xi + dx; this.y[i] = yi + dy; this.z[i] = zi + dz
    this.x[j] = xj - dx; this.y[j] = yj - dy; this.z[j] = zj - dz
  }

  /** 前进 iterations 次投影迭代 */
  step(iterations = 1): void {
    for (let it = 0; it < iterations; it++) {
      this._residual = 0
      for (const c of this.bondCons) this.project(c)
      for (const c of this.angleCons) this.project(c)
      // 非键斥力（单边：只在靠得太近时推开）
      const rd = this.repulseDist, rk = this.repulseK, P = this.nonbondPairs
      for (let p = 0; p < P.length; p += 2) {
        const i = readAt(P, p, 'nonbond pair')
        const j = readAt(P, p + 1, 'nonbond pair')
        const xi = readAt(this.x, i, 'x coordinate')
        const yi = readAt(this.y, i, 'y coordinate')
        const zi = readAt(this.z, i, 'z coordinate')
        const xj = readAt(this.x, j, 'x coordinate')
        const yj = readAt(this.y, j, 'y coordinate')
        const zj = readAt(this.z, j, 'z coordinate')
        let dx = xj - xi, dy = yj - yi, dz = zj - zi
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1e-6
        if (dist >= rd) continue
        const f = ((dist - rd) / dist) * 0.5 * rk
        dx *= f; dy *= f; dz *= f
        this.x[i] = xi + dx; this.y[i] = yi + dy; this.z[i] = zi + dz
        this.x[j] = xj - dx; this.y[j] = yj - dy; this.z[j] = zj - dz
      }
      // 朝目标锚定（若提供）——让结构逐帧收敛到 CG 的高质量最终坐标
      if (this.tx && this.ty && this.tz) {
        const ak = this.attractK, N = this.ids.length
        for (let i = 0; i < N; i++) {
          const x = readAt(this.x, i, 'x coordinate')
          const y = readAt(this.y, i, 'y coordinate')
          const z = readAt(this.z, i, 'z coordinate')
          const tx = readAt(this.tx, i, 'target x coordinate')
          const ty = readAt(this.ty, i, 'target y coordinate')
          const tz = readAt(this.tz, i, 'target z coordinate')
          this.x[i] = x + (tx - x) * ak
          this.y[i] = y + (ty - y) * ak
          this.z[i] = z + (tz - z) * ak
        }
      }
      this.maxResidual = this._residual
    }
  }

  /** 当前坐标（id → xyz），重定心到原点 */
  positions(): Map<string, { x: number; y: number; z: number }> {
    const n = this.ids.length
    let cx = 0, cy = 0, cz = 0
    if (!this.tx) {   // 无目标时重定心防整体漂移；有目标时目标已居中，保持对齐
      for (let i = 0; i < n; i++) {
        cx += readAt(this.x, i, 'x coordinate')
        cy += readAt(this.y, i, 'y coordinate')
        cz += readAt(this.z, i, 'z coordinate')
      }
      cx /= n; cy /= n; cz /= n
    }
    const m = new Map<string, { x: number; y: number; z: number }>()
    for (let i = 0; i < n; i++) {
      const id = readAt(this.ids, i, 'atom id')
      const x = readAt(this.x, i, 'x coordinate')
      const y = readAt(this.y, i, 'y coordinate')
      const z = readAt(this.z, i, 'z coordinate')
      m.set(id, { x: x - cx, y: y - cy, z: z - cz })
    }
    return m
  }

  get converged(): boolean { return this.maxResidual < RELAX.convergeThreshold }
}
