import { describe, expect, it } from 'vitest'
import { createViewerRuntime, getViewerRuntimeServices } from '../runtime/ViewerRuntime'
import { commitEditPlan, getModelingContext } from './modeling'
import {
  createHeadlessModelingContext, previewConstrainedGeometry, dryRunEditPlan,
  geometryMotionOptionsSchema, constrainedGeometryRequestSchema,
  geometryRibbonRegionSchema, geometryRibbonGuideRequestSchema, createRibbonGuide,
  type ConstrainedGeometryRequest, type Molecule,
} from './headless'

// Two long segments isolate skeleton crossing from atom-endpoint overlap.
function crossingFixture(): Molecule {
  return { atoms: [
    { id: 'a', symbol: 'C', x: -2, y: 0, z: 0 },
    { id: 'b', symbol: 'C', x: 2, y: 0, z: 0 },
    { id: 'c', symbol: 'C', x: 0, y: -2, z: 1 },
    { id: 'd', symbol: 'C', x: 0, y: 2, z: 1 },
  ], bonds: [
    { id: 'ab', atomId1: 'a', atomId2: 'b', order: 1 },
    { id: 'cd', atomId1: 'c', atomId2: 'd', order: 1 },
  ] }
}

function request(z: number): ConstrainedGeometryRequest {
  return { movableAtomIds: ['c', 'd'], motion: {}, constraints: [
    { id: 'move-c', kind: 'position', strength: 'hard', atomId: 'c', target: { x: 0, y: -2, z }, tolerance: .03 },
    { id: 'move-d', kind: 'position', strength: 'hard', atomId: 'd', target: { x: 0, y: 2, z }, tolerance: .03 },
  ] }
}

describe('geometry motion public transaction boundary', () => {
  it('rejects a crossing in preview and command replay without changing the live molecule or history', () => {
    const runtime = createViewerRuntime()
    try {
      const store = getViewerRuntimeServices(runtime).moleculeStore
      store.getState().setMolecule(crossingFixture()); store.temporal.getState().clear()
      const context = getModelingContext(runtime), target = context.objects[0]!
      const preview = previewConstrainedGeometry(context, { targetObjectId: target.objectId, request: request(-1) })
      expect(preview).toMatchObject({ ok: false, motionReport: { safe: false, status: 'collision' } })
      const plan = { schemaVersion: 1 as const, planId: 'crossing', source: 'human' as const,
        targetObjectId: target.objectId, expectedRevision: target.revision,
        commands: [{ kind: 'geometry.solveConstraints' as const, commandId: 'move', request: request(-1) }] }
      expect(dryRunEditPlan(context, JSON.parse(JSON.stringify(plan))).ok).toBe(false)
      expect(commitEditPlan(plan, runtime)).toMatchObject({ ok: false, committed: false })
      expect(getModelingContext(runtime).objects[0]!.molecule).toEqual(target.molecule)
      expect(store.temporal.getState().pastStates).toHaveLength(0)
    } finally { runtime.dispose() }
  })

  it('carries a safe motion report through JSON replay and one undoable commit', () => {
    const runtime = createViewerRuntime()
    try {
      const store = getViewerRuntimeServices(runtime).moleculeStore
      store.getState().setMolecule(crossingFixture()); store.temporal.getState().clear()
      const context = getModelingContext(runtime), target = context.objects[0]!
      const preview = previewConstrainedGeometry(context, { targetObjectId: target.objectId, request: request(2) })
      expect(preview).toMatchObject({ ok: true, motionReport: { safe: true, status: 'safe', trajectory: 'linear' } })
      if (preview.ok === false) throw new Error('safe path unexpectedly rejected')
      const replay = dryRunEditPlan(context, JSON.parse(JSON.stringify(preview.plan)))
      expect(replay).toMatchObject({ ok: true, nextRevision: preview.nextRevision })
      expect(commitEditPlan(preview.plan, runtime)).toMatchObject({ ok: true, committed: true })
      expect(store.temporal.getState().pastStates).toHaveLength(1)
      store.temporal.getState().undo()
      expect(getModelingContext(runtime).objects[0]!.molecule).toEqual(target.molecule)
      store.temporal.getState().redo()
      expect(getModelingContext(runtime).objects[0]!.molecule).toEqual(preview.molecule)
    } finally { runtime.dispose() }
  })

  it('does not turn an exhausted validation budget into an applicable preview', () => {
    const context = createHeadlessModelingContext(crossingFixture())
    const result = previewConstrainedGeometry(context, { targetObjectId: context.activeObjectId!, request: { ...request(2), motion: { maxChecks: 1 } } })
    expect(result).toMatchObject({ ok: false, motionReport: { safe: false, status: 'indeterminate' } })
  })

  it('rejects near-neighbor collapse hidden by a geometrically valid half-turn endpoint', () => {
    const molecule: Molecule = { atoms: [
      { id: 'c', symbol: 'C', x: 0, y: 0, z: 0 },
      { id: 'a', symbol: 'C', x: 1, y: 1, z: 1 },
      { id: 'b', symbol: 'C', x: 1, y: -1, z: -1 },
      { id: 'd', symbol: 'C', x: -1, y: 1, z: -1 },
      { id: 'e', symbol: 'C', x: -1, y: -1, z: 1 },
    ], bonds: ['a', 'b', 'd', 'e'].map(id => ({ id: `c-${id}`, atomId1: 'c', atomId2: id, order: 1 })) }
    const context = createHeadlessModelingContext(molecule)
    const result = previewConstrainedGeometry(context, { targetObjectId: context.activeObjectId!, request: {
      movableAtomIds: ['a', 'b', 'd', 'e'], motion: {}, maxIterations: 500,
      constraints: molecule.atoms.slice(1).map(atom => ({ id: `turn-${atom.id}`, kind: 'position' as const,
        strength: 'hard' as const, atomId: atom.id,
        target: { x: atom.x, y: -atom.y, z: -atom.z }, tolerance: 1e-6 })),
    } })
    expect(result).toMatchObject({ ok: false, motionReport: { safe: false } })
    expect(context.objects[0]!.molecule).toEqual(molecule)
  })

  it('serializes explicit opt-in while rejecting unsafe limits and unknown keys', () => {
    expect(constrainedGeometryRequestSchema.parse(request(2)).motion).toEqual({})
    for (const invalid of [{ minBondDistance: 0 }, { minAtomDistance: NaN }, { maxChecks: 0 }, { maxDepth: 31 }, { ignoreCollisions: true }]) {
      expect(geometryMotionOptionsSchema.safeParse(invalid).success).toBe(false)
    }
  })

  it('bounds serialized ribbon requests before producing a procedural guide', () => {
    const input = { sectionCount: 24, radius: 6, halfWidth: 1, halfTwists: 3 }
    expect(createRibbonGuide(geometryRibbonGuideRequestSchema.parse(input)).ok).toBe(true)
    for (const invalid of [{ ...input, sectionCount: 501 }, { ...input, halfWidth: 6 }, { ...input, halfTwists: 12 }]) {
      expect(geometryRibbonGuideRequestSchema.safeParse(invalid).success).toBe(false)
      expect(createRibbonGuide(invalid).ok).toBe(false)
    }
    expect(geometryRibbonRegionSchema.safeParse({ id: 'belt', closure: 'crossed', sections: [] }).success).toBe(false)
  })
})
