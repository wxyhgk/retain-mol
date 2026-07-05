/**
 * 片段库 — 常用环系与官能团的预构建 3D 结构。
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

import { tetrahedralCandidates } from '../lib/builder/geometry/vsepr'

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
  attachHIndex: number
  /**
   * 以键为连接处（Ketcher 式并环）：点击已有的键时，模板的这条边与之融合
   * （苯环模板点 C-C 键 → 萘式稠环）。仅环系片段有；基团为 undefined。
   */
  attachBond?: [number, number]
}

// ── 内部小工具（避免引入 vec3 依赖，保持 config 自包含）──────────────────────

type V3 = [number, number, number]
const norm = (v: V3): V3 => {
  const l = Math.hypot(v[0], v[1], v[2]) || 1
  return [v[0]/l, v[1]/l, v[2]/l]
}
const addV = (a: V3, b: V3): V3 => [a[0]+b[0], a[1]+b[1], a[2]+b[2]]
const scaleV = (v: V3, s: number): V3 => [v[0]*s, v[1]*s, v[2]*s]

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
    const d1 = norm(addV(carbons[(i + 1) % n], scaleV(c, -1)))
    const d2 = norm(addV(carbons[(i + n - 1) % n], scaleV(c, -1)))
    const sum = addV(d1, d2)

    if (hPerC === 1) {
      // sp2：面内向外
      const dir = norm(scaleV(sum, -1))
      const h = addV(c, scaleV(dir, CH))
      atoms.push({ symbol: 'H', x: h[0], y: h[1], z: h[2] })
      bonds.push({ a: i, b: atoms.length - 1, order: 1 })
      if (i === 0) attachHIndex = atoms.length - 1
    } else {
      // sp3：两个四面体候选位（复用 vsepr 的唯一实现）
      for (const dir of tetrahedralCandidates(d1, d2)!) {
        const h = addV(c, scaleV(dir, CH))
        atoms.push({ symbol: 'H', x: h[0], y: h[1], z: h[2] })
        bonds.push({ a: i, b: atoms.length - 1, order: 1 })
        if (i === 0 && attachHIndex < 0) attachHIndex = atoms.length - 1
      }
    }
  }

  return { id: opts.id, name: opts.name, short: opts.short, formula: opts.formula,
           atoms, bonds, attachIndex: 0, attachHIndex, attachBond: [0, 1] }
}

// ── 官能团（小结构，手写坐标；attach 原子在原点，attach-H 沿 +x）──────────────

const METHYL: FragmentDef = (() => {
  // 甲烷：C 原点，4 个 H 沿四面体方向
  const t = CH / Math.sqrt(3)
  return {
    id: 'methyl', name: '甲基', short: 'CH₃', formula: 'CH₄',
    atoms: [
      { symbol: 'C', x: 0, y: 0, z: 0 },
      { symbol: 'H', x:  t, y:  t, z:  t },
      { symbol: 'H', x:  t, y: -t, z: -t },
      { symbol: 'H', x: -t, y:  t, z: -t },
      { symbol: 'H', x: -t, y: -t, z:  t },
    ],
    bonds: [{ a: 0, b: 1, order: 1 }, { a: 0, b: 2, order: 1 }, { a: 0, b: 3, order: 1 }, { a: 0, b: 4, order: 1 }],
    attachIndex: 0, attachHIndex: 1,
  }
})()

const AMINO: FragmentDef = (() => {
  // 氨：N 原点，3 个 H 锥形（取四面体方向中的三个，N-H 1.01）
  const t = 1.01 / Math.sqrt(3)
  return {
    id: 'amino', name: '氨基', short: 'NH₂', formula: 'NH₃',
    atoms: [
      { symbol: 'N', x: 0, y: 0, z: 0 },
      { symbol: 'H', x:  t, y:  t, z:  t },
      { symbol: 'H', x:  t, y: -t, z: -t },
      { symbol: 'H', x: -t, y:  t, z: -t },
    ],
    bonds: [{ a: 0, b: 1, order: 1 }, { a: 0, b: 2, order: 1 }, { a: 0, b: 3, order: 1 }],
    attachIndex: 0, attachHIndex: 1,
  }
})()

