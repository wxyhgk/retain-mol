import { describe, expect, it, vi } from 'vitest'
import { submitPsi4JobFromEditor } from './submitPsi4JobFromEditor'

const molecule = {
  name: 'Water',
  atoms: [{ id: 'o', symbol: 'O', x: 0, y: 0, z: 0 }],
  bonds: [],
}

const binding = {
  objectId: 'object-1', assetId: 'asset-1', headRevisionId: 'revision-psi4',
  assetVersion: 2, savedContentHash: 'a'.repeat(64), savedAt: '2026-07-15T00:00:00Z',
}

describe('submitPsi4JobFromEditor', () => {
  it('freezes the molecule before creating a revision-bound frequency job', async () => {
    const events: string[] = []
    const save = vi.fn(async () => {
      events.push('save')
      return { status: 'saved' as const, asset: null, revision: null, binding }
    })
    const create = vi.fn(async input => {
      events.push('create')
      return {
        id: 'job-frequency', kind: input.kind, status: 'queued' as const,
        name: 'frequency', createdAt: '2026-07-15T00:00:00Z', request: input.request,
      }
    })

    await submitPsi4JobFromEditor(save, create, {
      objectId: 'object-1', molecule, binding: null, kind: 'psi4-frequency',
      parameters: {
        charge: 0, multiplicity: 1, method: 'b3lyp', basis: 'def2-svp',
        scfType: 'df', threads: 1, memoryMb: 1024, timeoutSeconds: 3600,
      },
    })

    expect(events).toEqual(['save', 'create'])
    expect(create).toHaveBeenCalledWith(expect.objectContaining({
      kind: 'psi4-frequency',
      request: expect.objectContaining({ moleculeRevisionId: 'revision-psi4' }),
    }))
    expect(create.mock.calls[0]?.[0].request).not.toHaveProperty('molecule')
    expect(create.mock.calls[0]?.[0].request).not.toHaveProperty('structure')
  })
})
