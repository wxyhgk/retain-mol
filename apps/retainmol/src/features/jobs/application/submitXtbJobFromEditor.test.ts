import { describe, expect, it, vi } from 'vitest'
import { submitXtbJobFromEditor } from './submitXtbJobFromEditor'

const molecule = {
  name: 'Methane',
  atoms: [{ id: 'c', symbol: 'C', x: 0, y: 0, z: 0 }],
  bonds: [],
}

const binding = {
  objectId: 'object-1',
  assetId: 'asset-1',
  headRevisionId: 'revision-2',
  assetVersion: 3,
  savedContentHash: 'a'.repeat(64),
  savedAt: '2026-07-15T00:00:00Z',
}

const parameters = {
  name: 'optimize methane',
  charge: 0,
  multiplicity: 1,
  method: 'gfn2' as const,
  maxSteps: 100,
  optLevel: 'normal' as const,
}

describe('submitXtbJobFromEditor', () => {
  it('saves first and creates a job bound only to the resulting revision', async () => {
    const events: string[] = []
    const save = vi.fn(async () => {
      events.push('save')
      return { status: 'saved' as const, asset: null, revision: null, binding }
    })
    const create = vi.fn(async request => {
      events.push('create')
      return {
        id: 'job-1', kind: 'xtb.optimize', status: 'queued' as const,
        name: 'optimize methane', createdAt: '2026-07-15T00:00:00Z', request,
      }
    })

    const result = await submitXtbJobFromEditor(save, create, {
      objectId: 'object-1', molecule, binding: null, parameters,
    })

    expect(events).toEqual(['save', 'create'])
    expect(create).toHaveBeenCalledWith({ ...parameters, moleculeRevisionId: 'revision-2' })
    expect(create.mock.calls[0]?.[0]).not.toHaveProperty('molecule')
    expect(create.mock.calls[0]?.[0]).not.toHaveProperty('structure')
    expect(result.revisionId).toBe('revision-2')
  })

  it('does not create a job when freezing the editor document fails', async () => {
    const create = vi.fn()
    await expect(submitXtbJobFromEditor(
      vi.fn().mockRejectedValue(new Error('save conflict')),
      create,
      { objectId: 'object-1', molecule, binding: null, parameters },
    )).rejects.toThrow('save conflict')
    expect(create).not.toHaveBeenCalled()
  })
})