const HYDROXYL: FragmentDef = {
  // 水：O 原点，H-O-H 104.5°，O-H 0.96
  id: 'hydroxyl', name: '羟基', short: 'OH', formula: 'H₂O',
  atoms: [
    { symbol: 'O', x: 0, y: 0, z: 0 },
    { symbol: 'H', x: 0.96, y: 0, z: 0 },
    { symbol: 'H', x: 0.96 * Math.cos(104.5 * Math.PI / 180), y: 0.96 * Math.sin(104.5 * Math.PI / 180), z: 0 },
  ],
  bonds: [{ a: 0, b: 1, order: 1 }, { a: 0, b: 2, order: 1 }],
  attachIndex: 0, attachHIndex: 1,
}

const CARBOXYL: FragmentDef = {
  // 甲酸：sp2 C 原点，=O / -OH 各 120°，attach-H 沿 +x
  id: 'carboxyl', name: '羧基', short: 'COOH', formula: 'HCOOH',
  atoms: [
    { symbol: 'C', x: 0, y: 0, z: 0 },
    { symbol: 'H', x: 1.09, y: 0, z: 0 },
    { symbol: 'O', x: 1.21 * Math.cos(2 * Math.PI / 3), y: 1.21 * Math.sin(2 * Math.PI / 3), z: 0 },   // =O
    { symbol: 'O', x: 1.36 * Math.cos(4 * Math.PI / 3), y: 1.36 * Math.sin(4 * Math.PI / 3), z: 0 },   // -O
    { symbol: 'H', x: -0.014, y: -1.869, z: 0 },                                                        // O-H
  ],
  bonds: [
    { a: 0, b: 1, order: 1 },
    { a: 0, b: 2, order: 2 },
    { a: 0, b: 3, order: 1 },
    { a: 3, b: 4, order: 1 },
  ],
  attachIndex: 0, attachHIndex: 1,
}

const NITRO: FragmentDef = {
  // 亚硝酸式：N 原点，两个 O 各 120°（一双一单），attach-H 沿 +x（N-H 1.01）
  id: 'nitro', name: '硝基', short: 'NO₂', formula: 'HNO₂',
  atoms: [
    { symbol: 'N', x: 0, y: 0, z: 0 },
    { symbol: 'H', x: 1.01, y: 0, z: 0 },
    { symbol: 'O', x: 1.22 * Math.cos(2 * Math.PI / 3), y: 1.22 * Math.sin(2 * Math.PI / 3), z: 0 },
    { symbol: 'O', x: 1.22 * Math.cos(4 * Math.PI / 3), y: 1.22 * Math.sin(4 * Math.PI / 3), z: 0 },
  ],
  bonds: [
    { a: 0, b: 1, order: 1 },
    { a: 0, b: 2, order: 2 },
    { a: 0, b: 3, order: 1 },
  ],
  attachIndex: 0, attachHIndex: 1,
}

// ── 片段库 ────────────────────────────────────────────────────────────────────

export const FRAGMENTS: FragmentDef[] = [
  makeRing({ id: 'benzene',      name: '苯环',         short: 'Ph',  formula: 'C₆H₆',
             n: 6, cc: 1.39, orders: [2, 1, 2, 1, 2, 1], pucker: 0,     hPerC: 1 }),
  makeRing({ id: 'cyclohexane',  name: '环己烷（椅式）', short: 'Cy',  formula: 'C₆H₁₂',
             n: 6, cc: 1.53, orders: [1, 1, 1, 1, 1, 1], pucker: 0.237, hPerC: 2 }),
  makeRing({ id: 'cyclopentane', name: '环戊烷',        short: 'Cp',  formula: 'C₅H₁₀',
             n: 5, cc: 1.54, orders: [1, 1, 1, 1, 1],    pucker: 0,     hPerC: 2 }),
  makeRing({ id: 'cyclopropane', name: '环丙烷',        short: 'C₃',  formula: 'C₃H₆',
             n: 3, cc: 1.51, orders: [1, 1, 1],          pucker: 0,     hPerC: 2 }),
  METHYL, AMINO, HYDROXYL, CARBOXYL, NITRO,
]

export function getFragment(id: string): FragmentDef | undefined {
  return FRAGMENTS.find(f => f.id === id)
}
