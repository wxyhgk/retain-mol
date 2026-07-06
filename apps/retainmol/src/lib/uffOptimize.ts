/**
 * uffOptimize —— 主线程侧 UFF 力场优化入口，转发给 OpenBabel WASM Worker。
 *
 * 用途：MMFF94（OCL）不支持硼/过渡金属，UFF（Universal Force Field）覆盖全周期表。
 * 优化按钮在 MMFF 失败时回退到这里。OpenBabel 是 GPL，仅 app 层使用。
 *
 * 分子经 exportSdf → OpenBabel readString → UFF 优化 → 读回坐标，按原子顺序映射回来
 *（exportSdf 的原子顺序与 mol.atoms 一致，OpenBabel readString 不重排、不加氢）。
 */
import { exportSdf, type Molecule } from '@retainmol/mol-viewer'

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
const pending = new Map<number, (r: WorkerMsg) => void>()

function getWorker(): Worker {
  if (!worker) {
    // 经典 Worker（public 下的 openbabel-worker.js，用 importScripts 加载 UMD glue）
    worker = new Worker(`${import.meta.env.BASE_URL}openbabel-worker.js`)
    worker.onmessage = (e: MessageEvent<WorkerMsg>) => {
      pending.get(e.data.id)?.(e.data)
      pending.delete(e.data.id)
    }
  }
  return worker
}

/** UFF 几何优化（后台 Worker，全元素含硼）。失败返回 ok:false + reason。 */
export function uffOptimizeAsync(mol: Molecule): Promise<UffResult> {
  const sdf = exportSdf(mol)
  const id = ++seq
  return new Promise((resolve) => {
    pending.set(id, (r) => {
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
    })
    getWorker().postMessage({ id, sdf })
  })
}
