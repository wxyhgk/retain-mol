import { describe, expect, it } from 'vitest'
import { createViewerRuntime, getViewerRuntimeServices } from '../runtime/ViewerRuntime'
import { commitEditPlan, getModelingContext } from './modeling'
import {
  createHeadlessModelingContext, previewConstrainedGeometry, dryRunEditPlan,
  constrainedGeometryRequestSchema, type ConstrainedGeometryRequest, type Molecule,
} from './headless'

function ring(): Molecule {
  return {
    name: 'procedural geometry test ring',
    atoms: Array.from({ length: 6 }, (_, i) => ({ id: `c${i}`, symbol: 'C', x: 1.5 * Math.cos(i * Math.PI / 3), y: 1.5 * Math.sin(i * Math.PI / 3), z: 0 })),
    bonds: Array.from({ length: 6 }, (_, i) => ({ id: `b${i}`, atomId1: `c${i}`, atomId2: `c${(i + 1) % 6}`, order: 1 as const })),
  }
}

function lift(molecule: Molecule): ConstrainedGeometryRequest {
  return {
    movableAtomIds: molecule.atoms.slice(1).map(a => a.id), maxIterations: 200,
    constraints: [{ id: 'lift', kind: 'position', strength: 'hard', atomId: 'c3', target: { x: -1.5, y: 0, z: 0.5 }, tolerance: 0.03 }],
  }
}

describe('constrained geometry public modeling integration', () => {
  it('previews without mutation, replays exactly, commits once and supports undo/redo', () => {
    const runtime = createViewerRuntime()
    try {
      const store = getViewerRuntimeServices(runtime).moleculeStore
      store.getState().setMolecule(ring())
      store.temporal.getState().clear()
      const context = getModelingContext(runtime)
      const object = context.objects[0]!
      const original = structuredClone(object.molecule)
      const preview = previewConstrainedGeometry(context, { targetObjectId: object.objectId, request: lift(original) })
      expect(preview.ok).toBe(true)
      if (preview.ok === false) throw new Error(preview.issues.map(i => i.message).join('; '))
      expect(preview.report.satisfied).toBe(true)
      expect(preview.movedAtomIds.length).toBeGreaterThan(1)
      expect(preview.molecule.atoms[0]).toEqual(original.atoms[0])
      expect(preview.molecule.bonds).toEqual(original.bonds)
      expect(context.objects[0]!.molecule).toEqual(original)
      expect(getModelingContext(runtime).objects[0]!.molecule).toEqual(original)
      expect(store.temporal.getState().pastStates).toHaveLength(0)
      const replay = dryRunEditPlan(context, JSON.parse(JSON.stringify(preview.plan)))
      expect(replay.ok).toBe(true)
      if (!replay.ok) throw new Error('replay rejected')
      expect(replay.molecule).toEqual(preview.molecule)
      expect(replay.nextRevision).toBe(preview.nextRevision)
      expect(commitEditPlan(preview.plan, runtime)).toMatchObject({ ok: true, committed: true, nextRevision: preview.nextRevision })
      expect(store.temporal.getState().pastStates).toHaveLength(1)
      expect(commitEditPlan(preview.plan, runtime)).toMatchObject({ ok: false, committed: false })
      store.temporal.getState().undo()
      expect(getModelingContext(runtime).objects[0]!.molecule).toEqual(original)
      store.temporal.getState().redo()
      expect(getModelingContext(runtime).objects[0]!.molecule).toEqual(preview.molecule)
    } finally { runtime.dispose() }
  })

  it('returns violations for locked geometry and leaves an entire failed edit batch untouched', () => {
    const runtime = createViewerRuntime()
    try {
      const store = getViewerRuntimeServices(runtime).moleculeStore
      store.getState().setMolecule(ring()); store.temporal.getState().clear()
      const context = getModelingContext(runtime), target = context.objects[0]!
      const request = { ...lift(target.molecule), movableAtomIds: [] }
      const rejected = previewConstrainedGeometry(context, { targetObjectId: target.objectId, request })
      expect(rejected.ok).toBe(false)
      if (rejected.ok) throw new Error('locked geometry unexpectedly accepted')
      expect(rejected.report?.hardViolationCount).toBeGreaterThan(0)
      const result = commitEditPlan({
        schemaVersion: 1, planId: 'reject-whole-batch', source: 'human', targetObjectId: target.objectId, expectedRevision: target.revision,
        commands: [
          { kind: 'atom.move', commandId: 'move-first', atomId: 'c1', position: { x: 1, y: 2, z: 0 } },
          { kind: 'geometry.solveConstraints', commandId: 'impossible', request },
        ],
      }, runtime)
      expect(result).toMatchObject({ ok: false, committed: false })
      expect(getModelingContext(runtime).objects[0]!.molecule).toEqual(target.molecule)
      expect(store.temporal.getState().pastStates).toHaveLength(0)
    } finally { runtime.dispose() }
  })

  it('rejects malformed requests, stale context and unavailable capabilities', () => {
    const molecule = ring(), context = createHeadlessModelingContext(molecule), target = context.objects[0]!
    expect(constrainedGeometryRequestSchema.safeParse({ ...lift(molecule), maxIterations: Infinity }).success).toBe(false)
    expect(constrainedGeometryRequestSchema.safeParse({ ...lift(molecule), unexpected: true }).success).toBe(false)
    const stale = { ...context, objects: [{ ...target, revision: 'stale' }] }
    expect(previewConstrainedGeometry(stale, { targetObjectId: target.objectId, request: lift(molecule) })).toMatchObject({ ok: false, issues: [{ code: 'stale-context' }] })
    expect(previewConstrainedGeometry({ ...context, capabilities: [] }, { targetObjectId: target.objectId, request: lift(molecule) })).toMatchObject({ ok: false, issues: [{ code: 'unsupported-command' }] })
  })
})
