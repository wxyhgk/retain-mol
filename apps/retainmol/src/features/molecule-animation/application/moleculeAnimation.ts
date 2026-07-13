import type { Molecule } from '@retainmol/mol-viewer/core'
import { GeometryRelaxer } from '@retainmol/mol-viewer/io'
import { createObjectPositionWriteEditSession } from '@/domain/viewer/editSessions'
import type { AtomPosition, MoleculePositionWriter } from '@/domain/viewer/positionWriter'
import { OPTIMIZE_ANIM } from '@/config/optimize.config'

function createPositionWriteSession(objectId: string, writer: MoleculePositionWriter) {
  const session = createObjectPositionWriteEditSession(objectId)
  return {
    start: () => session.start(),
    write: (positions: ReadonlyMap<string, AtomPosition>) => writer.setObjectAtomPositions(objectId, positions),
    end: () => session.end(),
  }
}

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
  opts: {
    writer: MoleculePositionWriter
    itersPerFrame?: number
    maxFrames?: number
    target?: Molecule
    jitter?: number
    shouldContinue?: () => boolean
    signal?: AbortSignal
  },
): Promise<void> {
  const { target, jitter, writer, shouldContinue, signal } = opts
  const { itersPerFrame = OPTIMIZE_ANIM.itersPerFrame, maxFrames = target ? OPTIMIZE_ANIM.maxFramesTargeted : OPTIMIZE_ANIM.maxFramesFree } = opts
  const targetMap = target
    ? new Map(target.atoms.map(a => [a.id, { x: a.x, y: a.y, z: a.z }]))
    : undefined
  const relaxer = new GeometryRelaxer(mol, {
    ...(targetMap ? { target: targetMap } : {}),
    ...(jitter !== undefined ? { jitter } : {}),
  })
  const session = createPositionWriteSession(objectId, writer)
  session.start()
  return new Promise<void>((resolve, reject) => {
    let frame = 0
    let rafId: number | null = null
    let finished = false
    const finish = (error?: unknown) => {
      if (finished) return
      finished = true
      if (rafId !== null) cancelAnimationFrame(rafId)
      signal?.removeEventListener('abort', onAbort)
      let finalError = error
      try {
        session.end()
      } catch (sessionError) {
        finalError ??= sessionError
      }
      if (finalError !== undefined) reject(finalError)
      else resolve()
    }
    const onAbort = () => finish()
    const tick = () => {
      rafId = null
      try {
        if (signal?.aborted || (shouldContinue && !shouldContinue())) {
          finish()
          return
        }
        relaxer.step(itersPerFrame)
        session.write(relaxer.positions())
        frame++
        if ((!targetMap && relaxer.converged) || frame >= maxFrames) {
          if (targetMap && !signal?.aborted && (!shouldContinue || shouldContinue())) {
            session.write(targetMap)
          }
          finish()
        } else {
          rafId = requestAnimationFrame(tick)
        }
      } catch (error) {
        finish(error)
      }
    }
    signal?.addEventListener('abort', onAbort, { once: true })
    if (signal?.aborted) finish()
    else rafId = requestAnimationFrame(tick)
  })
}

/**
 * 在场景对象上把坐标从 from 平滑插值到 to（缓出），让用户看到「优化过程」。
 * OCL 的 MMFF 不给中间帧，故用 初始↔最终 morph 近似弛豫动画。
 * 整段包在一个 undo 事务里 → 只产生一步 undo。from/to 需同一原子集（按 id）。
 */
export function morphObjectPositions(
  objectId: string,
  from: Molecule,
  to: Molecule,
  opts: { writer: MoleculePositionWriter; durationMs?: number },
): Promise<void> {
  const { writer, durationMs = OPTIMIZE_ANIM.morphDurationMs } = opts
  const fromMap = new Map<string, AtomPosition>(from.atoms.map(a => [a.id, { x: a.x, y: a.y, z: a.z }]))
  const toMap = new Map<string, AtomPosition>(to.atoms.map(a => [a.id, { x: a.x, y: a.y, z: a.z }]))
  const frame = (t: number) => {
    const positions = new Map<string, AtomPosition>()
    for (const [id, b] of toMap) {
      const a = fromMap.get(id)
      positions.set(id, a
        ? { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, z: a.z + (b.z - a.z) * t }
        : b)   // 新原子（如导入补的 H）直接落终点
    }
    session.write(positions)
  }
  const session = createPositionWriteSession(objectId, writer)
  session.start()
  frame(0)                       // 同步落到起点，避免先闪一下终点
  const t0 = performance.now()
  return new Promise<void>(resolve => {
    const step = (now: number) => {
      const raw = Math.min(1, (now - t0) / durationMs)
      frame(1 - (1 - raw) ** 3)   // ease-out cubic
      if (raw < 1) requestAnimationFrame(step)
      else { session.end(); resolve() }
    }
    requestAnimationFrame(step)
  })
}
