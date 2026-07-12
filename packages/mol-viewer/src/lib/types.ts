/**
 * 跨层共享的纯类型与常量。
 * config/ lib/ store/ 都可以依赖它；反向依赖不允许。
 */

import type { Vector3 } from 'three'

// ── 分子核心类型（叶子层）─────────────────────────────────────────────────────

export interface Atom {
  readonly id: string
  readonly symbol: string
  readonly x: number
  readonly y: number
  readonly z: number
  /** 形式电荷（价态完整模型下会改变该原子的有效成键数） */
  readonly charge?: number
  /** 未配对电子数（自由基）；每个占一个价位，并计入分子多重度 */
  readonly radical?: number
  readonly label?: string
  /** Builder-authored transition-metal coordination preset. */
  readonly coordinationGeometry?: string
  /** World-space unit vectors for the authored coordination sites. */
  readonly coordinationDirections?: readonly (readonly [number, number, number])[]
  /** Hard bonding capacity supplied by the selected coordination preset. */
  readonly coordinationNumber?: number
}

export interface Bond {
  readonly id: string
  readonly atomId1: string
  readonly atomId2: string
  readonly order: 1 | 2 | 3
  readonly aromatic?: boolean
}

export interface Molecule {
  readonly atoms: readonly Atom[]
  readonly bonds: readonly Bond[]
  readonly name?: string
}

/** 拖出生长时的候选槽位参考几何（化学层计算，渲染层消费），含幽灵原子外观 */
export type GrowGuideSpec =
  | { kind: 'ring'; center: Vector3; axis: Vector3; radius: number; ghostRadius: number; ghostColor: number }
  | { kind: 'points'; positions: Vector3[]; ghostRadius: number; ghostColor: number }
  | null

export type DisplayMode = 'ball-stick' | 'spacefill' | 'stick' | 'wireframe' | 'tube' | 'mtube'
/**
 * select 是合并了选择与构建的智能指针（默认工具）：
 * 单击选择 / 点 H 生长 / 拖 H 成键 / 构建态单击空白加原子。
 */
export type Tool = 'select' | 'measure' | 'move-object'
export type MeasureType = 'auto' | 'distance' | 'angle' | 'dihedral'

export const MEASURE_ATOM_COUNT: Record<MeasureType, number> = {
  auto: 4,
  distance: 2,
  angle: 3,
  dihedral: 4,
}

export interface Measurement {
  readonly id: string
  readonly type: MeasureType
  readonly atomIds: readonly string[]
}

export interface MeasureStyle {
  fontSize: number       // 标注文字大小 px
  lineWidth: number      // 连线 / 弧线宽度 px
  lineColor: string      // 虚线 + 距离弧
  angleColor: string     // 键角弧
  planeColor1: string    // 二面角平面1
  planeColor2: string    // 二面角平面2
}

// ── 内部分子剪贴板（Ctrl+C / Ctrl+V）────────────────────────────────────────

export interface ClipboardAtom {
  symbol: string
  x: number; y: number; z: number
  charge?: number
  radical?: number
  coordinationGeometry?: string
  coordinationDirections?: readonly (readonly [number, number, number])[]
  coordinationNumber?: number
}

export interface ClipboardBond {
  a: number   // index into ClipboardAtom[]
  b: number
  order: 1 | 2 | 3
  aromatic?: boolean
}

export interface MolClipboard {
  atoms: ClipboardAtom[]
  bonds: ClipboardBond[]
}

export const DEFAULT_MEASURE_STYLE: MeasureStyle = {
  fontSize: 11,
  lineWidth: 2,
  lineColor: '#111827',
  angleColor: '#6b7280',
  // 二面角两个平面需要明显色差才看得清，沿用化学惯例：蓝 / 红
  planeColor1: '#3b82f6',
  planeColor2: '#ef4444',
}
