import { describe, it, expect } from 'vitest'
import { analyzeStericContacts, createHeadlessModelingContext, generateTorsionCandidates, dryRunEditPlan, computeMoleculeRevision, type Molecule } from '@retainmol/mol-viewer/headless'
import { createStericDemoSession } from '@/domain/viewer/stericDemo'
import fixture from '../fixtures/spiro-benzyl.json'

const molecule = fixture.molecule as Molecule
const context = createHeadlessModelingContext(molecule)
const request = { targetObjectId: context.activeObjectId!, bondId: fixture.bondId, movingAtomId: fixture.movingAtomId, fixedAtomIds: fixture.fixedAtomIds }

describe('steric spirofluorene demo', () => {
  it('has complete hydrogens, a genuine shared spiro carbon, clashes, and a clean reference', () => {
    expect(molecule.atoms).toHaveLength(54)
    expect(molecule.atoms.filter(a => a.symbol === 'C')).toHaveLength(32)
    expect(analyzeStericContacts(molecule)).toMatchObject({ supported: true, hydrogenCoverage: 'complete', hardClashCount: 3 })
    expect(analyzeStericContacts(fixture.normal as Molecule).hardClashCount).toBe(0)
    const carbonIds = new Set(molecule.atoms.filter(a => a.symbol === 'C').map(a => a.id))
    const centers = molecule.atoms.filter(a => molecule.bonds.filter(b => [b.atomId1, b.atomId2].includes(a.id) && carbonIds.has(b.atomId1) && carbonIds.has(b.atomId2)).length === 4)
    expect(centers).toHaveLength(1)
  })
  it('search is repeatable, immutable, and preserves the core, graph and all bond lengths', () => {
    const before = JSON.stringify(context)
    const result = generateTorsionCandidates(context, request)
    expect(result).toEqual(generateTorsionCandidates(context, request))
    expect(result.sampledCount).toBe(24)
    expect(result.acceptedCount).toBe(18)
    expect(result.candidates).toHaveLength(6)
    for (const candidate of result.candidates) {
      expect(candidate.report.hardClashCount).toBe(0)
      expect(candidate.molecule.bonds).toEqual(molecule.bonds)
      for (const id of fixture.fixedAtomIds) expect(candidate.molecule.atoms.find(a => a.id === id)).toEqual(molecule.atoms.find(a => a.id === id))
      const replay = dryRunEditPlan(context, candidate.plan)
      expect(replay.ok).toBe(true)
      if (replay.ok) expect(computeMoleculeRevision(replay.molecule)).toBe(candidate.revision)
    }
    expect(JSON.stringify(context)).toBe(before)
    const reversed = createHeadlessModelingContext({ ...molecule, atoms: [...molecule.atoms].reverse(), bonds: [...molecule.bonds].reverse() })
    expect(generateTorsionCandidates(reversed, request).candidates.map(c => [c.id, c.metrics])).toEqual(result.candidates.map(c => [c.id, c.metrics]))
  })
  it('rejects locked groups, ring axes, invalid fixed atoms and missing hydrogens', () => {
    expect(generateTorsionCandidates(context, { ...request, fixedAtomIds: molecule.atoms.map(a => a.id) }).ok).toBe(false)
    expect(generateTorsionCandidates(context, { ...request, fixedAtomIds: ['missing'] }).ok).toBe(false)
    const ringBond = molecule.bonds.find(b => b.order === 1 && b.id !== request.bondId && fixture.fixedAtomIds.includes(b.atomId1) && fixture.fixedAtomIds.includes(b.atomId2))!
    expect(generateTorsionCandidates(context, { ...request, bondId: ringBond.id, movingAtomId: ringBond.atomId1 }).ok).toBe(false)
    const incomplete = createHeadlessModelingContext({ atoms: [{ id: 'c', symbol: 'C', x: 0, y: 0, z: 0 }], bonds: [] })
    expect(generateTorsionCandidates(incomplete, request).ok).toBe(false)
  })
  it('returns no candidate when a fixed nonlocal clash survives every sampled pose', () => {
    const reference = fixture.normal as Molecule
    const first = reference.atoms[0]!
    const invalid = { ...reference, atoms: reference.atoms.map((a, index) => index === 14 ? { ...a, x: first.x, y: first.y, z: first.z } : a) }
    const invalidContext = createHeadlessModelingContext(invalid)
    const result = generateTorsionCandidates(invalidContext, request)
    expect(result.ok).toBe(true)
    expect(result.sampledCount).toBe(24)
    expect(result.acceptedCount).toBe(0)
    expect(result.candidates).toEqual([])
    expect(result.issues[0]).toContain('没有找到')
  })
  it('previews without history, commits one undo step, rejects stale/tampered candidates', () => {
    const session = createStericDemoSession()
    try {
      session.currentApi.setMolecule(molecule); session.currentApi.history.clear()
      const live = session.getContext()
      const candidate = generateTorsionCandidates(live, { ...request, targetObjectId: live.activeObjectId! }).candidates[0]!
      session.previewApi.setMolecule(candidate.molecule)
      expect(session.currentApi.getSnapshot().history.undoCount).toBe(0)
      expect(() => session.apply({ ...candidate, revision: 'tampered' })).toThrow('预览不匹配')
      expect(session.apply(candidate).committed).toBe(true)
      expect(session.currentApi.getSnapshot().history.undoCount).toBe(1)
      expect(() => session.apply(candidate)).toThrow()
      session.currentApi.history.undo()
      expect(session.currentApi.getSnapshot().molecule).toEqual(molecule)
      session.currentApi.history.redo()
      expect(computeMoleculeRevision(session.currentApi.getSnapshot().molecule)).toBe(candidate.revision)
    } finally { session.dispose() }
  })
})
