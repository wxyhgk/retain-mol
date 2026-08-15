import { describe, expect, it } from 'vitest'
import { exportSdf, parseSdf } from '../io/molFormat'
import type { Molecule } from '../molecule'
import {
  createHeadlessModelingContext,
  replayEditPlan,
  replayEditPlanTrace,
} from './headless'

const anchor: Molecule = {
  name: 'anchored-core',
  atoms: [{ id: 'anchor:B', symbol: 'B', x: 0, y: 0, z: 0 }],
  bonds: [],
}

describe('headless modeling adapter', () => {
  it('replays production commands and preserves stable anchor ids', () => {
    const context = createHeadlessModelingContext(anchor, { objectId: 'benchmark:test' })
    const result = replayEditPlan(anchor, {
      schemaVersion: 1,
      planId: 'attach-carbon',
      source: 'ai',
      targetObjectId: 'benchmark:test',
      expectedRevision: context.objects[0]?.revision,
      constraints: { fixedAtomPositions: ['anchor:B'] },
      commands: [
        {
          commandId: 'add-c',
          kind: 'atom.add',
          atomId: 'candidate:C1',
          symbol: 'C',
          position: { x: 1.5, y: 0, z: 0 },
        },
        {
          commandId: 'bond-b-c',
          kind: 'bond.add',
          bondId: 'candidate:bond1',
          atomId1: 'anchor:B',
          atomId2: 'candidate:C1',
          order: 1,
        },
      ],
    }, { objectId: 'benchmark:test' })

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.molecule.atoms.find(atom => atom.id === 'anchor:B')).toMatchObject({
      x: 0,
      y: 0,
      z: 0,
    })
    expect(result.changes.addedAtomIds).toEqual(['candidate:C1'])
    expect(result.changes.addedBondIds).toEqual(['candidate:bond1'])
  })

  it('exports the replayed graph and coordinates as one 3D SDF artifact', () => {
    const result = replayEditPlan(anchor, {
      schemaVersion: 1,
      planId: 'sdf-roundtrip',
      source: 'ai',
      targetObjectId: 'benchmark:test',
      commands: [
        {
          commandId: 'add-n',
          kind: 'atom.add',
          atomId: 'candidate:N1',
          symbol: 'N',
          position: { x: 0, y: 1.45, z: 0.25 },
        },
        {
          commandId: 'bond-b-n',
          kind: 'bond.add',
          bondId: 'candidate:bond-bn',
          atomId1: 'anchor:B',
          atomId2: 'candidate:N1',
          order: 1,
        },
      ],
    }, { objectId: 'benchmark:test' })

    expect(result.ok).toBe(true)
    if (!result.ok) return
    const roundTrip = parseSdf(exportSdf(result.molecule))[0]!
    expect(roundTrip.atoms.map(atom => atom.symbol)).toEqual(['B', 'N'])
    expect(roundTrip.bonds).toHaveLength(1)
    expect(roundTrip.atoms[1]?.z).toBeCloseTo(0.25, 3)
  })

  it('publishes complete before and after states in command order', () => {
    const trace = replayEditPlanTrace(anchor, {
      schemaVersion: 1,
      planId: 'trace-add-and-bond',
      source: 'ai',
      targetObjectId: 'benchmark:test',
      commands: [
        {
          commandId: 'add-c',
          kind: 'atom.add',
          atomId: 'candidate:C1',
          symbol: 'C',
          position: { x: 1.5, y: 0, z: 0 },
        },
        {
          commandId: 'bond-b-c',
          kind: 'bond.add',
          bondId: 'candidate:bond1',
          atomId1: 'anchor:B',
          atomId2: 'candidate:C1',
          order: 1,
        },
      ],
    }, { objectId: 'benchmark:test' })

    expect(trace.ok).toBe(true)
    if (!trace.ok) return
    expect(trace.steps.map(step => step.commandId)).toEqual(['add-c', 'bond-b-c'])
    expect(trace.steps[0]?.before.atoms).toHaveLength(1)
    expect(trace.steps[0]?.after.atoms).toHaveLength(2)
    expect(trace.steps[1]?.before).toEqual(trace.steps[0]?.after)
    expect(trace.steps[1]?.after).toEqual(trace.result.molecule)
    expect(trace.steps[1]?.after.bonds).toHaveLength(1)
  })

  it('does not publish a partial trace when the complete plan is invalid', () => {
    const trace = replayEditPlanTrace(anchor, {
      schemaVersion: 1,
      planId: 'invalid-trace',
      source: 'ai',
      targetObjectId: 'benchmark:test',
      commands: [
        {
          commandId: 'missing-bond',
          kind: 'bond.remove',
          bondId: 'missing',
        },
      ],
    }, { objectId: 'benchmark:test' })

    expect(trace.ok).toBe(false)
    expect('steps' in trace).toBe(false)
  })

  it('captures generated entity ids from the same execution as the final result', () => {
    const chargedCarbon: Molecule = {
      atoms: [{ id: 'atom:C', symbol: 'C', x: 0, y: 0, z: 0, charge: 1 }],
      bonds: [],
    }
    const trace = replayEditPlanTrace(chargedCarbon, {
      schemaVersion: 1,
      planId: 'trace-generated-hydrogens',
      source: 'ai',
      targetObjectId: 'benchmark:test',
      commands: [{
        commandId: 'set-charge',
        kind: 'atom.setCharge',
        atomId: 'atom:C',
        charge: 1,
      }],
    }, { objectId: 'benchmark:test' })

    expect(trace.ok).toBe(true)
    if (!trace.ok) return
    expect(trace.steps).toHaveLength(1)
    expect(trace.steps[0]?.after).toEqual(trace.result.molecule)
    expect(trace.steps[0]?.after.atoms.map(atom => atom.id)).toEqual(
      trace.result.molecule.atoms.map(atom => atom.id),
    )
  })
})
