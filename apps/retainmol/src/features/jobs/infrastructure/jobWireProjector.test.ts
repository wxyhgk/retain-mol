import { describe, expect, it } from 'vitest'
import {
  isJobWire,
  normalizeJobStatus,
  projectJobArtifactListWire,
  projectJobListWire,
  projectJobWire,
} from './jobWireProjector'

describe('jobWireProjector', () => {
  it('projects snake_case persisted jobs and nested artifacts', () => {
    const job = projectJobWire({
      job_id: 'job-1',
      task_type: 'xtb-optimization',
      status: 'completed',
      created_at: '2026-07-14T00:00:00Z',
      updated_at: '2026-07-14T00:01:00Z',
      metadata: {
        name: 'Water',
        request: {
          structure: { name: 'Water', atoms: [{ id: 'o', symbol: 'O', x: 0, y: 0, z: 0 }] },
          charge: 0,
          multiplicity: 1,
          method: 'gfn2',
          max_steps: 120,
          opt_level: 'tight',
        },
      },
      artifacts: [{
        artifact_id: 'artifact-1',
        job_id: 'job-1',
        name: 'optimized.xyz',
        media_type: 'chemical/x-xyz',
        created_at: '2026-07-14T00:01:00Z',
        metadata: { role: 'output', format: 'xyz', byteSize: 304 },
      }],
    })

    expect(job).toMatchObject({
      id: 'job-1',
      kind: 'xtb-optimization',
      status: 'succeeded',
      name: 'Water',
      updatedAt: '2026-07-14T00:01:00Z',
      request: { maxSteps: 120, optLevel: 'tight' },
      artifacts: [{ id: 'artifact-1', jobId: 'job-1', sizeBytes: 304 }],
    })
  })

  it('accepts camelCase jobs without a request', () => {
    const wire = {
      id: 'job-2',
      kind: 'xtb-optimization',
      status: 'running',
      name: 'Methane',
      createdAt: '2026-07-14T00:00:00Z',
    }

    expect(isJobWire(wire)).toBe(true)
    expect(projectJobWire(wire)).toEqual({
      id: 'job-2',
      kind: 'xtb-optimization',
      status: 'running',
      name: 'Methane',
      createdAt: '2026-07-14T00:00:00Z',
    })
  })

  it('projects an xTB request frozen to a molecule revision', () => {
    const job = projectJobWire({
      id: 'job-revision-1',
      kind: 'xtb-optimization',
      status: 'queued',
      createdAt: '2026-07-14T00:00:00Z',
      metadata: {
        request: {
          moleculeRevisionId: 'rev-1',
          charge: 0,
          multiplicity: 1,
          method: 'gfn2',
          maxSteps: 200,
          optLevel: 'normal',
        },
      },
    })

    expect(job.request).toEqual({
      moleculeRevisionId: 'rev-1',
      charge: 0,
      multiplicity: 1,
      method: 'gfn2',
      maxSteps: 200,
      optLevel: 'normal',
    })
  })

  it('keeps future engine job kinds without treating their payload as xTB', () => {
    expect(projectJobWire({
      id: 'job-orca-1',
      kind: 'orca-single-point',
      status: 'queued',
      createdAt: '2026-07-14T00:00:00Z',
      metadata: { request: { engineSpecific: true } },
    })).toEqual({
      id: 'job-orca-1',
      kind: 'orca-single-point',
      status: 'queued',
      name: 'orca-single-point',
      createdAt: '2026-07-14T00:00:00Z',
    })
  })

  it('normalizes lifecycle aliases and safely fails unknown statuses', () => {
    expect(normalizeJobStatus('in-progress')).toBe('running')
    expect(normalizeJobStatus('canceled')).toBe('cancelled')
    expect(normalizeJobStatus('aborted')).toBe('interrupted')
    expect(normalizeJobStatus('backend-added-state')).toBe('failed')
    expect(normalizeJobStatus(undefined, 'interrupted')).toBe('interrupted')
  })

  it('supports collection envelopes and both artifact byte count names', () => {
    expect(projectJobListWire({ jobs: [{
      jobId: 'job-3', taskType: 'xtb-optimization', status: 'queued',
      createdAt: '2026-07-14T00:00:00Z',
    }] })).toMatchObject([{ id: 'job-3', name: 'xTB optimization' }])

    expect(projectJobArtifactListWire({ artifacts: [
      { id: 'a-1', jobId: 'job-3', role: 'preview', name: 'one.png', byteSize: 10 },
      { id: 'a-2', jobId: 'job-3', role: 'output', name: 'two.xyz', sizeBytes: 20 },
    ] })).toMatchObject([
      { id: 'a-1', format: 'png', sizeBytes: 10 },
      { id: 'a-2', format: 'xyz', sizeBytes: 20 },
    ])
  })

  it('rejects malformed unknown JSON at the boundary', () => {
    expect(isJobWire(null)).toBe(false)
    expect(() => projectJobWire({ id: 'job-1' })).toThrow(TypeError)
    expect(() => projectJobListWire({ jobs: [null] })).toThrow('jobs[0]')
    expect(() => projectJobArtifactListWire('not-json-array')).toThrow('artifacts collection')
  })
})
