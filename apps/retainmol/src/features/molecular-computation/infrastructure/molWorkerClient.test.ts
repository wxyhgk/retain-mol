import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Molecule } from '@retainmol/mol-viewer/core'
import type { OptimizeResult } from '@retainmol/mol-viewer/io'
import { MOLECULE_OPT_WORKER_TIMEOUT_MS } from '@/config/optimize.config'

type WorkerMessage = { id: number; op: string; mol: Molecule }

class FakeWorker {
  static instances: FakeWorker[] = []
  onmessage: ((event: MessageEvent<{ id: number; result: OptimizeResult }>) => void) | null = null
  onerror: ((event: ErrorEvent) => void) | null = null
  onmessageerror: ((event: MessageEvent) => void) | null = null
  readonly messages: WorkerMessage[] = []
  readonly terminate = vi.fn()
  postError: Error | null = null

  constructor() {
    FakeWorker.instances.push(this)
  }

  postMessage(message: WorkerMessage) {
    if (this.postError) throw this.postError
    this.messages.push(message)
  }

  respond(index: number, result: OptimizeResult) {
    this.onmessage?.({ data: { id: this.messages[index].id, result } } as MessageEvent)
  }
}

const molecule: Molecule = {
  atoms: [{ id: 'a1', symbol: 'C', x: 0, y: 0, z: 0 }],
  bonds: [],
  name: 'input',
}

describe('molecule optimization Worker transport', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.resetModules()
    FakeWorker.instances = []
    vi.stubGlobal('Worker', FakeWorker)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('matches concurrent responses by request id even when they finish out of order', async () => {
    const api = await import('./molWorkerClient')
    const first = api.runMoleculeComputation('gen3d', molecule)
    const second = api.runMoleculeComputation('minimize', molecule)
    const instance = FakeWorker.instances[0]
    const firstResult = { molecule: { ...molecule, name: 'first' }, ok: true }
    const secondResult = { molecule: { ...molecule, name: 'second' }, ok: true }

    instance.respond(1, secondResult)
    instance.respond(0, firstResult)

    await expect(first).resolves.toEqual(firstResult)
    await expect(second).resolves.toEqual(secondResult)
    expect(instance.terminate).not.toHaveBeenCalled()
  })

  it('settles all requests on Worker error and creates a fresh Worker for retry', async () => {
    const api = await import('./molWorkerClient')
    const first = api.runMoleculeComputation('gen3d', molecule)
    const second = api.runMoleculeComputation('minimize', molecule)
    const failed = FakeWorker.instances[0]

    failed.onerror?.({ message: 'boom', preventDefault: vi.fn() } as unknown as ErrorEvent)

    await expect(first).resolves.toMatchObject({ ok: false, molecule, reason: 'boom' })
    await expect(second).resolves.toMatchObject({ ok: false, molecule, reason: 'boom' })
    expect(failed.terminate).toHaveBeenCalledTimes(1)

    void api.runMoleculeComputation('gen3d', molecule)
    expect(FakeWorker.instances).toHaveLength(2)
  })

  it('settles requests on message errors and timeout', async () => {
    const api = await import('./molWorkerClient')
    const malformed = api.runMoleculeComputation('gen3d', molecule)
    const firstWorker = FakeWorker.instances[0]
    firstWorker.onmessageerror?.({} as MessageEvent)
    await expect(malformed).resolves.toMatchObject({ ok: false })

    const timedOut = api.runMoleculeComputation('gen3d', molecule)
    const secondWorker = FakeWorker.instances[1]
    await vi.advanceTimersByTimeAsync(MOLECULE_OPT_WORKER_TIMEOUT_MS)
    await expect(timedOut).resolves.toMatchObject({ ok: false, reason: expect.stringContaining('未响应') })
    expect(secondWorker.terminate).toHaveBeenCalledTimes(1)
  })

  it('cleans up after a synchronous postMessage failure', async () => {
    const instance = new FakeWorker()
    instance.postError = new Error('clone failed')
    FakeWorker.instances = []
    vi.stubGlobal('Worker', class extends FakeWorker {
      constructor() {
        super()
        this.postError = new Error('clone failed')
      }
    })
    vi.resetModules()
    const freshApi = await import('./molWorkerClient')

    await expect(freshApi.runMoleculeComputation('gen3d', molecule)).resolves.toMatchObject({
      ok: false,
      reason: expect.stringContaining('clone failed'),
    })
  })
})
