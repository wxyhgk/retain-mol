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
const TET_C = 1 / Math.sqrt(3)
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

/**
 * 根据原子符号和当前已有键数，推断适用的几何规则
 */
export function inferGeometry(symbol: string, currentBonds: number): GeometryName {
  switch (symbol) {
    case 'C':
      if (currentBonds <= 1) return 'tetrahedral'
      if (currentBonds === 2) return 'tetrahedral'  // 默认 sp3；sp2/sp 由键级决定
      return 'tetrahedral'
    case 'N':
      return 'trigonal-pyramidal'
    case 'O':
    case 'S':
      return currentBonds >= 2 ? 'bent' : 'tetrahedral'
    case 'B':
      return 'trigonal-planar'
    case 'P':
      return currentBonds > 3 ? 'sp3d' as GeometryName : 'tetrahedral'
    case 'Be':
      return 'linear'
    case 'H': case 'F': case 'Cl': case 'Br': case 'I':
      return 'free'
    case 'Fe': case 'Co': case 'Ni': case 'Cu': case 'Zn':
      return 'octahedral'
    default:
      return 'tetrahedral'
  }
}

/** 常见键长查找表 (Å)，key = "A-B"（字母序） */
export const STANDARD_BOND_LENGTHS: Record<string, number> = {
  'C-C':  1.540, 'C=C': 1.340, 'C#C': 1.200,
  'C-H':  1.090,
  'C-N':  1.470, 'C=N': 1.280, 'C#N': 1.160,
  'C-O':  1.430, 'C=O': 1.210,
  'C-F':  1.350,
  'C-Cl': 1.770,
  'C-Br': 1.940,
  'C-I':  2.140,
  'C-S':  1.820, 'C=S': 1.610,
  'C-P':  1.840,
  'C-Si': 1.870,
  'N-H':  1.010,
  'N-N':  1.450, 'N=N': 1.250, 'N#N': 1.100,
  'N-O':  1.400, 'N=O': 1.210,
  'O-H':  0.960,
  'O-O':  1.480,
  'S-H':  1.340,
  'P-H':  1.420,
  'Si-H': 1.480,
}

import { getElementConfig } from './elements.config'

export function lookupBondLength(sym1: string, sym2: string): number {
  const key = [sym1, sym2].sort().join('-')
  if (STANDARD_BOND_LENGTHS[key]) return STANDARD_BOND_LENGTHS[key]
  const r1 = getElementConfig(sym1).covalentRadius
  const r2 = getElementConfig(sym2).covalentRadius
  return (r1 + r2) * 1.08
}
