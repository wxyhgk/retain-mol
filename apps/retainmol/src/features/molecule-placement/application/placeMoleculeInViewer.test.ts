import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Molecule } from '@retainmol/mol-viewer/core'

const mocks = vi.hoisted(() => ({
  generateInitial3D: vi.fn(),
  relaxAnimate: vi.fn(async () => undefined),
}))

vi.mock('@/features/molecular-computation', () => ({
  generateInitial3D: mocks.generateInitial3D,
}))

vi.mock('@/features/molecule-animation', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/molecule-animation')>()
  return {
    ...actual,
    relaxAnimate: mocks.relaxAnimate,
  }
})

import { useMoleculeStore } from '@/domain/viewer/moleculeState'
import { placeMoleculeInViewer } from './placeMoleculeInViewer'

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>(res => { resolve = res })
  return { promise, resolve }
}

const molecule = (name: string): Molecule => ({
  name,
  atoms: [
    { id: `${name}-a1`, symbol: 'C', x: 0, y: 0, z: 0 },
    { id: `${name}-a2`, symbol: 'C', x: 1.4, y: 0, z: 0 },
  ],
  bonds: [{ id: `${name}-b1`, atomId1: `${name}-a1`, atomId2: `${name}-a2`, order: 1 }],
})

describe('molecule placement request freshness', () => {
  beforeEach(() => {
    mocks.generateInitial3D.mockReset()
    mocks.relaxAnimate.mockReset()
    mocks.relaxAnimate.mockResolvedValue(undefined)
    useMoleculeStore.getState().setMolecule(molecule('baseline'))
  })

  it('only commits the latest concurrent replace request', async () => {
    const first = deferred<{ ok: boolean; molecule: Molecule }>()
    const second = deferred<{ ok: boolean; molecule: Molecule }>()
    mocks.generateInitial3D
      .mockImplementationOnce(() => first.promise)
      .mockImplementationOnce(() => second.promise)

    const firstPlacement = placeMoleculeInViewer(molecule('input-1'), { mode: 'replace' })
    const secondPlacement = placeMoleculeInViewer(molecule('input-2'), { mode: 'replace' })

    second.resolve({ ok: true, molecule: molecule('result-2') })
    await expect(secondPlacement).resolves.toEqual(expect.any(String))
    first.resolve({ ok: true, molecule: molecule('result-1') })
    await expect(firstPlacement).resolves.toBeNull()

    const state = useMoleculeStore.getState()
    expect(state.objectsById[state.activeObjectId!].molecule.name).toBe('result-2')
    expect(mocks.relaxAnimate).toHaveBeenCalledTimes(1)
  })

  it('rejects a pending replace result after the target molecule is edited', async () => {
    const result = deferred<{ ok: boolean; molecule: Molecule }>()
    mocks.generateInitial3D.mockImplementationOnce(() => result.promise)
    const placement = placeMoleculeInViewer(molecule('input'), { mode: 'replace' })

    useMoleculeStore.getState().addAtom('N', 3, 0, 0)
    result.resolve({ ok: true, molecule: molecule('stale-result') })

    await expect(placement).resolves.toBeNull()
    const state = useMoleculeStore.getState()
    expect(state.objectsById[state.activeObjectId!].molecule.name).toBe('baseline')
    expect(state.objectsById[state.activeObjectId!].molecule.atoms).toHaveLength(3)
    expect(mocks.relaxAnimate).not.toHaveBeenCalled()
  })

  it('rejects a pending replace result after scene metadata changes', async () => {
    const result = deferred<{ ok: boolean; molecule: Molecule }>()
    mocks.generateInitial3D.mockImplementationOnce(() => result.promise)
    const placement = placeMoleculeInViewer(molecule('input'), { mode: 'replace' })
    const state = useMoleculeStore.getState()

    state.renameObject(state.activeObjectId!, 'renamed while waiting')
    result.resolve({ ok: true, molecule: molecule('stale-result') })

    await expect(placement).resolves.toBeNull()
    const current = useMoleculeStore.getState()
    expect(current.objectsById[current.activeObjectId!].name).toBe('renamed while waiting')
  })

  it('actively aborts an add animation before a replace request starts', async () => {
    const addResult = deferred<{ ok: boolean; molecule: Molecule }>()
    const replaceResult = deferred<{ ok: boolean; molecule: Molecule }>()
    mocks.generateInitial3D
      .mockImplementationOnce(() => addResult.promise)
      .mockImplementationOnce(() => replaceResult.promise)
    let addSignal: AbortSignal | undefined
    mocks.relaxAnimate.mockImplementationOnce((...args: unknown[]) => {
      addSignal = (args[2] as { signal?: AbortSignal }).signal
      return new Promise<void>(resolve => {
        addSignal?.addEventListener('abort', () => resolve(), { once: true })
      })
    })

    const addPlacement = placeMoleculeInViewer(molecule('add'), { mode: 'add-to-scene' })
    addResult.resolve({ ok: true, molecule: molecule('added-result') })
    await vi.waitFor(() => expect(addSignal).toBeDefined())

    const replacePlacement = placeMoleculeInViewer(molecule('replace'), { mode: 'replace' })
    await expect(addPlacement).resolves.toEqual(expect.any(String))
    expect(addSignal?.aborted).toBe(true)

    replaceResult.resolve({ ok: true, molecule: molecule('replace-result') })
    await expect(replacePlacement).resolves.toEqual(expect.any(String))
    const current = useMoleculeStore.getState()
    expect(current.objectsById[current.activeObjectId!].molecule.name).toBe('replace-result')
  })
})
