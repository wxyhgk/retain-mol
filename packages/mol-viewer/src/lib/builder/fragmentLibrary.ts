/**
 * fragmentLibrary.ts — 片段库：常用环系与官能团的预构建 3D 结构。
 *
 * 数据驱动：每个片段 = 原子坐标（含全部 H）+ 键 + 连接点。
 *  - attachIndex  连接重原子（接到目标原子上的那个原子）
 *  - attachHIndex 连接时被删除的 H；连接方向 = attachAtom → attachH，
 *    不需要单独的方向字段
 *  - 单独放置（点空白）时使用完整结构：苯环→苯、羧基→甲酸，化学上自洽
 *
 * 环坐标用生成器计算（平面环 / 椅式交替 ±z），H 方向复用 VSEPR 公式，
 * 加新环 = 加一行 makeRing 调用，不手打坐标。
 */

import { tetrahedralCandidates } from './geometry/vsepr'
import { type Vec3, add, scale } from './math/vec3'
import { validateFragmentDef } from './kernel/FragmentValidator'
import { TRANSITION_METAL_COORDINATION_SETS } from './coordination/elements'

export interface FragmentAtom { symbol: string; x: number; y: number; z: number }
export interface FragmentBond { a: number; b: number; order: 1 | 2 | 3 }

export interface FragmentDef {
  id: string
  /** 中文名（按钮 tooltip / 状态栏） */
  name: string
  /** 按钮短标 */
  short: string
  /** 分子式（单独放置时的完整结构） */
  formula: string
  atoms: FragmentAtom[]
  bonds: FragmentBond[]
  attachIndex: number
  /** Optional removable H used as the attachment axis. -1 is allowed when attachDirection is provided. */
  attachHIndex: number
  /** Explicit outward attachment axis for authored open-valence sites without an H. */
  attachDirection?: [number, number, number]
  /**
   * 以键为连接处（Ketcher 式并环）：点击已有的键时，模板的这条边与之融合
   * （苯环模板点 C-C 键 → 萘式稠环）。仅环系片段有；基团为 undefined。
   */
  attachBond?: [number, number]
  /**
   * 接到已有原子时用的键级（GaussView 式杂化片段：=CH₂ 用 2、≡CH 用 3）。
   * 默认（undefined）= 1，现有片段行为不变。degree 模型下这只是那条连接键的 order，
   * 不触发目标价态/H 重算——与「键级不联动 H」一致。
   */
  attachOrder?: 1 | 2 | 3
  /** UI 分组：单原子后按 sp3 / sp2 / sp（杂化桩）、ring（环）、group（多原子基团）排列 */
  group?: 'sp3' | 'sp2' | 'sp' | 'coordination' | 'ring' | 'group'
  /** Transition-metal coordination metadata. Directions are local-space unit vectors. */
  coordination?: {
    geometryId: string
    coordinationNumber: number
    pointGroup?: string
    directions: [number, number, number][]
  }
}

// ── 内部小工具 ────────────────────────────────────────────────────────────
// add / scale 复用共享 vec3 模块（数值实现逐字节等价）。
// norm 有意保留本地版本：用 Math.hypot 且零向量原样返回（0/1），
// 与 vec3.normalize（Math.sqrt(dot) + 退化时返回 [1,0,0]）数值语义不同，
// 不可替换——替换会改变输出，违反零行为变化。

type V3 = Vec3
const norm = (v: V3): V3 => {
  const l = Math.hypot(v[0], v[1], v[2]) || 1
  return [v[0]/l, v[1]/l, v[2]/l]
}

const CH = 1.09   // C-H 键长

/**
 * 环生成器：n 个碳等角分布，pucker 为 ±z 交替振幅（椅式），
 * sp2 环每碳 1 个面内 H，sp3 环每碳 2 个 H（四面体候选位公式）。
 */
