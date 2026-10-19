/**
 * GeometryRelaxer（2D→3D 展开 / 几何松弛）的力场式调参。
 * 改这些只影响松弛的收敛手感与展开形状，不影响别处。
 */
export const RELAX = {
  /** 起始 z 抖动幅度（Å）：打破平面共面，让松弛能立体展开 */
  jitter: 0.6,
  /** 键长约束刚度 */
  bondK: 1.0,
  /** 键角（以 1-3 距离表达）约束刚度 */
  angleK: 0.55,
  /** 非键排斥刚度 */
  repulseK: 0.5,
  /** 非键排斥触发距离（Å）：近于此距离才施加排斥 */
  repulseDist: 2.0,
  /** 目标锚定（拉向 CG 终点）刚度 */
  attractK: 0.12,
  /** 收敛残差阈值（Å）：单步最大位移低于此值即视为收敛 */
  convergeThreshold: 1e-3,
  /** 确定性 RNG 种子：与 conformer 生成共用，保证结果可复现 */
  seed: 0x5eed,
}
