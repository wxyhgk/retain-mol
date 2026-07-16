import { QueryClient } from '@tanstack/react-query'
import { describe, expect, it, vi } from 'vitest'
import type { JobDetail, JobsApi } from '../domain/jobTypes'
import { isTerminalJobStatus, jobDetailOptions, jobsListOptions } from './jobQueries'

const job: JobDetail = {
  id: 'job-1', kind: 'xtb-optimization', status: 'queued', name: 'ethane', createdAt: '2026-07-14T00:00:00Z',
  request: { structure: { atoms: [{ id: 'a', symbol: 'C', x: 0, y: 0, z: 0 }, { id: 'b', symbol: 'C', x: 1, y: 0, z: 0 }] }, charge: 0, multiplicity: 1, method: 'gfn2', maxSteps: 300, optLevel: 'normal' },
}

function apiStub(): JobsApi {
  return {
    listJobs: vi.fn(async () => [job]),
    getJob: vi.fn(async () => job),
    updateJob: vi.fn(async () => job),
    cloneJob: vi.fn(async (): Promise<JobDetail> => ({ ...job, id: 'job-copy' })),
    retryJob: vi.fn(async (): Promise<JobDetail> => ({
      ...job,
      id: 'job-retry',
      supersedesJobId: job.id,
    })),
    cancelJob: vi.fn(async (): Promise<JobDetail> => ({ ...job, status: 'cancelled' })),
    deleteJob: vi.fn(async () => undefined),
    listJobArtifacts: vi.fn(async () => [{ id: 'a1', jobId: job.id, role: 'output' as const, name: 'optimized.xyz', format: 'xyz' }]),
    getJobArtifactText: vi.fn(async () => 'artifact'),
    getJobLog: vi.fn(async () => ({ content: 'log', cursor: 3, source: 'xtb.log', complete: true })),
    createXtbOptimizationJob: vi.fn(async () => job),
    createPsi4TsRefineJob: vi.fn(async () => job),
    createPsi4FrequencyJob: vi.fn(async () => job),
    createPsi4IrcJob: vi.fn(async () => job),
    uploadJobThumbnail: vi.fn(),
    runJob: vi.fn(async (): Promise<JobDetail> => ({ ...job, status: 'succeeded' })),
  }
}

describe('job query options', () => {
  it('deduplicates list requests through the QueryClient cache', async () => {
    const api = apiStub()
    const client = new QueryClient()
    await Promise.all([
      client.fetchQuery(jobsListOptions(api)),
      client.fetchQuery(jobsListOptions(api)),
    ])
    expect(api.listJobs).toHaveBeenCalledTimes(1)
  })

  it('combines detail and artifacts without copying them into Zustand', async () => {
    const api = apiStub()
    const client = new QueryClient()
    const detail = await client.fetchQuery(jobDetailOptions(job.id, api))
    expect(detail.artifacts).toEqual([expect.objectContaining({ format: 'xyz' })])
  })

  it('recognizes every status that must stop polling', () => {
    expect(['succeeded', 'failed', 'cancelled', 'interrupted'].every(isTerminalJobStatus)).toBe(true)
    expect(isTerminalJobStatus('running')).toBe(false)
  })
})
