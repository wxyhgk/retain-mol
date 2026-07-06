/**
 * 自动推断成键的参数。改这些会直接影响 inferBonds 的结果。
 */

export const BONDING = {
  /** 键长容差系数：maxBond = (r1 + r2) × tolerance。
   *  1.15 严格；1.3 默认；1.5+ 宽松（可能把非键原子错连） */
  tolerance: 1.3,
  /** 最小键长（Å）：小于此值视为同一原子或错误数据，不成键 */
  minBondLength: 0.4,
  /** 用共价半径估算单键键长时的经验修正系数 */
  singleBondRadiusFactor: 1.08,
  /** 用于键级判断：midpoint 偏移量（Å）。
   *  正常用 (d_n + d_{n+1})/2 做阈值；此值让阈值向短键方向收紧，减少误判。 */
  orderMidpointBias: 0.02,
  /** 并环（fuseFragmentOnBond）：新原子与已有同元素原子距离小于此 → 合并共用 */
  fuseMergeEps: 0.45,
  /** 并环（fuseFragmentOnBond）：距离小于此（且不可合并）→ 此侧空间被占，翻面重试 */
  fuseClashEps: 0.7,
}
