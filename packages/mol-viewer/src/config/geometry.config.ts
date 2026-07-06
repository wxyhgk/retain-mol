/**
 * VSEPR 几何规则配置
 * 键角单位：度
 */

export type GeometryName =
  | 'linear'            // 直线型        180°
  | 'bent'              // V 形          ~104.5° (sp3 O/S)
  | 'trigonal-planar'   // 平面三角      120°
  | 'trigonal-pyramidal'// 三角锥        ~107°  (sp3 N)
  | 'tetrahedral'       // 四面体        109.47°
  | 'octahedral'        // 八面体        90°
  | 'free'              // 无约束（单原子）

export interface GeometryRule {
  name: GeometryName
  /** 理想键角 (度) */
  bondAngle: number
  /** cos(键角)，预计算加速 */
  cosBondAngle: number
  /** 该几何下，第 n 个（0-based）键位的理想方向（单位向量，Y 轴为主键方向） */
  directions: [number, number, number][]
}

const DEG = Math.PI / 180

function makeRule(name: GeometryName, angle: number, dirs: [number, number, number][]): GeometryRule {
  return { name, bondAngle: angle, cosBondAngle: Math.cos(angle * DEG), directions: dirs }
}

// 四面体：4 个方向，均分 109.47°
const TET_A = Math.sqrt(8 / 9)
const TET_B = Math.sqrt(2 / 3)
const TETRAHEDRAL_DIRS: [number, number, number][] = [
  [0,             1,      0     ],
  [TET_A,        -1 / 3,  0     ],
  [-TET_A / 2,   -1 / 3,  TET_B ],
  [-TET_A / 2,   -1 / 3, -TET_B ],
]

// 平面三角：3 个方向，均分 120°
const TRIG_DIRS: [number, number, number][] = [
  [0,                  1, 0],
  [Math.sqrt(3) / 2,  -0.5, 0],
  [-Math.sqrt(3) / 2, -0.5, 0],
]

// 直线型：2 个方向，180°
const LINEAR_DIRS: [number, number, number][] = [
  [0, 1, 0],
  [0, -1, 0],
]

// 八面体：6 个方向，90°
const OCT_DIRS: [number, number, number][] = [
  [0, 1, 0], [0, -1, 0],
  [1, 0, 0], [-1, 0, 0],
  [0, 0, 1], [0, 0, -1],
]

export const GEOMETRY_RULES: Record<GeometryName, GeometryRule> = {
  'tetrahedral':        makeRule('tetrahedral',        109.47, TETRAHEDRAL_DIRS),
  'trigonal-planar':    makeRule('trigonal-planar',    120,    TRIG_DIRS),
  'linear':             makeRule('linear',             180,    LINEAR_DIRS),
  'bent':               makeRule('bent',               104.5,  TETRAHEDRAL_DIRS.slice(0, 2)),
  'trigonal-pyramidal': makeRule('trigonal-pyramidal', 107,    TETRAHEDRAL_DIRS.slice(0, 3)),
  'octahedral':         makeRule('octahedral',         90,     OCT_DIRS),
  'free':               makeRule('free',               360,    [[1, 0, 0]]),
}

// ── 杂化 ──────────────────────────────────────────────────────────────────────

/**
 * 杂化类型（GEOMETRY_RULES 查表键的一部分）。
 * 推断算法见 lib/builder/analysis/hybridization.ts。
 */
export type AtomHybridization = 'sp' | 'sp2' | 'sp3'

// ── 几何查表 ──────────────────────────────────────────────────────────────────

type HybridGeometryMap = Record<AtomHybridization, GeometryName>

/**
 * 元素 → 杂化 → 几何名（纯数据，加新元素只改这张表）
 * 未列出的元素走 DEFAULT_GEOMETRY（tetrahedral/trigonal-planar/linear）
 */
const ELEMENT_GEOMETRY_TABLE: Partial<Record<string, HybridGeometryMap>> = {
  C:  { sp: 'linear',  sp2: 'trigonal-planar', sp3: 'tetrahedral'         },
  N:  { sp: 'linear',  sp2: 'trigonal-planar', sp3: 'trigonal-pyramidal'  },
  O:  { sp: 'linear',  sp2: 'trigonal-planar', sp3: 'bent'                },
  S:  { sp: 'linear',  sp2: 'trigonal-planar', sp3: 'bent'                },
  B:  { sp: 'linear',  sp2: 'trigonal-planar', sp3: 'trigonal-planar'     }, // 缺电子，始终 sp2
  Be: { sp: 'linear',  sp2: 'linear',          sp3: 'linear'              },
  Si: { sp: 'linear',  sp2: 'trigonal-planar', sp3: 'tetrahedral'         },
  Al: { sp: 'linear',  sp2: 'trigonal-planar', sp3: 'tetrahedral'         },
  Ge: { sp: 'linear',  sp2: 'trigonal-planar', sp3: 'tetrahedral'         },
}

