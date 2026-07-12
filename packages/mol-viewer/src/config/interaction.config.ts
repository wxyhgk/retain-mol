/**
 * 用户交互的阈值与速度参数。
 */

export const INTERACTION = {
  /** V 工具（move-object）：单帧位移低于此值（px）时忽略，避免抖动 */
  transformMinDisplacement: 0.5,
  /** V 工具：Alt + 拖拽旋转时，像素位移 → 弧度的换算系数 */
  rotateSpeedFactor: 0.008,
  /** 原子拖拽：鼠标按下后移动超过此距离（px）才触发拖拽，防止误触 */
  dragStartThreshold: 4,
  /** 原子双击：两次点击在此时间窗（ms）内才合并为双击 */
  doubleClickDelay: 280,
  /** 原子双击：两次点击的屏幕距离不得超过此值（px） */
  doubleClickDistance: 5,
  /** 框选：宽或高低于此值（px）时视为误触，不执行选择 */
  boxSelectMinSize: 3,
}

/**
 * 新几何的放置偏移（Å）：把新对象 / 粘贴内容摆到现有分子右侧，避免重叠。
 * 注意 pasteOffsetX 与 addObjectOffsetX 目前值不同（历史遗留），保持原样、只是集中管理。
 */
export const PLACEMENT = {
  /** 粘贴：新原子相对现有 maxX 的右移量 */
  pasteOffsetX: 3,
  /** 新增场景对象：相对现有 maxX 的右移量 */
  addObjectOffsetX: 5,
}
