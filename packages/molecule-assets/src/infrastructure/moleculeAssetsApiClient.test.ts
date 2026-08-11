import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  configureMoleculeAssetsApiBase,
  MoleculeAssetsApiClient,
  MoleculeAssetsApiError,
  resolveMoleculeAssetsApiBase,
} from './moleculeAssetsApiClient'

const asset = {
  id: 'mol-1',
  name: 'Water',
  headRevisionId: null,
  version: 1,
  createdAt: '2026-07-14T00:00:00Z',
  updatedAt: '2026-07-14T00:00:00Z',
}
const revision = {
  id: 'rev-1',
  assetId: 'mol-1',
  parentRevisionId: null,
  molecule: { atoms: [{ id: 'o', symbol: 'O', x: 0, y: 0, z: 0 }], bonds: [] },
  contentHash: 'a'.repeat(64),
  topologyFingerprint: 'b'.repeat(64),
  createdAt: '2026-07-14T00:00:00Z',
}

afterEach(() => {
  configureMoleculeAssetsApiBase(undefined)
  vi.unstubAllGlobals()
})

describe('MoleculeAssetsApiClient', () => {
  it('uses the shared backend URL resolution convention', () => {
    expect(resolveMoleculeAssetsApiBase(undefined, { protocol: 'http:', hostname: '192.168.0.20' }))
      .toBe('http://192.168.0.20:8000')
    expect(resolveMoleculeAssetsApiBase('https://compute.example.test/', {
      protocol: 'http:', hostname: 'localhost',
    })).toBe('https://compute.example.test')
  })

  it('uses host configuration applied after the default client is created', async () => {
    const client = new MoleculeAssetsApiClient()
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ assets: [] }))
    vi.stubGlobal('fetch', fetchMock)

    configureMoleculeAssetsApiBase('http://configured.test:9000/')
    await client.listAssets()

    expect(fetchMock.mock.calls[0][0]).toBe('http://configured.test:9000/molecule-assets')
  })

  it('lists and creates molecule assets through the adapter', async () => {
    const signal = new AbortController().signal
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ assets: [asset] }))
      .mockResolvedValueOnce(jsonResponse({ ...asset, id: 'mol-2', name: 'Methane' }, 201))
    vi.stubGlobal('fetch', fetchMock)
    const client = new MoleculeAssetsApiClient('http://compute.test:8000')

    await expect(client.listAssets({ signal })).resolves.toMatchObject([{ id: 'mol-1' }])
    await expect(client.createAsset({ name: 'Methane' })).resolves.toMatchObject({
      id: 'mol-2', name: 'Methane',
    })

    expect(fetchMock.mock.calls[0]).toEqual([
      'http://compute.test:8000/molecule-assets',
      expect.objectContaining({ signal }),
    ])
    expect(fetchMock.mock.calls[1][0]).toBe('http://compute.test:8000/molecule-assets')
    expect(fetchMock.mock.calls[1][1]).toMatchObject({
      method: 'POST',
      headers: { 'content-type': 'application/json' },
    })
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({ name: 'Methane' })
  })

  it('gets and creates revisions with encoded resource IDs', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse(revision))
      .mockResolvedValueOnce(jsonResponse({ ...revision, id: 'rev-2', parentRevisionId: 'rev-1' }, 201))
    vi.stubGlobal('fetch', fetchMock)
    const client = new MoleculeAssetsApiClient('http://compute.test:8000')

    await expect(client.getRevision('rev/one')).resolves.toMatchObject({ id: 'rev-1' })
    await expect(client.createRevision('mol/one', {
      parentRevisionId: 'rev-1',
      expectedHeadRevisionId: 'rev-1',
      expectedVersion: 2,
      molecule: revision.molecule,
      contentHash: revision.contentHash,
      topologyFingerprint: revision.topologyFingerprint,
    })).resolves.toMatchObject({ id: 'rev-2', parentRevisionId: 'rev-1' })

    expect(fetchMock.mock.calls[0][0]).toBe('http://compute.test:8000/molecule-revisions/rev%2Fone')
    expect(fetchMock.mock.calls[1][0]).toBe('http://compute.test:8000/molecule-assets/mol%2Fone/revisions')
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toMatchObject({
      parentRevisionId: 'rev-1',
      contentHash: revision.contentHash,
    })
  })

  it('maps FastAPI field errors to a typed adapter error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({
      detail: [{ loc: ['body', 'name'], msg: 'Field required' }],
    }, 422)))
    const client = new MoleculeAssetsApiClient('http://compute.test:8000')

    const error = await client.createAsset({ name: '' }).catch(value => value)
    expect(error).toBeInstanceOf(MoleculeAssetsApiError)
    expect(error).toMatchObject({ status: 422, fieldErrors: { name: 'Field required' } })
    expect(error.message).toContain('Field required')
  })

  it('preserves the current asset from an optimistic concurrency conflict', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({
      detail: {
        code: 'molecule_head_conflict',
        message: 'stale head',
        currentAsset: { ...asset, headRevisionId: 'rev-2', version: 3 },
      },
    }, 409)))
    const client = new MoleculeAssetsApiClient('http://compute.test:8000')

    const error = await client.getAsset('asset-1').catch(value => value)
    expect(error).toBeInstanceOf(MoleculeAssetsApiError)
    expect(error).toMatchObject({
      status: 409,
      code: 'molecule_head_conflict',
      currentAsset: { id: 'mol-1', headRevisionId: 'rev-2', version: 3 },
    })
  })
})

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}
