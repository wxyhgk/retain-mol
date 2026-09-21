import { describe, expect, it } from 'vitest'
import type { Atom, Bond, Molecule } from '../../model/types'
import {
  commitFragmentFusionCommand,
  prepareFragmentFusionCommand,
} from './fusionCommand'

const atom = (id: string, x = 0): Atom => ({ id, symbol: 'C', x, y: 0, z: 0 })
const bond = (id: string, atomId1: string, atomId2: string, order: Bond['order'] = 1): Bond => ({
  id,
  atomId1,
  atomId2,
  order,
})
const molecule = (atoms: Atom[], bonds: Bond[]): Molecule => ({ atoms, bonds })

const host = (): Molecule => molecule(
  [atom('h1'), atom('h2')],
  [bond('hb', 'h1', 'h2')],
)

const fragment = (): Molecule => molecule(
  [atom('r1'), atom('r2'), atom('r3')],
  [bond('rb', 'r1', 'r2'), bond('r23', 'r2', 'r3'), bond('r31', 'r3', 'r1')],
)

describe('fragment fusion command workflow', () => {
  it('previews and commits a candidate with an explicit topology effect', () => {
    const prepared = prepareFragmentFusionCommand({
      host: host(),
      fragment: fragment(),
      anchors: [{ hostBondId: 'hb', fragmentBondId: 'rb' }],
    })
    expect(prepared.candidates.length).toBeGreaterThan(0)
    const selected = prepared.candidates[0]
    expect(selected).toBeDefined()
    if (!selected) return
    const result = commitFragmentFusionCommand(prepared, selected.topologyKey, host())
    expect(result).toMatchObject({
      ok: true,
      effect: {
        addedAtomIds: ['r3'],
        removedAtomIds: [],
        addedBondIds: ['r23', 'r31'],
        removedBondIds: [],
      },
    })
  })

  it('rejects a topology that was not in the preview', () => {
    const prepared = prepareFragmentFusionCommand({
      host: host(),
      fragment: fragment(),
      anchors: [{ hostBondId: 'hb', fragmentBondId: 'rb' }],
    })
    const result = commitFragmentFusionCommand(prepared, 'unknown', host())
    expect(result).toMatchObject({ ok: false, code: 'candidate-not-found' })
  })

  it('rejects commit after the host chemistry changes', () => {
    const prepared = prepareFragmentFusionCommand({
      host: host(),
      fragment: fragment(),
      anchors: [{ hostBondId: 'hb', fragmentBondId: 'rb' }],
    })
    const changed = host()
    const changedBond = changed.bonds[0]
    const candidate = prepared.candidates[0]
    if (!changedBond || !candidate) return
    const changedMolecule: Molecule = {
      ...changed,
      bonds: [{ ...changedBond, order: 2 }],
    }
    const result = commitFragmentFusionCommand(
      prepared,
      candidate.topologyKey,
      changedMolecule,
    )
    expect(result).toMatchObject({ ok: false, code: 'stale-host' })
  })

  it('allows coordinate-only changes and preserves current host coordinates', () => {
    const prepared = prepareFragmentFusionCommand({
      host: host(),
      fragment: fragment(),
      anchors: [{ hostBondId: 'hb', fragmentBondId: 'rb' }],
    })
    const moved = host()
    const firstAtom = moved.atoms[0]
    const candidate = prepared.candidates[0]
    if (!firstAtom || !candidate) return
    const movedMolecule: Molecule = {
      ...moved,
      atoms: [{ ...firstAtom, x: 42 }, ...moved.atoms.slice(1)],
    }
    const result = commitFragmentFusionCommand(
      prepared,
      candidate.topologyKey,
      movedMolecule,
    )
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.molecule.atoms.find(({ id }) => id === 'h1')?.x).toBe(42)
  })
})
