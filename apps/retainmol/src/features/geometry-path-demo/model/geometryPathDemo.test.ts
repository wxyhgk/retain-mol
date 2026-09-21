import { describe, expect, it } from 'vitest'
import { computeMoleculeRevision, createGeometryPathSession, previewConstrainedGeometry, validateGeometryMotion } from '@/domain/viewer/geometryPath'
import { interpolateMotion, motionFixture, motionRequest, motionTarget } from './motionFixture'
import { ribbonFixture } from './ribbonFixture'
import { inspectMotionPreview } from './useMotionDemo'

describe('geometry paths demo', () => {
  it('shows noncolliding endpoints while detecting a bond crossing in the linear path', () => {
    const target = motionTarget(motionFixture, 'crossing')
    const midpoint = interpolateMotion(motionFixture, target, 0.5)
    for (const pose of [motionFixture, midpoint, target]) {
      const atoms = pose.atoms
      for (let first = 0; first < atoms.length; first += 1) for (let second = first + 1; second < atoms.length; second += 1) {
        const a = atoms[first]!, b = atoms[second]!
        expect(Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z)).toBeGreaterThan(0.8)
      }
    }
    expect(midpoint.atoms[2]!.z).toBe(0)
    const report = validateGeometryMotion(motionFixture, target)
    expect(report.status).toBe('collision')
    expect(report.issues.some(issue => issue.kind === 'bond-bond')).toBe(true)
    expect(motionFixture.atoms[2]!.z).toBe(1)
  })

  it('rejects the crossing edit without exposing an applicable preview or altering history', () => {
    const session = createGeometryPathSession()
    try {
      session.currentApi.setMolecule(motionFixture); session.currentApi.history.clear()
      const context = session.getContext()
      const result = previewConstrainedGeometry(context, { targetObjectId: context.activeObjectId!, request: motionRequest(motionFixture, 'crossing') })
      expect(result.ok).toBe(false)
      expect(result.motionReport?.status).toBe('collision')
      expect(session.currentApi.getSnapshot().molecule).toEqual(motionFixture)
      expect(session.currentApi.getSnapshot().history.undoCount).toBe(0)
    } finally { session.dispose() }
  })

  it('locates a rejected request using its displayed nominal trajectory rather than the rejected solver path', () => {
    const nominalTarget = motionTarget(motionFixture, 'crossing')
    const rejectedTarget = { ...nominalTarget, atoms: nominalTarget.atoms.map(atom => atom.id.startsWith('motion-y-') ? { ...atom, z: -3 } : atom) }
    const rejectedReport = validateGeometryMotion(motionFixture, rejectedTarget)
    const failed = { ok: false as const, issues: [{ severity: 'error' as const, code: 'constraint-violation' as const, message: 'Candidate rejected' }], motionReport: rejectedReport }
    const inspection = inspectMotionPreview(motionFixture, nominalTarget, failed)
    expect(inspection.candidate).toBeNull()
    expect(inspection.report).toEqual(validateGeometryMotion(motionFixture, nominalTarget))
    expect(inspection.solverMotionReport).toBe(rejectedReport)
    const collision = inspection.report.issues.find(issue => issue.kind === 'bond-bond')!
    expect(collision.sampleTime).toBe(0.5)
    expect(interpolateMotion(motionFixture, nominalTarget, collision.sampleTime!).atoms[2]!.z).toBe(0)
    const safeNominal = inspectMotionPreview(motionFixture, motionTarget(motionFixture, 'safe'), failed)
    expect(safeNominal.report.safe).toBe(true)
    expect(safeNominal.candidate).toBeNull()
    expect(safeNominal.message).toContain('求解候选未通过，无法应用')
  })

  it('commits the safe translation as one undo step and rejects stale or changed previews', () => {
    const session = createGeometryPathSession()
    try {
      session.currentApi.setMolecule(motionFixture); session.currentApi.history.clear()
      const context = session.getContext()
      const result = previewConstrainedGeometry(context, { targetObjectId: context.activeObjectId!, request: motionRequest(motionFixture, 'safe') })
      expect(result.ok).toBe(true)
      if (result.ok === false) throw new Error(result.issues.map(issue => issue.message).join('; '))
      expect(result.motionReport?.safe).toBe(true)
      const inspection = inspectMotionPreview(motionFixture, motionTarget(motionFixture, 'safe'), result)
      expect(inspection.candidate).toBe(result)
      expect(inspection.report).toBe(result.motionReport)
      expect(() => session.apply({ ...result, molecule: motionFixture })).toThrow('预览已变化')
      expect(session.apply(result).committed).toBe(true)
      expect(session.currentApi.getSnapshot().history.undoCount).toBe(1)
      expect(() => session.apply(result)).toThrow()
      session.currentApi.history.undo()
      expect(session.currentApi.getSnapshot().molecule).toEqual(motionFixture)
      session.currentApi.history.redo()
      expect(computeMoleculeRevision(session.currentApi.getSnapshot().molecule)).toBe(result.nextRevision)
    } finally { session.dispose() }
  })

  it.each([0, 1, -1, 3, -3])('creates a valid ordered guide skeleton for %s half twists', halfTwists => {
    const data = ribbonFixture(halfTwists)
    expect(data.molecule.atoms).toHaveLength(48)
    expect(data.region.sections).toHaveLength(24)
    expect(data.region.closure).toBe(halfTwists === 0 ? 'parallel' : 'crossed')
    expect(data.validation.ok).toBe(true)
    expect(data.measurements.ok).toBe(true)
    expect(data.measurements.turnsDegrees).toHaveLength(24)
    for (const width of data.measurements.widthsAngstrom) expect(width).toBeCloseTo(1)
    const seam = data.molecule.bonds.find(bond => bond.id === 'ribbon-rail-left-23')!
    expect(seam.atomId2).toBe(halfTwists === 0 ? 'ribbon-left-0' : 'ribbon-right-0')
    expect(data.region.sections[0]!.leftAtomId).toBe('ribbon-left-0')
  })
})
