import { describe, expect, it, vi } from 'vitest'
import type { MoleculeAssetsApi } from './moleculeAssetsApi'
import { saveMoleculeDocument } from './saveMoleculeDocument'

const molecule = {
  name: 'Water',
  atoms: [{ id: 'o', symbol: 'O', x: 0, y: 0, z: 0 }],
  bonds: [],
}

function api(): MoleculeAssetsApi {
  return {
    listAssets: vi.fn(),
    getAsset: vi.fn().mockResolvedValue({
      schemaVersion: 1, id: 'asset-1', name: 'Water', headRevisionId: 'revision-1', version: 2,
      createdAt: '2026-07-15T00:00:00Z', updatedAt: '2026-07-15T00:00:01Z',
    }),
    createAsset: vi.fn().mockResolvedValue({
      schemaVersion: 1, id: 'asset-1', name: 'Water', headRevisionId: null, version: 1,
      createdAt: '2026-07-15T00:00:00Z', updatedAt: '2026-07-15T00:00:00Z',
    }),
    getRevision: vi.fn(),
    listRevisions: vi.fn(),
    createRevision: vi.fn().mockImplementation((_assetId, request) => Promise.resolve({
      schemaVersion: 1, id: 'revision-1', assetId: 'asset-1', parentRevisionId: request.parentRevisionId,
      molecule: request.molecule, contentHash: request.contentHash,
      topologyFingerprint: request.topologyFingerprint, metadata: request.metadata ?? {},
      createdAt: '2026-07-15T00:00:01Z',
    })),
  }
}

describe('saveMoleculeDocument', () => {
  it('creates an asset and its first immutable revision', async () => {
    const client = api()
    const result = await saveMoleculeDocument(client, { objectId: 'object-1', molecule, binding: null })

    expect(client.createAsset).toHaveBeenCalledWith({ name: 'Water' })
    expect(client.createRevision).toHaveBeenCalledWith('asset-1', expect.objectContaining({
      parentRevisionId: null, expectedVersion: 1,
    }))
    expect(result).toMatchObject({ status: 'created', binding: { objectId: 'object-1', assetVersion: 2 } })
  })

  it('does not create duplicate revisions when content is unchanged', async () => {
    const client = api()
    const first = await saveMoleculeDocument(client, { objectId: 'object-1', molecule, binding: null })
    vi.mocked(client.createRevision).mockClear()

    const second = await saveMoleculeDocument(client, {
      objectId: 'object-1', molecule, binding: first.binding,
    })

    expect(second.status).toBe('unchanged')
    expect(client.createRevision).not.toHaveBeenCalled()
  })

  it('creates a provenance revision even when coordinates are unchanged', async () => {
    const client = api()
    const first = await saveMoleculeDocument(client, { objectId: 'object-1', molecule, binding: null })
    vi.mocked(client.createRevision).mockClear()

    await saveMoleculeDocument(client, {
      objectId: 'object-1', molecule, binding: first.binding,
      metadata: { derivedFromJobId: 'job-1' },
    })

    expect(client.createRevision).toHaveBeenCalledWith('asset-1', expect.objectContaining({
      metadata: { derivedFromJobId: 'job-1' },
    }))
  })

  it('rejects empty editor documents before creating an asset', async () => {
    const client = api()
    await expect(saveMoleculeDocument(client, {
      objectId: 'object-1', molecule: { atoms: [], bonds: [] }, binding: null,
    })).rejects.toThrow('空分子')
    expect(client.createAsset).not.toHaveBeenCalled()
  })
})
