import { afterEach, describe, expect, it, vi } from 'vitest'
import { JobsApiClient, resolveJobArtifactUrl, resolveJobsApiBase } from './jobsApiClient'

afterEach(() => vi.unstubAllGlobals())

describe('JobsApiClient', () => {
  it('uses the xTB backend URL resolution behavior', () => {
    expect(resolveJobsApiBase(undefined, { protocol: 'http:', hostname: '192.168.0.20' }))
      .toBe('http://192.168.0.20:8000')
    expect(resolveJobsApiBase('https://compute.example.test/', { protocol: 'http:', hostname: 'localhost' }))
      .toBe('https://compute.example.test')
  })

  it('posts an xTB optimization request and exposes backend errors', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({
        id: 'job-12', kind: 'xtb-optimization', status: 'queued', name: 'water', createdAt: '2026-07-14T00:00:00Z',
        request: { structure: { atoms: [] }, charge: 0, multiplicity: 1, method: 'gfn2', maxSteps: 300, optLevel: 'normal' },
      }), { status: 201 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ detail: 'queue unavailable' }), { status: 503 }))
    vi.stubGlobal('fetch', fetchMock)
    const client = new JobsApiClient('http://compute.test:8000')

    const result = await client.createXtbOptimizationJob({
      name: 'water', structure: { atoms: [] }, charge: 0, multiplicity: 1, method: 'gfn2', maxSteps: 300, optLevel: 'normal',
    })
    expect(result.id).toBe('job-12')
    expect(fetchMock.mock.calls[0][0]).toBe('http://compute.test:8000/jobs/xtb/optimize')
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({ method: 'gfn2', maxSteps: 300 })
    await expect(client.listJobs()).rejects.toThrow('queue unavailable')
  })

  it('reads xTB artifacts from the artifacts collection endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify([
      { id: 'artifact-1', jobId: 'job-1', role: 'output', name: 'optimized.xyz', format: 'xyz' },
    ]), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    const client = new JobsApiClient('http://compute.test:8000')

    await expect(client.listJobArtifacts('job-1')).resolves.toMatchObject([
      { id: 'artifact-1', name: 'optimized.xyz' },
    ])
    expect(fetchMock.mock.calls[0][0]).toBe('http://compute.test:8000/jobs/job-1/artifacts')
  })

  it('resolves a backend-relative artifact URL', () => {
    expect(resolveJobArtifactUrl({ downloadUrl: '/jobs/job-1/artifacts/a/content' }, 'http://compute.test:8000'))
      .toBe('http://compute.test:8000/jobs/job-1/artifacts/a/content')
  })
})
