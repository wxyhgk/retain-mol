/**
 * Gaussian .log 输出文件解析器（待实现）
 *
 * 计划解析：
 * - 优化轨迹（每步能量 + 坐标）
 * - 最终优化几何（Final Structure）
 * - 振动频率 + 热力学量（ZPE, H, G, S）
 * - 激发态能量（TD-DFT）
 * - NMR 化学位移
 * - 正常/异常退出状态
 */

export interface GaussianLogResult {
  /** 正常退出 = true */
  normalTermination: boolean
  /** 最终能量（Hartree）*/
  finalEnergy?: number
  /** 优化步数 */
  optSteps?: number
  /** 每步能量历史 */
  energyHistory?: number[]
  /** 最终优化坐标（若有 opt 计算） */
  finalGeometry?: Array<{ symbol: string; x: number; y: number; z: number }>
  /** 振动频率（cm⁻¹） */
  frequencies?: number[]
  /** 零点能（kcal/mol） */
  zeroPointEnergy?: number
  /** 吉布斯自由能（Hartree） */
  gibbsFreeEnergy?: number
}

// TODO: 实现解析逻辑
export function parseGaussianLog(_logText: string): GaussianLogResult {
  throw new Error('Gaussian log parser not yet implemented')
}
