/**
 * Gaussian 子系统的核心类型定义。
 * 所有 config / io / components 都依赖这里，反向不允许。
 */

export type GaussianCalcType =
  | 'sp'           // Single Point
  | 'opt'          // Geometry Optimization
  | 'freq'         // Frequency Analysis
  | 'opt freq'     // Opt + Freq
  | 'irc'          // Intrinsic Reaction Coordinate
  | 'td'           // Time-Dependent DFT (激发态)
  | 'nmr'          // NMR Chemical Shifts
  | 'scan'         // Potential Energy Surface Scan

export type GaussianSolventModel = 'none' | 'PCM' | 'SMD' | 'CPCM'

export type GaussianCoordType = 'cartesian' | 'zmatrix'

export interface GaussianJobConfig {
  // ── 计算设置 ──
  calcType: GaussianCalcType
  method: string
  basisSet: string

  // ── 溶剂 ──
  solventModel: GaussianSolventModel
  solvent: string

  // ── 分子设置 ──
  charge: number
  multiplicity: number
  coordType: GaussianCoordType

  // ── 作业资源 ──
  title: string
  memory: string       // '4GB' 等
  nproc: number
  checkpointFile: string  // '' 表示用默认名

  // ── 高级 ──
  extraKeywords: string
  dispersion: string   // '' | 'GD3' | 'GD3BJ' | 'D3Zero'
  gridType: string     // '' | 'UltraFine' | 'SuperFine'
}

export const DEFAULT_GAUSSIAN_CONFIG: GaussianJobConfig = {
  calcType: 'opt',
  method: 'B3LYP',
  basisSet: '6-31G(d)',
  solventModel: 'none',
  solvent: 'Water',
  charge: 0,
  multiplicity: 1,
  coordType: 'cartesian',
  title: '',
  memory: '4GB',
  nproc: 4,
  checkpointFile: '',
  extraKeywords: '',
  dispersion: '',
  gridType: 'UltraFine',
}
