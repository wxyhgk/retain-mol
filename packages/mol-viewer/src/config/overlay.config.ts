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
}
