import { describe, expect, it } from 'vitest'
import type { JobDetail } from './jobTypes'
import { isPsi4Request, isXtbRequest, literalAtomCount, revisionIdFor } from './jobRequest'

const baseJob = {
  id: 'job-1',
  kind: 'xtb-optimization',
  status: 'queued',
  name: '测试任务',
  createdAt: '2026-07-16T08:00:00Z',
} satisfies Omit<JobDetail, 'request'>

const xtbStructureJob: JobDetail = {
  ...baseJob,
  request: {
    charge: 0,
    multiplicity: 1,
    method: 'gfn2',
    maxSteps: 200,
    optLevel: 'normal',
    structure: { atoms: [{ id: 'a1', symbol: 'C', x: 0, y: 0, z: 0 }, { id: 'a2', symbol: 'O', x: 1.2, y: 0, z: 0 }] },
  },
}

const psi4RevisionJob: JobDetail = {
  ...baseJob,
  kind: 'psi4-ts-refine',
  request: {
    charge: 0,
    multiplicity: 1,
    method: 'b3lyp',
    basis: 'def2-svp',
    scfType: 'df',
    threads: 4,
    memoryMb: 2048,
    timeoutSeconds: 3600,
    maxSteps: 50,
    fullHessianEvery: 5,
    convergence: 'gau',
    moleculeRevisionId: 'rev-frozen-1',
  },
}

const psi4ArtifactJob: JobDetail = {
  ...baseJob,
  kind: 'psi4-frequency',
  request: {
    charge: 0,
    multiplicity: 2,
    method: 'wb97x-d',
    basis: 'def2-tzvp',
    scfType: 'pk',
    threads: 8,
    memoryMb: 4096,
    timeoutSeconds: 3600,
    artifactId: 'art-1',
  },
}

describe('jobRequest', () => {
  it('discriminates xtb vs psi4 vs missing requests', () => {
    expect(isXtbRequest(xtbStructureJob.request)).toBe(true)
    expect(isPsi4Request(xtbStructureJob.request)).toBe(false)
    expect(isXtbRequest(psi4RevisionJob.request)).toBe(false)
    expect(isPsi4Request(psi4RevisionJob.request)).toBe(true)
    expect(isXtbRequest(undefined)).toBe(false)
    expect(isPsi4Request(undefined)).toBe(false)
  })

  it('resolves the frozen revision id only when the request binds one', () => {
    expect(revisionIdFor(psi4RevisionJob)).toBe('rev-frozen-1')
    expect(revisionIdFor(xtbStructureJob)).toBeNull()
    expect(revisionIdFor(psi4ArtifactJob)).toBeNull()
    expect(revisionIdFor({ ...baseJob })).toBeNull()
  })

  it('counts atoms only for literal structure snapshots', () => {
    expect(literalAtomCount(xtbStructureJob)).toBe('2')
    expect(literalAtomCount(psi4RevisionJob)).toBeNull()
    expect(literalAtomCount({ ...baseJob })).toBeNull()
  })
})
