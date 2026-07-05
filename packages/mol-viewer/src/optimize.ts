/**
 * 无 DOM 依赖的优化入口 —— 供 Web Worker 导入（主 index.ts 的 barrel 会拉进
 * 渲染器/React/three 等 DOM 代码，在 Worker 里引用 window 会崩）。
 * 这里只 re-export io/molFormat 的纯计算函数（仅依赖 openchemlib + 纯 lib）。
 */
export {
  generate3D, minimizeGeometry, registerForceFieldFromUrl, markForceFieldReady,
} from './lib/io/molFormat'
export type { OptimizeResult } from './lib/io/molFormat'
export type { Molecule, Atom, Bond } from './lib/types'
