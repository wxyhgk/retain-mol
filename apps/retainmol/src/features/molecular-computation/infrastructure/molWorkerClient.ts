import type { Molecule } from '@retainmol/mol-viewer/core'
import type { OptimizeResult } from '@retainmol/mol-viewer/io'
import { MOLECULE_OPT_WORKER_TIMEOUT_MS } from '@/config/optimize.config'
import type { MoleculeComputationOperation } from '../domain/computationTypes'

export const OCL_RESOURCE_URL = `${import.meta.env.BASE_URL}ocl/resources.json`

let worker: Worker | null = null
let sequence = 0

type PendingRequest = {
  readonly molecule: Molecule
  readonly resolve: (result: OptimizeResult) => void
  readonly timeout: ReturnType<typeof setTimeout>
}

const pending = new Map<number, PendingRequest>()

function failedResult(molecule: Molecule, reason: string): OptimizeResult {
  return { molecule, ok: false, reason }
}

function settlePending(id: number, result: OptimizeResult) {
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
  for (const [id, request] of [...pending]) {
    settlePending(id, failedResult(request.molecule, reason))
  }
}

function getWorker(): Worker {
  if (!worker) {
    const nextWorker = new Worker(
      new URL('../../../workers/molOpt.worker.ts', import.meta.url),
      { type: 'module' },
    )
    nextWorker.onmessage = (event: MessageEvent<{ id: number; result: OptimizeResult }>) => {
      if (worker !== nextWorker) return
      settlePending(event.data.id, event.data.result)
    }
    nextWorker.onerror = event => {
      event.preventDefault()
      failWorker(nextWorker, event.message || '分子计算 Worker 运行失败')
    }
    nextWorker.onmessageerror = () => failWorker(nextWorker, '分子计算 Worker 返回了无法解析的数据')
    worker = nextWorker
  }
  return worker
}

export function runMoleculeComputation(
  op: MoleculeComputationOperation,
  molecule: Molecule,
): Promise<OptimizeResult> {
  const id = ++sequence
  return new Promise(resolve => {
    let activeWorker: Worker
    try {
      activeWorker = getWorker()
    } catch (error) {
      resolve(failedResult(molecule, `无法启动分子计算 Worker：${(error as Error).message}`))
      return
    }
    const timeout = setTimeout(() => {
      failWorker(activeWorker, `分子计算 Worker 在 ${MOLECULE_OPT_WORKER_TIMEOUT_MS / 1000} 秒内未响应`)
    }, MOLECULE_OPT_WORKER_TIMEOUT_MS)
    pending.set(id, { molecule, resolve, timeout })
    try {
      activeWorker.postMessage({ id, op, mol: molecule, resourceUrl: OCL_RESOURCE_URL })
    } catch (error) {
      failWorker(activeWorker, `无法向分子计算 Worker 发送请求：${(error as Error).message}`)
    }
  })
}
