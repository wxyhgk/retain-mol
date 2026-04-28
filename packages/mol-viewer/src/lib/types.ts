/**
 * 跨层共享的纯类型与常量。
 * lib/ 与 store/ 都可以依赖它；反向依赖不允许。
 */

export type DisplayMode = 'ball-stick' | 'spacefill' | 'stick' | 'wireframe'
export type Tool = 'select' | 'add-atom' | 'add-bond' | 'delete' | 'measure'
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
