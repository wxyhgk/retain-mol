/**
 * UFF client —— 主线程侧 UFF 力场优化入口，转发给 OpenBabel WASM Worker。
 *
 * 用途：MMFF94（OCL）不支持硼/过渡金属，UFF（Universal Force Field）覆盖全周期表。
 * 优化按钮在 MMFF 失败时回退到这里。OpenBabel 是 GPL，仅 app 层使用。
 *
 * 分子经 exportSdf → OpenBabel readString → UFF 优化 → 读回坐标，按原子顺序映射回来
 *（exportSdf 的原子顺序与 mol.atoms 一致，OpenBabel readString 不重排、不加氢）。
 */
import type { Molecule } from '@retainmol/mol-viewer/core'
import { exportSdf } from '@retainmol/mol-viewer/io'
import { UFF_OPTIMIZE } from '@/config/optimize.config'

export interface UffResult {
  ok: boolean
  molecule?: Molecule
  energyBefore?: number
  energyAfter?: number
  reason?: string
}

type WorkerMsg = {
  id: number
  ok: boolean
  coords?: [number, number, number][]
  energyBefore?: number
  energyAfter?: number
  reason?: string
}

let worker: Worker | null = null
let seq = 0
type Pending = {
  resolve: (r: WorkerMsg) => void
  timeout: ReturnType<typeof setTimeout>
}
const pending = new Map<number, Pending>()

function settle(id: number, result: WorkerMsg) {
  const request = pending.get(id)
  if (!request) return
  pending.delete(id)
  clearTimeout(request.timeout)
  request.resolve(result)
}

function failWorker(failedWorker: Worker, reason: string) {
  if (worker !== failedWorker) return
  worker = null
  failedWorker.terminate()
  for (const id of [...pending.keys()]) settle(id, { id, ok: false, reason })
}

function getWorker(): Worker {
  if (!worker) {
    // 经典 Worker（public 下的 openbabel-worker.js，用 importScripts 加载 UMD glue）
    const nextWorker = new Worker(`${import.meta.env.BASE_URL}openbabel-worker.js`)
    nextWorker.onmessage = (e: MessageEvent<WorkerMsg>) => {
      if (worker !== nextWorker) return
      settle(e.data.id, e.data)
    }
    nextWorker.onerror = (event) => {
      event.preventDefault()
      failWorker(nextWorker, event.message || 'UFF Worker 运行失败')
    }
    nextWorker.onmessageerror = () => failWorker(nextWorker, 'UFF Worker 返回了无法解析的数据')
    worker = nextWorker
  }
  return worker
}

/** UFF 几何优化（后台 Worker，全元素含硼）。失败返回 ok:false + reason。 */
export function uffOptimizeAsync(
  mol: Molecule,
  options: { steps?: number; timeoutMs?: number; tolerance?: number } = {},
): Promise<UffResult> {
  const sdf = exportSdf(mol)
  const id = ++seq
  const steps = options.steps ?? (mol.atoms.length >= UFF_OPTIMIZE.largeMoleculeAtomCount
    ? UFF_OPTIMIZE.largeMoleculeSteps
    : UFF_OPTIMIZE.normalSteps)
  const timeoutMs = options.timeoutMs ?? UFF_OPTIMIZE.timeoutMs
  const tolerance = options.tolerance ?? UFF_OPTIMIZE.tolerance
  return new Promise((resolve) => {
    let activeWorker: Worker
    try {
      activeWorker = getWorker()
    } catch (error) {
      resolve({ ok: false, reason: `无法启动 UFF Worker：${(error as Error).message}` })
      return
    }
    const finish = (r: WorkerMsg) => {
      if (!r.ok || !r.coords) { resolve({ ok: false, reason: r.reason ?? 'UFF 优化失败' }); return }
      const coords = r.coords
      const atoms = mol.atoms.map((a, i) =>
        coords[i] ? { ...a, x: coords[i][0], y: coords[i][1], z: coords[i][2] } : a,
      )
      resolve({
        ok: true,
        molecule: { ...mol, atoms },
        energyBefore: r.energyBefore,
        energyAfter: r.energyAfter,
      })
    }
    const timeout = setTimeout(() => {
      failWorker(activeWorker, `UFF 预优化在 ${timeoutMs / 1000} 秒内未完成；该分子较大，请改用 GFN2-xTB`)
    }, timeoutMs)
    pending.set(id, { resolve: finish, timeout })
    try {
      activeWorker.postMessage({ id, sdf, steps, tolerance })
    } catch (error) {
      failWorker(activeWorker, `无法向 UFF Worker 发送请求：${(error as Error).message}`)
    }
  })
}
