import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { selectAppBusyMessage, useAppTaskStore } from '@/store/appTaskStore'
import { runWith3DRequestBusy } from './placeMoleculeInViewer'

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

describe('3D placement busy lifecycle', () => {
  beforeEach(() => useAppTaskStore.setState({ tasks: [] }))
  afterEach(() => useAppTaskStore.setState({ tasks: [] }))

  it('clears busy when the operation rejects', async () => {
    const operation = deferred<void>()
    const pending = runWith3DRequestBusy(() => operation.promise)

    expect(selectAppBusyMessage(useAppTaskStore.getState())).toContain('3D')
    operation.reject(new Error('failed'))

    await expect(pending).rejects.toThrow('failed')
    expect(selectAppBusyMessage(useAppTaskStore.getState())).toBeNull()
  })

  it('keeps busy until the last concurrent request settles', async () => {
    const first = deferred<string>()
    const second = deferred<string>()
    const firstPending = runWith3DRequestBusy(() => first.promise)
    const secondPending = runWith3DRequestBusy(() => second.promise)

    first.resolve('first')
    await expect(firstPending).resolves.toBe('first')
    expect(selectAppBusyMessage(useAppTaskStore.getState())).toContain('3D')

    second.resolve('second')
    await expect(secondPending).resolves.toBe('second')
    expect(selectAppBusyMessage(useAppTaskStore.getState())).toBeNull()
  })
})
