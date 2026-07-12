import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Molecule } from '@retainmol/mol-viewer/core'

const molecule: Molecule = {
  atoms: [
    { id: 'c', symbol: 'C', x: 0, y: 0, z: 0 },
    { id: 'h', symbol: 'H', x: 1, y: 0, z: 0 },
  ],
  bonds: [{ id: 'b', atomId1: 'c', atomId2: 'h', order: 1 }],
}

class SilentWorker {
  static instances: SilentWorker[] = []
  onmessage: ((event: MessageEvent) => void) | null = null
  onerror: ((event: ErrorEvent) => void) | null = null
  onmessageerror: (() => void) | null = null
  messages: unknown[] = []
  terminated = false

  constructor() { SilentWorker.instances.push(this) }
  postMessage(message: unknown) { this.messages.push(message) }
  terminate() { this.terminated = true }
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.resetModules()
  SilentWorker.instances = []
})

describe('uffOptimizeAsync', () => {
  it('forwards bounded optimization settings to the worker', async () => {
    vi.stubGlobal('Worker', SilentWorker)
    const { uffOptimizeAsync } = await import('./uffClient')
    const promise = uffOptimizeAsync(molecule, { steps: 7, tolerance: 0.01, timeoutMs: 100 })
    const instance = SilentWorker.instances[0]
    const message = instance.messages[0] as { id: number }
    expect(message).toMatchObject({ steps: 7, tolerance: 0.01 })
    instance.onmessage?.({ data: {
      id: message.id,
      ok: true,
      coords: [[0.1, 0, 0], [1.1, 0, 0]],
    } } as MessageEvent)
    await expect(promise).resolves.toMatchObject({ ok: true })
  })

  it('terminates a stuck worker and returns an actionable timeout', async () => {
    vi.stubGlobal('Worker', SilentWorker)
    const { uffOptimizeAsync } = await import('./uffClient')
    const promise = uffOptimizeAsync(molecule, { timeoutMs: 5 })
    const instance = SilentWorker.instances[0]
    await expect(promise).resolves.toMatchObject({
      ok: false,
      reason: expect.stringContaining('GFN2-xTB'),
    })
    expect(instance.terminated).toBe(true)
  })
})
