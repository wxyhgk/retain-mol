import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  configureJobsApiBase,
  JobsApiClient,
  resolveJobArtifactUrl,
  resolveJobsApiBase,
} from './jobsApiClient'

afterEach(() => {
  configureJobsApiBase(undefined)
  vi.unstubAllGlobals()
})

describe('JobsApiClient', () => {
  it('uses the xTB backend URL resolution behavior', () => {
    expect(resolveJobsApiBase(undefined, { protocol: 'http:', hostname: '192.168.0.20' }))
      .toBe('http://192.168.0.20:8000')
    expect(resolveJobsApiBase('https://compute.example.test/', { protocol: 'http:', hostname: 'localhost' }))
      .toBe('https://compute.example.test')
  })

  it('uses host configuration applied after the default client is created', async () => {
    const client = new JobsApiClient()
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify([]), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    configureJobsApiBase('http://configured.test:9000/')
    await client.listJobs()

    expect(fetchMock).toHaveBeenCalledWith(
      'http://configured.test:9000/jobs',
      expect.any(Object),
    )
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

  it('routes each Psi4 calculation kind to its dedicated endpoint', async () => {
    const response = (kind: string) => new Response(JSON.stringify({
      id: `job-${kind}`, kind, status: 'queued', name: kind, createdAt: '2026-07-15T00:00:00Z',
    }), { status: 201 })
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response('psi4-ts-refine'))
      .mockResolvedValueOnce(response('psi4-frequency'))
      .mockResolvedValueOnce(response('psi4-irc'))
    vi.stubGlobal('fetch', fetchMock)
    const client = new JobsApiClient('http://compute.test:8000')
    const common = {
      moleculeRevisionId: 'revision-1', charge: 0, multiplicity: 1,
      method: 'b3lyp', basis: 'def2-svp', scfType: 'df' as const,
      threads: 1, memoryMb: 1024, timeoutSeconds: 3600,
    }

    await client.createPsi4TsRefineJob({
      ...common, maxSteps: 100, fullHessianEvery: 1, convergence: 'gau_tight',
    })
    await client.createPsi4FrequencyJob(common)
    await client.createPsi4IrcJob({
      ...common, direction: 'both', points: 20, stepSize: 0.2, maxSteps: 300,
    })

    expect(fetchMock.mock.calls.map(call => call[0])).toEqual([
      'http://compute.test:8000/jobs/psi4/ts-refine',
      'http://compute.test:8000/jobs/psi4/frequency',
      'http://compute.test:8000/jobs/psi4/irc',
    ])
    expect(JSON.parse(fetchMock.mock.calls[2][1].body)).toMatchObject({ direction: 'both', points: 20 })
  })

  it('updates mutable job metadata and deletes a job', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({
        id: 'job-1', kind: 'xtb-optimization', status: 'queued', name: 'renamed',
        description: 'screening', createdAt: '2026-07-14T00:00:00Z',
      }), { status: 200 }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetchMock)
    const client = new JobsApiClient('http://compute.test:8000')

    await expect(client.updateJob('job-1', { name: 'renamed', description: 'screening' }))
      .resolves.toMatchObject({ name: 'renamed', description: 'screening' })
    await expect(client.deleteJob('job-1')).resolves.toBeUndefined()
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ method: 'PATCH' })
    expect(fetchMock.mock.calls[1][1]).toMatchObject({ method: 'DELETE' })
  })

  it('copies, retries, cancels, and polls task logs through dedicated endpoints', async () => {
    const response = (id: string, status: string) => new Response(JSON.stringify({
      id, kind: 'xtb-optimization', status, name: id, createdAt: '2026-07-14T00:00:00Z',
    }), { status: 200 })
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response('job-copy', 'queued'))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        id: 'job-retry', kind: 'xtb-optimization', status: 'queued', name: 'job-retry',
        supersedesJobId: 'job-1', createdAt: '2026-07-14T00:00:00Z',
      }), { status: 201 }))
      .mockResolvedValueOnce(response('job-1', 'cancelled'))
      .mockResolvedValueOnce(new Response(JSON.stringify({ content: 'step 1', cursor: 6, source: 'xtb.log', complete: false }), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    const client = new JobsApiClient('http://compute.test:8000')

    await client.cloneJob('job-1', { name: 'job-copy' })
    await expect(client.retryJob('job-1')).resolves.toMatchObject({
      id: 'job-retry',
      supersedesJobId: 'job-1',
    })
    await client.cancelJob('job-1')
    await expect(client.getJobLog('job-1')).resolves.toMatchObject({ content: 'step 1', complete: false })
    expect(fetchMock.mock.calls.map(call => call[0])).toEqual([
      'http://compute.test:8000/jobs/job-1/clone',
      'http://compute.test:8000/jobs/job-1/retry',
      'http://compute.test:8000/jobs/job-1/cancel',
      'http://compute.test:8000/jobs/job-1/log?cursor=0',
    ])
  })

  it('resolves a backend-relative artifact URL', () => {
    expect(resolveJobArtifactUrl({ downloadUrl: '/jobs/job-1/artifacts/a/content' }, 'http://compute.test:8000'))
      .toBe('http://compute.test:8000/jobs/job-1/artifacts/a/content')
  })
})