function makeRing(opts: {
  id: string; name: string; short: string; formula: string
  n: number
  /** 相邻碳间距（Å） */
  cc: number
  /** 键级序列（长度 n，benzene 用 [2,1,...] 凯库勒式） */
  orders: (1 | 2)[]
  /** ±z 交替振幅，0 = 平面 */
  pucker: number
  /** 每碳 H 数：1（sp2 面内）或 2（sp3 上下） */
  hPerC: 1 | 2
}): FragmentDef {
  const { n, cc, orders, pucker, hPerC } = opts
  // 半径：投影到 xy 平面的相邻碳间距 = 弦长 2R·sin(π/n)
  const ccXY = pucker > 0 ? Math.sqrt(cc*cc - (2*pucker)*(2*pucker)) : cc
  const R = ccXY / (2 * Math.sin(Math.PI / n))

  const carbons: V3[] = []
  for (let i = 0; i < n; i++) {
    const a = (2 * Math.PI * i) / n
    carbons.push([R * Math.cos(a), R * Math.sin(a), pucker * (i % 2 === 0 ? 1 : -1)])
  }

  const atoms: FragmentAtom[] = carbons.map(c => ({ symbol: 'C', x: c[0], y: c[1], z: c[2] }))
  const bonds: FragmentBond[] = []
  for (let i = 0; i < n; i++) bonds.push({ a: i, b: (i + 1) % n, order: orders[i] })

  let attachHIndex = -1
  for (let i = 0; i < n; i++) {
    const c = carbons[i]
    const d1 = norm(add(carbons[(i + 1) % n], scale(c, -1)))
    const d2 = norm(add(carbons[(i + n - 1) % n], scale(c, -1)))
    const sum = add(d1, d2)

    if (hPerC === 1) {
      // sp2：面内向外
      const dir = norm(scale(sum, -1))
      const h = add(c, scale(dir, CH))
      atoms.push({ symbol: 'H', x: h[0], y: h[1], z: h[2] })
      bonds.push({ a: i, b: atoms.length - 1, order: 1 })
      if (i === 0) attachHIndex = atoms.length - 1
    } else {
      // sp3：两个四面体候选位（复用 vsepr 的唯一实现）
      for (const dir of tetrahedralCandidates(d1, d2)!) {
        const h = add(c, scale(dir, CH))
        atoms.push({ symbol: 'H', x: h[0], y: h[1], z: h[2] })
        bonds.push({ a: i, b: atoms.length - 1, order: 1 })
        if (i === 0 && attachHIndex < 0) attachHIndex = atoms.length - 1
      }
    }
  }

  return { id: opts.id, name: opts.name, short: opts.short, formula: opts.formula,
           atoms, bonds, attachIndex: 0, attachHIndex, attachBond: [0, 1], group: 'ring' }
}

// ── 杂化桩框架（GaussView Element Fragments 式）────────────────────────────────
// 元素条只放「杂化开价桩」：中心重原子 + 用 H 补满的开价，接到已有原子时按
// attachOrder 成单/双/三键。整张 HYBRID_TABLE 是唯一数据源 —— 补新元素 = 加一行，
// 几何/命名/接线全自动，无需手打坐标。
//
//   hCount      除连接键外要补的 H 数（= 常见价 − attachOrder）
//   attachOrder 1/2/3 → 接原子时形成单/双/三键（degree 模型下只是那条键的 order，
//               不触发目标价态/H 重算——与「键级不联动 H」一致）
//   几何        sp3 四面体(3D) · sp2 平面 120° · sp 线性 180°
//
// 放空白：sp3（attachOrder 1）放完整饱和分子（–C→CH₄、–O→H₂O）；sp2/sp 由
// useBuilder 退回放中心元素单原子（孤立的 =CH₂/≡N 无化学意义，同 GaussView）。

type Hyb = 'sp3' | 'sp2' | 'sp'
interface HybridSpec { hyb: Hyb; attachOrder: 1 | 2 | 3; hCount: number; bondLen: number }

// 四面体四顶点（归一化）——sp3 的 H 方向；index 0 兼作连接方向（attach-H）
const TETRA: V3[] = ([[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]] as V3[]).map(norm)
const BOND_GLYPH: Record<Hyb, string> = { sp3: '–', sp2: '=', sp: '≡' }

function makeHybrid(sym: string, spec: HybridSpec): FragmentDef {
  const { hyb, attachOrder, hCount, bondLen } = spec
  const planar = (deg: number): V3 => [Math.cos((deg * Math.PI) / 180), Math.sin((deg * Math.PI) / 180), 0]
  // 方向序列：index 0 = attach-H（连接方向），其后依次补 H
  const dirs: V3[] =
    hyb === 'sp3' ? TETRA
    : hyb === 'sp2' ? [planar(0), planar(120), planar(240)]
    : [planar(0), planar(180)]

  const atoms: FragmentAtom[] = [{ symbol: sym, x: 0, y: 0, z: 0 }]
  const bonds: FragmentBond[] = []
  dirs.slice(0, 1 + hCount).forEach((d, i) => {
    atoms.push({ symbol: 'H', x: d[0] * bondLen, y: d[1] * bondLen, z: d[2] * bondLen })
    bonds.push({ a: 0, b: i + 1, order: 1 })
  })

  const short = BOND_GLYPH[hyb] + sym   // GaussView 式桩：–C / =C / ≡C
  return {
    id: `${sym.toLowerCase()}-${hyb}`,
    name: `${sym} · ${hyb}`,
    short, formula: short,
    atoms, bonds, attachIndex: 0, attachHIndex: 1,
    attachOrder, group: hyb,
  }
}