const DEFAULT_GEOMETRY: HybridGeometryMap = {
  sp: 'linear', sp2: 'trigonal-planar', sp3: 'tetrahedral',
}

/** 末端原子（无需考虑下一键方向） */
const TERMINAL_ELEMENTS = new Set(['H', 'F', 'Cl', 'Br', 'I'])

/** 过渡金属，默认八面体 */
const OCTAHEDRAL_METALS = new Set(['Fe', 'Co', 'Ni', 'Mn', 'Cr', 'Mo', 'W'])

/**
 * 根据元素、连接数和杂化，查表返回几何名。
 * 不再有 switch/case，加新元素只需在 ELEMENT_GEOMETRY_TABLE 里加一行。
 */
export function inferGeometry(
  symbol: string,
  connectionCount: number,
  hybridization: AtomHybridization = 'sp3',
): GeometryName {
  if (TERMINAL_ELEMENTS.has(symbol)) return 'free'
  if (OCTAHEDRAL_METALS.has(symbol)) return 'octahedral'
  // 超价磷（5+ 键）
  if (symbol === 'P' && connectionCount >= 4) return 'octahedral'

  return (ELEMENT_GEOMETRY_TABLE[symbol] ?? DEFAULT_GEOMETRY)[hybridization]
}

// ── 键长查找表 ────────────────────────────────────────────────────────────────

/**
 * 键长查找表 (Å)
 * key 格式："{A}{sep}{B}"，A/B 按字母序排列
 * sep: '-' 单键, '=' 双键, '#' 三键
 */
export const STANDARD_BOND_LENGTHS: Record<string, number> = {
  // C
  'C-C':  1.540, 'C=C': 1.340, 'C#C': 1.200,
  'C-H':  1.090,
  'C-N':  1.470, 'C=N': 1.280, 'C#N': 1.160,
  'C-O':  1.430, 'C=O': 1.210,
  'C-F':  1.350,
  'C-Cl': 1.770,
  'C-Br': 1.940,
  'C-I':  2.140,
  'C-S':  1.820, 'C=S': 1.610,
  'C-P':  1.840, 'C=P': 1.665,
  'C-Si': 1.870,
  // N
  'N-H':  1.010,
  'N-N':  1.450, 'N=N': 1.250, 'N#N': 1.100,
  'N-O':  1.400, 'N=O': 1.210,
  // O
  'O-H':  0.960,
  'O-O':  1.480, 'O=O': 1.210,
  'O-S':  1.650, 'O=S': 1.480,
  'O-P':  1.610, 'O=P': 1.480,
  // misc
  'S-H':  1.340,
  'S-S':  2.050,
  'P-H':  1.420,
  'Si-H': 1.480,
}

const ORDER_SEP = { 1: '-', 2: '=', 3: '#' } as const

import { getElementConfig } from './elements.config'
import { BONDING } from './bonding.config'

/**
 * 查询给定键级下两原子间的预期键长（Å）。
 * 对单键：如不在表中，用共价半径之和估算。
 * 对双/三键：如不在表中，返回 null（表示该对原子不形成此键级）。
 */
export function lookupBondLengthByOrder(sym1: string, sym2: string, order: 1 | 2 | 3): number | null {
  const [a, b] = [sym1, sym2].sort()
  const exact = STANDARD_BOND_LENGTHS[`${a}${ORDER_SEP[order]}${b}`]
  if (exact !== undefined) return exact
  if (order > 1) return null
  const r1 = getElementConfig(sym1).covalentRadius
  const r2 = getElementConfig(sym2).covalentRadius
  return (r1 + r2) * BONDING.singleBondRadiusFactor
}

/** 单键键长（向后兼容） */
export function lookupBondLength(sym1: string, sym2: string): number {
  return lookupBondLengthByOrder(sym1, sym2, 1)!
}

/** 基于几何的芳香性判定的环大小 / 配位数限制。 */
export const AROMATICITY = {
  /** findRings 检测的最大简单环原子数（覆盖常见芳香环，避免大环误检） */
  maxDetectRingSize: 8,
  /** 判定芳香的环大小窗口（原子数）：5–7 环之外直接否定 */
  minRingSize: 5,
  maxRingSize: 7,
  /** 环上原子的最大配位数（> 此值不可能是 sp2 芳香） */
  maxSp2Degree: 3,
}
