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
  /** 框选：宽或高低于此值（px）时视为误触，不执行选择 */
  boxSelectMinSize: 3,
}