// 每元素的杂化桩表 —— agent 参照 GaussView Element Fragments 往这里加行即可。
// 已做的 C/N/O/S 为参考实现（bondLen 用 X–H 平衡键长，sp2/sp 桩用重键键长做视觉近似）。
const HYBRID_TABLE: Record<string, HybridSpec[]> = {
  C: [
    { hyb: 'sp3', attachOrder: 1, hCount: 3, bondLen: 1.09 },   // –C   四面体，放空白 = CH₄
    { hyb: 'sp2', attachOrder: 2, hCount: 2, bondLen: 1.09 },   // =C   接双键（=CH₂）
    { hyb: 'sp',  attachOrder: 3, hCount: 1, bondLen: 1.09 },   // ≡C   接三键（≡CH）
  ],
  N: [
    { hyb: 'sp3', attachOrder: 1, hCount: 2, bondLen: 1.01 },   // –N   氨基
    { hyb: 'sp2', attachOrder: 2, hCount: 1, bondLen: 1.01 },   // =N   亚胺
    { hyb: 'sp',  attachOrder: 3, hCount: 0, bondLen: 1.01 },   // ≡N   氰
  ],
  O: [
    { hyb: 'sp3', attachOrder: 1, hCount: 1, bondLen: 0.96 },   // –O   羟基
    { hyb: 'sp2', attachOrder: 2, hCount: 0, bondLen: 1.21 },   // =O   羰基
  ],
  S: [
    { hyb: 'sp3', attachOrder: 1, hCount: 1, bondLen: 1.34 },   // –S   巯基
    { hyb: 'sp2', attachOrder: 2, hCount: 0, bondLen: 1.60 },   // =S   硫酮
  ],
  // TODO(agent): 参照 GaussView 补 B / Si / P / 卤素(sp3 单桩) / ... 的杂化桩
}

const HYBRID_FRAGMENTS: FragmentDef[] = Object.entries(HYBRID_TABLE)
  .flatMap(([sym, specs]) => specs.map(s => makeHybrid(sym, s)))

// 环系片段：暂不进元素条（元素条只放杂化桩），保留供 fuseFragmentOnBond 及日后「环系」tab 使用。
const RING_FRAGMENTS: FragmentDef[] = [
  makeRing({ id: 'benzene',      name: '苯环',         short: 'Ph',  formula: 'C₆H₆',
             n: 6, cc: 1.39, orders: [2, 1, 2, 1, 2, 1], pucker: 0,     hPerC: 1 }),
  makeRing({ id: 'cyclohexane',  name: '环己烷（椅式）', short: 'Cy',  formula: 'C₆H₁₂',
             n: 6, cc: 1.53, orders: [1, 1, 1, 1, 1, 1], pucker: 0.237, hPerC: 2 }),
  makeRing({ id: 'cyclopentane', name: '环戊烷',        short: 'Cp',  formula: 'C₅H₁₀',
             n: 5, cc: 1.54, orders: [1, 1, 1, 1, 1],    pucker: 0,     hPerC: 2 }),
  makeRing({ id: 'cyclopropane', name: '环丙烷',        short: 'C₃',  formula: 'C₃H₆',
             n: 3, cc: 1.51, orders: [1, 1, 1],          pucker: 0,     hPerC: 2 }),
]

// ── 片段库 ────────────────────────────────────────────────────────────────────
// group ∈ {sp3,sp2,sp} 的杂化桩进元素条；ring 的暂不展示（见 RING_FRAGMENTS 注）。

export const FRAGMENTS: FragmentDef[] = [
  ...HYBRID_FRAGMENTS,
  ...TRANSITION_METAL_COORDINATION_SETS.flatMap(set => set.fragments),
  ...RING_FRAGMENTS,
]

const REGISTERED_FRAGMENTS = new Map<string, FragmentDef>()

export function registerFragment(fragment: FragmentDef): FragmentDef {
  // Dynamic templates must satisfy the same topology contract as builtins
  // before they enter any placement or ring-fusion algorithm.
  const issues = validateFragmentDef(fragment)
  if (issues.length > 0) throw new Error(issues.map(issue => issue.message).join('；'))
  const stored: FragmentDef = {
    ...fragment,
    atoms: fragment.atoms.map(atom => ({ ...atom })),
    bonds: fragment.bonds.map(bond => ({ ...bond })),
    attachBond: fragment.attachBond ? [...fragment.attachBond] : undefined,
    coordination: fragment.coordination ? {
      ...fragment.coordination,
      directions: fragment.coordination.directions.map(direction => [...direction]),
    } : undefined,
  }
  REGISTERED_FRAGMENTS.set(stored.id, stored)
  return stored
}

export function unregisterFragment(id: string): boolean {
  return REGISTERED_FRAGMENTS.delete(id)
}

export function listFragments(): FragmentDef[] {
  const merged = new Map(FRAGMENTS.map(fragment => [fragment.id, fragment]))
  for (const fragment of REGISTERED_FRAGMENTS.values()) merged.set(fragment.id, fragment)
  return [...merged.values()]
}

export function getFragment(id: string): FragmentDef | undefined {
  return REGISTERED_FRAGMENTS.get(id) ?? FRAGMENTS.find(f => f.id === id)
}
