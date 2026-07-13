import { describe, expect, it } from 'vitest'
import { createViewerRuntime, getViewerRuntimeServices } from '../runtime/ViewerRuntime'
import {
  commitEditPlan,
  getModelingContext,
  modelingConstraintsSchema,
} from './modeling'

describe('public modeling runtime adapter', () => {
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
