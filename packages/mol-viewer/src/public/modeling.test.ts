import { describe, expect, it } from 'vitest'
import { createViewerRuntime, getViewerRuntimeServices } from '../runtime/ViewerRuntime'
import { replayEditPlan, type EditPlan } from './headless'
import {
  commitEditPlan,
  getModelingContext,
  modelingConstraintsSchema,
} from './modeling'

describe('public modeling runtime adapter', () => {
  it('matches headless execution and records one undo step without affecting another runtime', () => {
    const first = createViewerRuntime()
    const second = createViewerRuntime()
    try {
      const store = getViewerRuntimeServices(first).moleculeStore
      const target = getModelingContext(first).objects[0]!
      const untouched = getModelingContext(second)
      const plan: EditPlan = {
        schemaVersion: 1, planId: 'parity', source: 'human',
        targetObjectId: target.objectId, expectedRevision: target.revision,
        commands: [
          { commandId: 'c', kind: 'atom.add', atomId: 'c', symbol: 'C', position: { x: 0, y: 0, z: 0 } },
          { commandId: 'o', kind: 'atom.add', atomId: 'o', symbol: 'O', position: { x: 1.4, y: 0, z: 0 } },
          { commandId: 'co', kind: 'bond.add', bondId: 'co', atomId1: 'c', atomId2: 'o', order: 1 },
          { commandId: 'replace', kind: 'atom.replace', atomId: 'o', symbol: 'N' },
        ],
      }
      const headless = replayEditPlan(target.molecule, plan, { objectId: target.objectId })
      expect(headless.ok).toBe(true)
      if (!headless.ok) return
      store.temporal.getState().clear()
      expect(commitEditPlan(plan, first)).toMatchObject({ ok: true, committed: true })
      expect(getModelingContext(first).objects[0]!.molecule).toEqual(headless.molecule)
      expect(store.temporal.getState().pastStates).toHaveLength(1)
      expect(getModelingContext(second)).toEqual(untouched)
      store.temporal.getState().undo()
      expect(getModelingContext(first).objects[0]!.molecule).toEqual(target.molecule)
      store.temporal.getState().redo()
      expect(getModelingContext(first).objects[0]!.molecule).toEqual(headless.molecule)
      expect(commitEditPlan(plan, first)).toMatchObject({ ok: false, committed: false })
      expect(store.temporal.getState().pastStates).toHaveLength(1)
    } finally {
      first.dispose()
      second.dispose()
    }
  })

  it('keeps failed batches and competing transactions out of state and history', () => {
    const runtime = createViewerRuntime()
    try {
      const store = getViewerRuntimeServices(runtime).moleculeStore
      const target = getModelingContext(runtime).objects[0]!
      const plan: EditPlan = {
        schemaVersion: 1, planId: 'atomic', source: 'human', targetObjectId: target.objectId,
        commands: [{ commandId: 'add', kind: 'atom.add', atomId: 'c', symbol: 'C', position: { x: 0, y: 0, z: 0 } }],
      }
      store.temporal.getState().clear()
      const before = store.getState().objectsById
      expect(commitEditPlan({ ...plan, commands: [...plan.commands,
        { commandId: 'bad', kind: 'atom.move', atomId: 'missing', position: { x: 1, y: 0, z: 0 } },
      ] }, runtime)).toMatchObject({ ok: false, committed: false })
      expect(store.getState().objectsById).toBe(before)
      expect(store.temporal.getState().pastStates).toHaveLength(0)

      const transaction = store.getState().beginTransaction('pointer-owner')
      try {
        expect(commitEditPlan(plan, runtime)).toMatchObject({ ok: false, committed: false })
        expect(transaction.active).toBe(true)
        expect(store.getState().objectsById).toBe(before)
      } finally { transaction.cancel() }
      expect(store.temporal.getState().pastStates).toHaveLength(0)
    } finally { runtime.dispose() }
  })

  it('commits one complete plan as one undo transaction', () => {
    const runtime = createViewerRuntime()
    const services = getViewerRuntimeServices(runtime)
    const context = getModelingContext(runtime)
    const target = context.objects[0]!

    const result = commitEditPlan({
      schemaVersion: 1,
      planId: 'build-c-c',
      source: 'ai',
      targetObjectId: target.objectId,
      expectedRevision: target.revision,
      commands: [
        {
          commandId: 'c1',
          kind: 'atom.add',
          atomId: 'ai-c-1',
          symbol: 'C',
          position: { x: 0, y: 0, z: 0 },
        },
        {
          commandId: 'c2',
          kind: 'atom.add',
          atomId: 'ai-c-2',
          symbol: 'C',
          position: { x: 1.54, y: 0, z: 0 },
        },
        {
          commandId: 'cc',
          kind: 'bond.add',
          bondId: 'ai-b-1',
          atomId1: 'ai-c-1',
          atomId2: 'ai-c-2',
          order: 1,
        },
      ],
    }, runtime)

    expect(result.ok).toBe(true)
    expect(result.committed).toBe(true)
    expect(getModelingContext(runtime).objects[0]?.molecule.atoms).toHaveLength(2)
    expect(getModelingContext(runtime).objects[0]?.molecule.bonds).toHaveLength(1)

    services.moleculeStore.temporal.getState().undo()
    expect(getModelingContext(runtime).objects[0]?.molecule.atoms).toHaveLength(0)
    expect(getModelingContext(runtime).objects[0]?.molecule.bonds).toHaveLength(0)
    runtime.dispose()
  })

  it('returns defensive context data and refuses a non-active target', () => {
    const runtime = createViewerRuntime()
    const services = getViewerRuntimeServices(runtime)
    const secondId = services.moleculeStore.getState().addToScene({
      name: 'second',
      atoms: [{ id: 'second-c', symbol: 'C', x: 0, y: 0, z: 0 }],
      bonds: [],
    }, false)
    const context = getModelingContext(runtime)
    const second = context.objects.find(object => object.objectId === secondId)!
    services.moleculeStore.getState().setActiveObject(context.objects[0]!.objectId)

    const result = commitEditPlan({
      schemaVersion: 1,
      planId: 'wrong-target',
      source: 'ai',
      targetObjectId: second.objectId,
      expectedRevision: second.revision,
      commands: [{
        commandId: 'move',
        kind: 'atom.move',
        atomId: 'second-c',
        position: { x: 1, y: 0, z: 0 },
      }],
    }, runtime)

    expect(result.ok).toBe(false)
    expect(result.issues.at(-1)?.code).toBe('target-not-active')
    expect(services.moleculeStore.getState().objectsById[secondId]?.molecule.atoms[0]?.x).toBe(0)
    runtime.dispose()
  })

  it('exports strict constraints and does not commit a constraint violation', () => {
    expect(modelingConstraintsSchema.safeParse({
      fixedAtomPositions: ['fixed-c'],
      unknown: true,
    }).success).toBe(false)

    const runtime = createViewerRuntime()
    const services = getViewerRuntimeServices(runtime)
    services.moleculeStore.getState().setMolecule({
      name: 'fixed-carbon',
      atoms: [{ id: 'fixed-c', symbol: 'C', x: 0, y: 0, z: 0 }],
      bonds: [],
    })
    const target = getModelingContext(runtime).objects[0]!
    const result = commitEditPlan({
      schemaVersion: 1,
      planId: 'move-fixed',
      source: 'ai',
      targetObjectId: target.objectId,
      expectedRevision: target.revision,
      constraints: { fixedAtomPositions: ['fixed-c'] },
      commands: [{
        commandId: 'move-fixed',
        kind: 'atom.move',
        atomId: 'fixed-c',
        position: { x: 1, y: 0, z: 0 },
      }],
    }, runtime)

    expect(result.ok).toBe(false)
    expect(result.committed).toBe(false)
    expect(result.issues.at(-1)?.code).toBe('constraint-violation')
    expect(getModelingContext(runtime).objects[0]?.molecule.atoms[0]?.x).toBe(0)
    runtime.dispose()
  })
})
