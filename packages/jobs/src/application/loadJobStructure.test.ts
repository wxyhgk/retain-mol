import { describe, expect, it } from 'vitest'
import type { Molecule } from '@retainmol/mol-viewer/core'
import { resolveOptimizedJobStructure } from './loadJobStructure'
import type { JobArtifact, JobDetail } from '../domain/jobTypes'

const source: Molecule = {
  name: 'source',
  atoms: [{ id: 'c1', symbol: 'C', x: 0, y: 0, z: 0 }, { id: 'o1', symbol: 'O', x: 1.2, y: 0, z: 0 }],
  bonds: [{ id: 'b1', atomId1: 'c1', atomId2: 'o1', order: 2 }],
}

function job(molecule?: Molecule): JobDetail {
  return {
    id: 'job-1', kind: 'xtb-optimization', status: 'succeeded', name: 'test', createdAt: '2026-07-14T00:00:00Z',
    request: { structure: { name: 'source', atoms: source.atoms.map(atom => ({ ...atom })) }, ...(molecule ? { molecule } : {}), charge: 0, multiplicity: 1, method: 'gfn2', maxSteps: 100, optLevel: 'normal' },
  }
}

const optimized: JobArtifact = {
  id: 'artifact-1', jobId: 'job-1', role: 'output', name: 'optimized.xyz', format: 'xyz',
  metadata: { structure: { name: 'optimized', atoms: [{ id: 'c1', symbol: 'C', x: 2, y: 3, z: 4 }, { id: 'o1', symbol: 'O', x: 5, y: 6, z: 7 }] } },
}

describe('resolveOptimizedJobStructure', () => {
  it('restores the saved molecule graph before applying optimized coordinates', () => {
    const result = resolveOptimizedJobStructure(optimized, job(source), { atoms: [], bonds: [], name: 'other' })
    expect(result).toMatchObject({ ok: true, restoredSnapshot: true })
    if (!result.ok) return
    expect(result.molecule.bonds).toEqual(source.bonds)
    expect(result.molecule.atoms[0]).toMatchObject({ id: 'c1', x: 2, y: 3, z: 4 })
  })

  it('keeps old-job coordinate loading only for a matching active molecule', () => {
    expect(resolveOptimizedJobStructure(optimized, job(), source)).toMatchObject({ ok: true, restoredSnapshot: false })
  })

  it('does not overwrite a different molecule from an old task', () => {
    expect(resolveOptimizedJobStructure(optimized, job(), { atoms: [], bonds: [], name: 'other' })).toEqual({
      ok: false,
      message: '旧任务未保存分子拓扑，且当前结构与任务输入不一致，无法载入',
    })
  })
})
