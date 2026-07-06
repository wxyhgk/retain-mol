/**
 * moleculeOpt —— 主线程侧的分子优化入口，把请求转发给后台 Worker。
 * 单例 Worker，按自增 id 匹配请求/响应。
 */
import type { Molecule, OptimizeResult } from '@retainmol/mol-viewer'
import { useMoleculeStore, GeometryRelaxer } from '@retainmol/mol-viewer'
import { OPTIMIZE_ANIM } from '../config/optimize.config'

export const OCL_RESOURCE_URL = `${import.meta.env.BASE_URL}ocl/resources.json`

let worker: Worker | null = null
let seq = 0
const pending = new Map<number, (r: OptimizeResult) => void>()

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL('../workers/molOpt.worker.ts', import.meta.url), { type: 'module' })
    worker.onmessage = (e: MessageEvent<{ id: number; result: OptimizeResult }>) => {
      const { id, result } = e.data
      pending.get(id)?.(result)
      pending.delete(id)
    }
  }
  return worker
}

function run(op: 'gen3d' | 'minimize', mol: Molecule): Promise<OptimizeResult> {
  const id = ++seq
  return new Promise(resolve => {
    pending.set(id, resolve)
    getWorker().postMessage({ id, op, mol, resourceUrl: OCL_RESOURCE_URL })
  })
}

/** 2D→3D 立体化（后台线程，不冻结 UI） */
export function generate3DAsync(mol: Molecule): Promise<OptimizeResult> {
  return run('gen3d', mol)
}

/** 几何清理（后台线程） */
export function minimizeGeometryAsync(mol: Molecule): Promise<OptimizeResult> {
  return run('minimize', mol)
}

type XYZ = { x: number; y: number; z: number }

/** 压平分子（z→0）——作为「平面→3D 折叠」morph 动画的起点 */
export function flattenMolecule(mol: Molecule): Molecule {
  return { ...mol, atoms: mol.atoms.map(a => ({ ...a, z: 0 })) }
}

/**
 * 逐帧几何松弛动画：分子已以平面结构落在场景（objectId），本函数用 GeometryRelaxer
 * 从平面出发、每帧真实迭代一步、写回坐标并重绘，让用户看着它实时摊开成 3D。
 *
 * 关键：传入 `target`（ConformerGenerator 的高质量最终结构）后，松弛器会朝它逐帧
 * 锚定——过程由几何约束保证中间帧合理（键长稳定、不穿插），终点精确落在 CG 结果上
 * （环正确、含 H）。既有「看得见的展开过程」，又保住成熟距离几何的质量。
 * 整段包在一个 undo 事务里 → 只产生一步 undo。
 */
export function relaxAnimate(
  objectId: string,
  mol: Molecule,
  opts: { itersPerFrame?: number; maxFrames?: number; target?: Molecule; jitter?: number } = {},
): Promise<void> {
  const { target, jitter } = opts
  const { itersPerFrame = OPTIMIZE_ANIM.itersPerFrame, maxFrames = target ? OPTIMIZE_ANIM.maxFramesTargeted : OPTIMIZE_ANIM.maxFramesFree } = opts
  const store = useMoleculeStore.getState()
  const targetMap = target
    ? new Map(target.atoms.map(a => [a.id, { x: a.x, y: a.y, z: a.z }]))
    : undefined
  const relaxer = new GeometryRelaxer(mol, {
    ...(targetMap ? { target: targetMap } : {}),
    ...(jitter !== undefined ? { jitter } : {}),
  })
  store.beginTransaction()
  return new Promise<void>(resolve => {
    let frame = 0
    const tick = () => {
      relaxer.step(itersPerFrame)
      store.setObjectAtomPositions(objectId, relaxer.positions())
      frame++
      if ((!targetMap && relaxer.converged) || frame >= maxFrames) {
        if (targetMap) store.setObjectAtomPositions(objectId, targetMap)  // 精确落到 CG 终点
        store.endTransaction()
        resolve()
      } else {
        requestAnimationFrame(tick)
      }
    }
    requestAnimationFrame(tick)
  })
}

/**
 * 在场景对象上把坐标从 from 平滑插值到 to（缓出），让用户看到「优化过程」。
 * OCL 的 MMFF 不给中间帧，故用 初始↔最终 morph 近似弛豫动画。
 * 整段包在一个 undo 事务里 → 只产生一步 undo。from/to 需同一原子集（按 id）。
 */
export function morphObjectPositions(
  objectId: string, from: Molecule, to: Molecule, durationMs = OPTIMIZE_ANIM.morphDurationMs,
): Promise<void> {
  const store = useMoleculeStore.getState()
  const fromMap = new Map<string, XYZ>(from.atoms.map(a => [a.id, { x: a.x, y: a.y, z: a.z }]))
  const toMap = new Map<string, XYZ>(to.atoms.map(a => [a.id, { x: a.x, y: a.y, z: a.z }]))
  const frame = (t: number) => {
    const positions = new Map<string, XYZ>()
    for (const [id, b] of toMap) {
      const a = fromMap.get(id)
      positions.set(id, a
        ? { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, z: a.z + (b.z - a.z) * t }
        : b)   // 新原子（如导入补的 H）直接落终点
    }
    store.setObjectAtomPositions(objectId, positions)
  }
  store.beginTransaction()
  frame(0)                       // 同步落到起点，避免先闪一下终点
  const t0 = performance.now()
  return new Promise<void>(resolve => {
    const step = (now: number) => {
      const raw = Math.min(1, (now - t0) / durationMs)
      frame(1 - (1 - raw) ** 3)   // ease-out cubic
      if (raw < 1) requestAnimationFrame(step)
      else { store.endTransaction(); resolve() }
    }
    requestAnimationFrame(step)
  })
}
