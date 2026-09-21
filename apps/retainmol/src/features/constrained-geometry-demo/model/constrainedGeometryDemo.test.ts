import { describe, expect, it } from 'vitest'
import { computeMoleculeRevision, createHeadlessModelingContext, previewConstrainedGeometry } from '@retainmol/mol-viewer/headless'
import { createConstrainedGeometrySession } from '@/domain/viewer/constrainedGeometry'
import { anchorAtomId, bondLengthDelta, ringFixture, ringRequest, targetAtomId } from './ringFixture'

describe('constrained ring geometry demo', () => {
  it.each([0.4, 0.5])('coordinates the closed ring for the offered %s Å target', lift => {
    const context = createHeadlessModelingContext(ringFixture)
    const before = JSON.stringify(context)
    const result = previewConstrainedGeometry(context, { targetObjectId: context.activeObjectId!, request: ringRequest('ring', lift) })
    expect(result.ok).toBe(true)
    if (result.ok === false) throw new Error(result.issues.map(issue => issue.message).join('; '))
    expect(result.report.hardViolationCount).toBe(0)
    expect(result.movedAtomIds.length).toBeGreaterThan(1)
    expect(result.molecule.bonds).toEqual(ringFixture.bonds)
    expect(result.molecule.atoms.find(atom => atom.id === anchorAtomId)).toEqual(ringFixture.atoms[0])
    expect(Math.abs(result.molecule.atoms.find(atom => atom.id === targetAtomId)!.z - lift)).toBeLessThanOrEqual(0.03)
    expect(bondLengthDelta(ringFixture, result.molecule)).toBeLessThanOrEqual(0.03)
    expect(JSON.stringify(context)).toBe(before)
  })

  it('refuses the all-fixed scenario and preserves current coordinates and history', () => {
    const session = createConstrainedGeometrySession()
    try {
      session.currentApi.setMolecule(ringFixture); session.currentApi.history.clear()
      const context = session.getContext()
      const result = previewConstrainedGeometry(context, { targetObjectId: context.activeObjectId!, request: ringRequest('locked', 0.5) })
      expect(result.ok).toBe(false)
      if (result.ok) throw new Error('The fixed fixture must not produce an applicable preview')
      expect(result.report?.hardViolationCount).toBeGreaterThan(0)
      expect(session.currentApi.getSnapshot().molecule).toEqual(ringFixture)
      expect(session.currentApi.getSnapshot().history.undoCount).toBe(0)
    } finally { session.dispose() }
  })

  it('keeps preview separate, revalidates before applying, and commits a single undo step', () => {
    const session = createConstrainedGeometrySession()
    try {
      session.currentApi.setMolecule(ringFixture); session.currentApi.history.clear()
      const context = session.getContext()
      const result = previewConstrainedGeometry(context, { targetObjectId: context.activeObjectId!, request: ringRequest('ring', 0.5) })
      expect(result.ok).toBe(true)
      if (result.ok === false) throw new Error(result.issues.map(issue => issue.message).join('; '))
      session.previewApi.setMolecule(result.molecule)
      expect(session.currentApi.getSnapshot().molecule).toEqual(ringFixture)
      expect(session.currentApi.getSnapshot().history.undoCount).toBe(0)
      expect(() => session.apply({ ...result, nextRevision: 'tampered' })).toThrow('不匹配')
      expect(() => session.apply({ ...result, molecule: ringFixture })).toThrow('不匹配')
      expect(session.apply(result).committed).toBe(true)
      expect(session.currentApi.getSnapshot().history.undoCount).toBe(1)
      expect(() => session.apply(result)).toThrow()
      session.currentApi.history.undo()
      expect(session.currentApi.getSnapshot().molecule).toEqual(ringFixture)
      session.currentApi.history.redo()
      expect(computeMoleculeRevision(session.currentApi.getSnapshot().molecule)).toBe(result.nextRevision)
    } finally { session.dispose() }
  })
})
