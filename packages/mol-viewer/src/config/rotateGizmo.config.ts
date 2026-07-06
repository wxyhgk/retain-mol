/**
 * RotateGizmo 的视觉与交互常量。
 * 改这些不会影响旋转数学，只影响"长啥样 / 怎么指引"。
 */

export const GIZMO_RING = {
  /** 圆环折线分段数；越大越圆 */
  segments: 128,
  /** 半径自适应：R = clamp( maxDistFromPivot × factor + add, min, max ) */
  radiusPaddingFactor: 1.15,
  radiusPaddingAdd: 0.4,
  radiusMin: 0.8,
  radiusMax: 4.0,
}

export const GIZMO_LINE = {
  frontLinewidth: 3,
  backLinewidth: 2,
  backOpacity: 0.25,
  dashSize: 0.16,
  gapSize: 0.12,
  /** |axis · camForward| 超过此值视为"面对相机"，隐藏后半虚线 */
  faceOnThreshold: 0.88,
  /** hover 时前环线宽在 frontLinewidth 基础上加粗的量 */
  hoverLinewidthBump: 2,
}

export const GIZMO_PICKER = {
  /** 隐形 torus picker 的 tube 半径（决定 hit 区域宽度；数值大 = 更易命中环、更难误触原子） */
  tubeRadius: 0.18,
  /** picker torus 的径向 / 管向分段 */
  radialSegments: 8,
  tubularSegments: 96,
}

export const GIZMO_ARROW = {
  count: 4,
  coneRadius: 0.04,
  coneHeight: 0.12,
  /** 箭头圆锥分段 */
  coneSegments: 10,
}

export const GIZMO_COLOR = {
  /** 默认浅灰 */
  idle: 0xa1a1aa,
  /** Hover 变黑 */
  hover: 0x111827,
}
