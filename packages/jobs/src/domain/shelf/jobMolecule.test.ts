import { describe, expect, it } from 'vitest'
import type { Molecule } from '@retainmol/mol-viewer/core'
import type { JobDetail } from '../jobTypes'
import {
  SHELF_MAX_ATOMS,
  deriveShelfEntry,
  isMoleculeSnapshot,
  resolveShelfMoleculeSource,
} from './jobMolecule'

const water: Molecule = {
  atoms: [
    { id: 'o', symbol: 'O', x: 0, y: 0, z: 0 },
    { id: 'h1', symbol: 'H', x: 0.96, y: 0, z: 0 },
    { id: 'h2', symbol: 'H', x: -0.24, y: 0.93, z: 0 },
  ],
  bonds: [
    { id: 'b1', atomId1: 'o', atomId2: 'h1', order: 1 },
    { id: 'b2', atomId1: 'o', atomId2: 'h2', order: 1 },
  ],
}

function job(request: JobDetail['request']): JobDetail {
  return {
    id: 'job-1',
    kind: 'xtb-optimization',
    status: 'queued',
    name: 'shelf',
    createdAt: '2026-07-16T08:00:00Z',
    ...(request !== undefined ? { request } : {}),
  }
}

const xtbParams = { charge: 0, multiplicity: 1, method: 'gfn2', maxSteps: 200, optLevel: 'normal' } as const

describe('jobMolecule', () => {
  it('validates molecule snapshots strictly', () => {
    expect(isMoleculeSnapshot(water)).toBe(true)
    expect(isMoleculeSnapshot({ atoms: water.atoms })).toBe(false)
    expect(isMoleculeSnapshot({ ...water, bonds: [{ id: 'b', atomId1: 'o', atomId2: 'h1', order: 4 }] })).toBe(false)
    expect(isMoleculeSnapshot(null)).toBe(false)
  })

  it('prefers the inline snapshot, then revision, then derived structure', () => {
    const inline = resolveShelfMoleculeSource(job({ ...xtbParams, structure: { atoms: [...water.atoms] }, molecule: water }))
    expect(inline.kind).toBe('inline')

    const revision = resolveShelfMoleculeSource(job({ ...xtbParams, moleculeRevisionId: 'rev-9' }))
    expect(revision).toEqual({ kind: 'revision', revisionId: 'rev-9' })

    const derived = resolveShelfMoleculeSource(job({ ...xtbParams, structure: { atoms: [...water.atoms] } }))
    expect(derived.kind).toBe('derived')
    if (derived.kind === 'derived') {
      expect(derived.molecule.bonds.length).toBeGreaterThan(0)
    }

    expect(resolveShelfMoleculeSource(job(undefined))).toEqual({ kind: 'none' })
  })

  it('caches source resolution per detail reference', () => {
    const detail = job({ ...xtbParams, structure: { atoms: [...water.atoms] } })
    expect(resolveShelfMoleculeSource(detail)).toBe(resolveShelfMoleculeSource(detail))
  })

  it('derives entries across loading, ready, oversized, and unavailable states', () => {
    expect(deriveShelfEntry(undefined, true, undefined, false)).toEqual({ state: 'loading' })
    expect(deriveShelfEntry(undefined, false, undefined, false)).toEqual({ state: 'unavailable' })

    const inlineJob = job({ ...xtbParams, structure: { atoms: [...water.atoms] }, molecule: water })
    expect(deriveShelfEntry(inlineJob, false, undefined, false)).toEqual({ state: 'ready', molecule: water })

    const revisionJob = job({ ...xtbParams, moleculeRevisionId: 'rev-9' })
    expect(deriveShelfEntry(revisionJob, false, undefined, true)).toEqual({ state: 'loading' })
    expect(deriveShelfEntry(revisionJob, false, undefined, false)).toEqual({ state: 'unavailable' })
    expect(deriveShelfEntry(revisionJob, false, { molecule: water }, false)).toEqual({ state: 'ready', molecule: water })

    const bigAtoms = Array.from({ length: SHELF_MAX_ATOMS + 1 }, (_, i) => ({ id: `a${i}`, symbol: 'C', x: i * 1.6, y: 0, z: 0 }))
    const big: Molecule = { atoms: bigAtoms, bonds: [] }
    expect(deriveShelfEntry(job({ ...xtbParams, structure: { atoms: bigAtoms }, molecule: big }), false, undefined, false))
      .toEqual({ state: 'oversized', atomCount: SHELF_MAX_ATOMS + 1 })
  })
})
