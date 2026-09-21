/** Renderer-neutral display, tool and preview contracts. */
import type { Vector3Data } from '../model/types'

/** 拖出生长时的候选槽位参考几何（化学层计算，渲染层消费），含幽灵原子外观 */
export type GrowGuideSpec =
  | { kind: 'ring'; center: Vector3Data; axis: Vector3Data; radius: number; ghostRadius: number; ghostColor: number }
  | { kind: 'points'; positions: readonly Vector3Data[]; ghostRadius: number; ghostColor: number }
  | null

export interface FragmentTorsionPreview {
  readonly atoms: readonly {
    readonly symbol: string
    readonly position: readonly [number, number, number]
  }[]
  readonly bonds: readonly {
    readonly start: readonly [number, number, number]
    readonly end: readonly [number, number, number]
    readonly order: 1 | 2 | 3
  }[]
}

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

export const DEFAULT_MEASURE_STYLE: MeasureStyle = {
  fontSize: 11,
  lineWidth: 2,
  lineColor: '#111827',
  angleColor: '#6b7280',
  // 二面角两个平面需要明显色差才看得清，沿用化学惯例：蓝 / 红
  planeColor1: '#3b82f6',
  planeColor2: '#ef4444',
}
