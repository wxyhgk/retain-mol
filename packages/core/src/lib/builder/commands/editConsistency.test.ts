import { describe, expect, it } from 'vitest'
import type { Molecule } from '../../model/types'
import { runAutoInferBondsCommand } from './bond'
import { runSetBondAngleCommand, runSetBondLengthCommand, runSetDihedralAngleCommand } from './geometry'
import { runCenterMoleculeCommand } from './scene'
import { calcAngle, calcDihedral } from '../geometry/measure'
import { perceiveAtomChirality } from '../../stereo/perception'
import { createHeadlessModelingContext, replayEditPlan } from '../../modeling/headless'

const chain: Molecule = {
  atoms: [
    { id: 'a', symbol: 'C', x: 0, y: 1, z: 0 },
    { id: 'b', symbol: 'C', x: 0, y: 0, z: 0 },
    { id: 'c', symbol: 'C', x: 1.5, y: 0, z: 0 },
    { id: 'd', symbol: 'O', x: 1.5, y: 1, z: 1 },
  ],
  bonds: [
    { id: 'ab', atomId1: 'a', atomId2: 'b', order: 1 },
    { id: 'bc', atomId1: 'b', atomId2: 'c', order: 1 },
    { id: 'cd', atomId1: 'c', atomId2: 'd', order: 1 },
  ],
}

describe('edit command consistency', () => {
  it('reports unchanged geometry targets and already centered molecules as no-ops', () => {
    const [a, b, c, d] = chain.atoms
    expect(runSetBondLengthCommand(chain, 'b', 'c', 1.5)).toEqual({ ok: true, changed: false })
    expect(runSetBondAngleCommand(chain, 'a', 'b', 'c', calcAngle(a!, b!, c!))).toEqual({ ok: true, changed: false })
    expect(runSetDihedralAngleCommand(chain, 'a', 'b', 'c', 'd', calcDihedral(a!, b!, c!, d!) + 360))
      .toEqual({ ok: true, changed: false })
    expect(runCenterMoleculeCommand({ atoms: [], bonds: [] })).toEqual({ ok: true, changed: false })
    expect(runCenterMoleculeCommand({ atoms: [{ id: 'c', symbol: 'C', x: 0, y: 0, z: 0 }], bonds: [] }))
      .toEqual({ ok: true, changed: false })
  })

  it('retains surviving inferred bond IDs, endpoint direction and metadata when other bonds change', () => {
    const molecule: Molecule = {
      atoms: [
        { id: 'c', symbol: 'C', x: 0, y: 0, z: 0 },
        { id: 'o', symbol: 'O', isotope: 18, label: 'oxygen', x: 1.43, y: 0, z: 0 },
        { id: 'h', symbol: 'H', x: -1.09, y: 0, z: 0 },
      ],
      bonds: [{ id: 'stable', atomId1: 'o', atomId2: 'c', order: 1, wedge: 'up' }],
    }
    const before = structuredClone(molecule)
    const result = runAutoInferBondsCommand(molecule)
    expect(result.ok && result.changed).toBe(true)
    if (!result.ok || !result.changed) return
    expect(result.molecule.bonds).toContainEqual(molecule.bonds[0])
    expect(result.molecule.bonds).toHaveLength(2)
    expect(result.molecule.atoms).toEqual(molecule.atoms)
    expect(runAutoInferBondsCommand(result.molecule)).toEqual({ ok: true, changed: false })
    expect(molecule).toEqual(before)
  })

  it('keeps a no-op from silently repairing an existing stereo annotation in headless', () => {
    const molecule: Molecule = { atoms: [{ id: 'c', symbol: 'C', x: 0, y: 0, z: 0, chirality: 'R' }], bonds: [] }
    const context = createHeadlessModelingContext(molecule)
    const result = replayEditPlan(molecule, {
      schemaVersion: 1, planId: 'noop', source: 'human', targetObjectId: context.activeObjectId!,
      commands: [{ commandId: 'same', kind: 'atom.move', atomId: 'c', position: { x: 0, y: 0, z: 0 } }],
    })
    expect(result).toMatchObject({ ok: true, changed: false, molecule })
  })

  it('reconciles authored chirality identically for direct and headless geometry commands', () => {
    const base: Molecule = {
      atoms: [
        { id: 'c', symbol: 'C', x: 0, y: 0, z: 0 },
        { id: 'f', symbol: 'F', x: 1, y: 0, z: 0 },
        { id: 'cl', symbol: 'Cl', x: 0, y: 1, z: 0 },
        { id: 'br', symbol: 'Br', x: 0, y: 0, z: 1 },
        { id: 'h', symbol: 'H', x: 1, y: -1, z: -1 },
      ],
      bonds: ['f', 'cl', 'br', 'h'].map(id => ({ id: `c-${id}`, atomId1: 'c', atomId2: id, order: 1 })),
    }
    const perceived = perceiveAtomChirality(base).get('c')!
    // An imported stale annotation must be refreshed on a real geometry edit.
    const chirality = perceived === 'R' ? 'S' as const : 'R' as const
    expect(perceived).toBeDefined()
    const molecule = { ...base, atoms: base.atoms.map(atom => atom.id === 'c' ? { ...atom, chirality } : atom) }
    const direct = runSetBondAngleCommand(molecule, 'f', 'c', 'cl', 170)
    const result = replayEditPlan(molecule, {
      schemaVersion: 1, planId: 'geometry', source: 'human', targetObjectId: 'molecule',
      commands: [{ commandId: 'angle', kind: 'geometry.setBondAngle', atomId1: 'f', atomId2: 'c', atomId3: 'cl', angleDegrees: 170 }],
    }, { objectId: 'molecule' })
    if (!direct.ok || !direct.changed || !result.ok) throw new Error('expected geometry change')
    expect(perceiveAtomChirality(direct.molecule).get('c')).not.toBe(chirality)
    expect(direct.molecule.atoms[0]?.chirality).toBe(perceiveAtomChirality(direct.molecule).get('c'))
    expect(result.molecule).toEqual(direct.molecule)
  })
})
