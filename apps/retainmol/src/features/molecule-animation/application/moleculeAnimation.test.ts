import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Molecule } from '@retainmol/mol-viewer/core'
import { isMoleculeHistoryTracking } from '@/domain/viewer/history'
import { useMoleculeStore } from '@/domain/viewer/moleculeState'
import { relaxAnimate } from './moleculeAnimation'

const molecule: Molecule = {
  name: 'animation',
  atoms: [
    { id: 'a1', symbol: 'C', x: 0, y: 0, z: 0 },
    { id: 'a2', symbol: 'C', x: 1.4, y: 0, z: 0 },
  ],
  bonds: [{ id: 'b1', atomId1: 'a1', atomId2: 'a2', order: 1 }],
}

describe('relaxAnimate cancellation', () => {
  let nextFrameId = 0
  const frames = new Map<number, FrameRequestCallback>()

  beforeEach(() => {
    nextFrameId = 0
    frames.clear()
    vi.stubGlobal('requestAnimationFrame', vi.fn((callback: FrameRequestCallback) => {
      const id = ++nextFrameId
      frames.set(id, callback)
      return id
    }))
    vi.stubGlobal('cancelAnimationFrame', vi.fn((id: number) => {
      frames.delete(id)
    }))
    useMoleculeStore.getState().setMolecule(molecule)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('aborts without waiting for another RAF and restores the edit session', async () => {
    const controller = new AbortController()
    const writer = { setObjectAtomPositions: vi.fn() }
    const objectId = useMoleculeStore.getState().activeObjectId!
    const pending = relaxAnimate(objectId, molecule, {
      writer,
      signal: controller.signal,
      maxFrames: 10,
    })

    expect(isMoleculeHistoryTracking()).toBe(false)
    expect(frames).toHaveLength(1)
    controller.abort()

    await expect(pending).resolves.toBeUndefined()
    expect(frames).toHaveLength(0)
    expect(writer.setObjectAtomPositions).not.toHaveBeenCalled()
    expect(isMoleculeHistoryTracking()).toBe(true)
    expect(cancelAnimationFrame).toHaveBeenCalledTimes(1)
  })

  it('rejects frame errors and still restores the edit session', async () => {
    const objectId = useMoleculeStore.getState().activeObjectId!
    const pending = relaxAnimate(objectId, molecule, {
      writer: { setObjectAtomPositions: vi.fn() },
      shouldContinue: () => { throw new Error('guard failed') },
      maxFrames: 10,
    })
    const callback = frames.values().next().value as FrameRequestCallback

    callback(0)

    await expect(pending).rejects.toThrow('guard failed')
    expect(isMoleculeHistoryTracking()).toBe(true)
  })
})
