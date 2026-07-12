import { createObjectPositionWriteEditSession } from '@/domain/viewer/editSessions'
import { useMoleculeStore } from '@/domain/viewer/moleculeState'
import { moleculePositionWriter } from '@/domain/moleculePositionWriter'
import { captureActiveMoleculeTarget, isMoleculeTargetCurrent } from '@/domain/moleculeAsyncTarget'
import { morphObjectPositions } from '@/features/molecule-animation'
import { minimizeWithMmff } from '@/features/molecular-computation'
import { selectFastForceField } from '../domain/forceFieldPolicy'
import { uffOptimizeAsync } from '../infrastructure/uffClient'
import { optimizeWithGfn2XtbStream } from '../infrastructure/xtbClient'

export interface GeometryOptimizationOutcome {
  ok: boolean
  message: string
}

function currentTargetOrFailure(requireBonds: boolean) {
  const target = captureActiveMoleculeTarget(useMoleculeStore.getState())
  if (!target || target.revision.atoms.length < 2) return null
  if (requireBonds && target.revision.bonds.length === 0) return null
  return target
}

export async function optimizeActiveWithForceField(): Promise<GeometryOptimizationOutcome> {
  const target = currentTargetOrFailure(true)
  if (!target) return { ok: false, message: '当前分子没有可优化的键合结构' }
  try {
    const molecule = target.revision
    const preferredMethod = selectFastForceField(molecule)
    let result = preferredMethod === 'MMFF94'
      ? await minimizeWithMmff(molecule)
      : { molecule, ok: false, reason: '结构规模或元素超出 MMFF94 快速优化范围' }
    let method = 'MMFF94'
    if (!result.ok) {
      const uff = await uffOptimizeAsync(molecule)
      if (!uff.ok || !uff.molecule) return { ok: false, message: uff.reason ?? 'UFF 优化失败' }
      result = { molecule: uff.molecule, ok: true }
      method = 'UFF'
    }
    if (!isMoleculeTargetCurrent(useMoleculeStore.getState(), target)) {
      return { ok: false, message: '分子已更改，已丢弃过期的优化结果' }
    }
    await morphObjectPositions(target.objectId, result.initial ?? molecule, result.molecule, {
      writer: moleculePositionWriter,
    })
    return { ok: true, message: `${method} 优化完成` }
  } catch (error) {
    return {
      ok: false,
      message: `快速优化失败：${error instanceof Error ? error.message : '未知错误'}`,
    }
  }
}

export async function refineActiveWithGfn2Xtb(
  onProgress?: (message: string) => void,
): Promise<GeometryOptimizationOutcome> {
  const target = currentTargetOrFailure(false)
  if (!target) return { ok: false, message: '当前分子至少需要两个原子' }
  const controller = new AbortController()
  const session = createObjectPositionWriteEditSession(target.objectId)
  let expectedRevision = target.revision
  session.start()
  try {
    const writeFrame = (molecule: typeof target.revision) => {
      const current = useMoleculeStore.getState().objectsById[target.objectId]?.molecule
      if (current !== expectedRevision) {
        controller.abort()
        throw new Error('分子在 xTB 优化期间被修改，已停止轨迹播放')
      }
      session.write(new Map(molecule.atoms.map(atom => [atom.id, {
        x: atom.x, y: atom.y, z: atom.z,
      }])))
      expectedRevision = useMoleculeStore.getState().objectsById[target.objectId]?.molecule
        ?? expectedRevision
    }
    const result = await optimizeWithGfn2XtbStream(target.revision, {
      signal: controller.signal,
      onStatus: onProgress,
      onFrame: frame => {
        writeFrame(frame.molecule)
        onProgress?.(
          `GFN2-xTB · 第 ${frame.step} 步 · ${frame.energy.toFixed(8)} Eh · |g| ${frame.gnorm.toExponential(2)}`,
        )
      },
    })
    writeFrame(result.molecule)
    const convergence = result.converged ? '收敛' : '达到步数上限'
    return {
      ok: result.converged,
      message: `GFN2-xTB ${convergence} · ${result.steps} 步 · ${result.energy.toFixed(8)} Eh`,
    }
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'GFN2-xTB 优化失败' }
  } finally {
    controller.abort()
    session.end()
  }
}
