import { describe, expect, it } from 'vitest'
import { exportSdf, parseSdf } from '../io/molFormat'
import type { Molecule } from '../molecule'
import { createHeadlessModelingContext, replayEditPlan } from './headless'

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
})
