/**
 * 自动推断成键的参数。改这些会直接影响 inferBonds 的结果。
 */

export const BONDING = {
  /** 键长容差系数：maxBond = (r1 + r2) × tolerance。
   *  1.15 严格；1.3 默认；1.5+ 宽松（可能把非键原子错连） */
  tolerance: 1.3,
  /** 最小键长（Å）：小于此值视为同一原子或错误数据，不成键 */
  minBondLength: 0.4,
}

/** 用于 inferBonds 距离阈值的共价半径（Å） */
export const BOND_RADII: Record<string, number> = {
  H: 0.31, C: 0.77, N: 0.75, O: 0.73, F: 0.71, P: 1.07, S: 1.05,
  Cl: 1.02, Br: 1.14, I: 1.33, default: 0.9,
}
