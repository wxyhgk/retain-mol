/**
 * 2D 覆盖层（MeasureOverlay / AtomLabelOverlay）的视觉常量。
 * 这些是"开发者可调、用户不改"的参数——抽出来方便统一调整，
 * 不放进 store / Theme，避免污染用户数据层。
 */

export const MEASURE_LABEL = {
  /** 相对 3D 锚点的屏幕偏移（px） */
  offsetX: 12,
  offsetY: -12,
  /** 文字内边距 */
  paddingX: 5,
  paddingYTop: 3,
  paddingYBottom: 3,
  /** 圆角 */
  radius: 5,
  /** 背景色（深色 pill） */
  backgroundColor: 'rgba(17, 24, 39, 0.92)',
  /** 文字色 */
  textColor: '#ffffff',
  /** 左侧类型指示色条宽度 */
  accentBarWidth: 2,
  /** 字体（fontSize 由 measureStyle 控制；family 在此） */
  fontFamily: 'monospace',
  fontWeight: 'bold' as const,
}

export const ATOM_LABEL = {
  /** 相对原子屏幕位置的偏移 */
  offsetX: 12,
  offsetY: -10,
  paddingX: 3,
  paddingY: 7,
  height: 14,
  radius: 3,
  backgroundColor: 'rgba(17, 24, 39, 0.9)',
  textColor: '#ffffff',
  /** 视口外原子的裁剪余量 */
  viewportMargin: 20,
  font: 'bold 10px monospace',
  /** 基准字体大小（px），随相机距离缩放 */
  baseFontSize: 10,
  /** 缩放比例范围（远近限幅） */
  scaleMin: 0.4,
  scaleMax: 2.5,
}

/** 测量可视化（3D 弧线、平面、虚线）常量 */
export const MEASURE_VIS = {
  /** 测量虚线参数（Line2，单位 Å） */
  lineDashSize: 0.18,
  lineGapSize:  0.09,
  /** 测量锚点球体 */
  pointRadius:   0.12,
  pointSegments: 12,
  /** 角度 / 二面角弧线 */
  arcRadius:   0.55,    // 角度弧半径（Å）
  arcSegments: 48,      // 弧线采样点数
  arcTickMin:  0.8,     // 弧端刻度线内端系数
  arcTickMax:  1.2,     // 弧端刻度线外端系数
  arcLabelOffset: 0.35, // 标签到弧外沿的额外偏移（Å）
  /** 二面角平面填充 */
  dihedralPadU:       0.3,  // 键方向填充（Å）
  dihedralPadV:       0.4,  // 垂直方向填充（Å）
  dihedralVMinFactor: 0.3,  // vMin = -padV × vMinFactor
  dihedralPlaneOpacity: 0.32,
  /** 二面角弧半径 = min(vMax1, vMax4) × arcRadiusScale + arcRadiusBase */
  dihedralArcRadiusScale: 0.5,
  dihedralArcRadiusBase:  0.2,
}

/** 框选矩形外观 */
export const BOX_SELECT = {
  fillColor:   'rgba(0, 0, 0, 0.08)',
  strokeColor: '#111827',
  lineWidth:   1,
  lineDash:    [4, 3] as number[],
}
