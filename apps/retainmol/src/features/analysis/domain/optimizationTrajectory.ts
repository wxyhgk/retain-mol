export interface OptimizationTrajectoryAtom {
  symbol: string
  x: number
  y: number
  z: number
}

export interface OptimizationTrajectoryFrame {
  step: number
  energy: number
  gradient: number
  atoms: OptimizationTrajectoryAtom[]
}

export interface OptimizationTrajectory {
  schemaVersion: 1
  engine: 'xtb'
  frames: OptimizationTrajectoryFrame[]
}

export function parseOptimizationTrajectory(value: unknown): OptimizationTrajectory {
  if (!value || typeof value !== 'object') throw new Error('轨迹文件不是 JSON 对象')
  const candidate = value as Partial<OptimizationTrajectory>
  if (candidate.schemaVersion !== 1 || candidate.engine !== 'xtb' || !Array.isArray(candidate.frames)) {
    throw new Error('轨迹文件版本或计算引擎不受支持')
  }
  if (candidate.frames.length === 0) throw new Error('轨迹文件没有优化步骤')
  for (const frame of candidate.frames) {
    if (
      !frame
      || !Number.isFinite(frame.step)
      || !Number.isFinite(frame.energy)
      || !Number.isFinite(frame.gradient)
      || !Array.isArray(frame.atoms)
    ) {
      throw new Error('轨迹文件包含不完整的优化步骤')
    }
  }
  return candidate as OptimizationTrajectory
}
