/**
 * 优化/松弛动画的编排参数（app 层，驱动几何收敛的节奏）。
 * 力场本身的物理常量在 mol-viewer 的 RELAX 里；这里只管「每帧几步、跑几帧、补间多久」。
 */
export const OPTIMIZE_ANIM = {
  /** relaxAnimate 每帧的松弛迭代步数 */
  itersPerFrame: 2,
  /** 有 CG 目标（锚定展开）时的最大帧数，较快落定 */
  maxFramesTargeted: 110,
  /** 无目标自由松弛的最大帧数 */
  maxFramesFree: 500,
  /** morph 补间（初始↔最终坐标）时长（ms） */
  morphDurationMs: 700,
}

/** 后台几何 Worker 的单次响应上限；超时后重建 Worker，避免队列永久悬挂。 */
export const MOLECULE_OPT_WORKER_TIMEOUT_MS = 60_000

/** OpenBabel WASM UFF 只用于交互式预优化，不能无限占用浏览器 Worker。 */
export const UFF_OPTIMIZE = {
  normalSteps: 300,
  largeMoleculeAtomCount: 80,
  largeMoleculeSteps: 120,
  timeoutMs: 20_000,
  tolerance: 1e-4,
} as const
