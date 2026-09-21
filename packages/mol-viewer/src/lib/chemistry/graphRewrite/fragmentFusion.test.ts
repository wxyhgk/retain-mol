import { describe, expect, it } from 'vitest'
import type { Atom, Bond, Molecule } from '../../model/types'
import { applyExplicitChemicalRewrite, planFragmentFusionAcrossBonds } from './index'

const atom = (id: string, symbol = 'C'): Atom => ({ id, symbol, x: 0, y: 0, z: 0 })
const bond = (id: string, atomId1: string, atomId2: string, order: Bond['order'] = 1): Bond => ({
  id,
  atomId1,
  atomId2,
  order,
})
const molecule = (atoms: Atom[], bonds: Bond[]): Molecule => ({ atoms, bonds })

describe('explicit chemical graph pushout', () => {
  it('rejects merging different isotope identities at an atom interface', () => {
    const result = applyExplicitChemicalRewrite(
      molecule([{ ...atom('h1'), isotope: 13 }], []),
      { right: molecule([{ ...atom('r1'), isotope: 12 }], []), atomInterface: [{ hostAtomId: 'h1', rightAtomId: 'r1' }] },
    )
    expect(result).toMatchObject({ ok: false, code: 'atom-label-conflict' })
  })
  it('glues a fragment along one shared edge without duplicating that edge', () => {
    const host = molecule([atom('h1'), atom('h2')], [bond('hb', 'h1', 'h2')])
    const right = molecule(
      [atom('r1'), atom('r2'), atom('r3')],
      [bond('rb', 'r1', 'r2'), bond('r23', 'r2', 'r3'), bond('r31', 'r3', 'r1')],
    )
    const result = applyExplicitChemicalRewrite(host, {
      right,
      atomInterface: [
        { hostAtomId: 'h1', rightAtomId: 'r1' },
        { hostAtomId: 'h2', rightAtomId: 'r2' },
      ],
      bondInterface: [{ hostBondId: 'hb', rightBondId: 'rb' }],
    })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.molecule.atoms.map(({ id }) => id).sort()).toEqual(['h1', 'h2', 'r3'])
    expect(result.molecule.bonds).toHaveLength(3)
  })

  it('rejects an unshared duplicate edge instead of silently merging it', () => {
    const result = applyExplicitChemicalRewrite(
      molecule([atom('h1'), atom('h2')], [bond('hb', 'h1', 'h2')]),
      {
        right: molecule([atom('r1'), atom('r2')], [bond('rb', 'r1', 'r2')]),
        atomInterface: [
          { hostAtomId: 'h1', rightAtomId: 'r1' },
          { hostAtomId: 'h2', rightAtomId: 'r2' },
        ],
      },
    )
    expect(result).toMatchObject({ ok: false, code: 'duplicate-bond' })
  })

  it('uses structured topology keys for ids containing separators', () => {
    const first = molecule([atom('a'), atom('b|c')], [bond('x', 'a', 'b|c')])
    const second = molecule([atom('a|b'), atom('c')], [bond('y', 'a|b', 'c')])
    const left = applyExplicitChemicalRewrite(first, { right: molecule([], []), atomInterface: [] })
    const right = applyExplicitChemicalRewrite(second, { right: molecule([], []), atomInterface: [] })
    expect(left.ok && right.ok && left.topologyKey).not.toBe(right.ok && right.topologyKey)
  })

  it('enforces the DPO dangling condition for deleted atoms', () => {
    const result = applyExplicitChemicalRewrite(
      molecule([atom('c'), atom('h', 'H')], [bond('ch', 'c', 'h')]),
      {
        right: molecule([], []),
        atomInterface: [],
        removeHostAtomIds: ['h'],
      },
    )
    expect(result).toMatchObject({ ok: false, code: 'dangling-bond' })
  })

  it('rejects reusing an id from a deleted host entity', () => {
    const result = applyExplicitChemicalRewrite(
      molecule([atom('a'), atom('reused')], [bond('removed-bond', 'a', 'reused')]),
      {
        right: molecule([atom('reused')], []),
        atomInterface: [],
        removeHostAtomIds: ['reused'],
        removeHostBondIds: ['removed-bond'],
      },
    )
    expect(result).toMatchObject({ ok: false, code: 'id-collision' })
  })

  it('uses the production aromatic valence residue rule', () => {
    const aromaticHost = molecule(
      [atom('center'), atom('a'), atom('b'), atom('c')],
      [
        { ...bond('ca', 'center', 'a'), aromatic: true },
        { ...bond('cb', 'center', 'b'), aromatic: true },
        { ...bond('cc', 'center', 'c'), aromatic: true },
      ],
    )
    expect(applyExplicitChemicalRewrite(aromaticHost, {
      right: molecule([], []),
      atomInterface: [],
    }).ok).toBe(true)
  })
})

describe('multi-anchor fragment fusion', () => {
  it('fuses a seven-membered ring across two host bonds', () => {
    const host = molecule(
      [atom('h1'), atom('h2'), atom('h3'), atom('h4')],
      [bond('ha', 'h1', 'h2'), bond('hb', 'h3', 'h4')],
    )
    const fragmentAtoms = Array.from({ length: 7 }, (_, index) => atom(`r${index + 1}`))
    const fragmentBonds = Array.from({ length: 7 }, (_, index) =>
      bond(`rb${index + 1}`, `r${index + 1}`, `r${((index + 1) % 7) + 1}`),
    )
    const plan = planFragmentFusionAcrossBonds({
      host,
      fragment: molecule(fragmentAtoms, fragmentBonds),
      anchors: [
        { hostBondId: 'ha', fragmentBondId: 'rb1' },
        { hostBondId: 'hb', fragmentBondId: 'rb4' },
      ],
    })
    expect(plan.candidates).toHaveLength(4)
    for (const candidate of plan.candidates) {
      expect(candidate.molecule.atoms).toHaveLength(7)
      expect(candidate.molecule.bonds).toHaveLength(7)
      expect(candidate.coordinatesStale).toBe(true)
    }
  })

  it('rejects endpoint assignments that are not a one-to-one interface', () => {
    const host = molecule(
      [atom('h1'), atom('h2'), atom('h3')],
      [bond('ha', 'h1', 'h2'), bond('hb', 'h2', 'h3')],
    )
    const fragment = molecule(
      [atom('r1'), atom('r2'), atom('r3')],
      [bond('ra', 'r1', 'r2'), bond('rb', 'r1', 'r3')],
    )
    const plan = planFragmentFusionAcrossBonds({
      host,
      fragment,
      anchors: [
        { hostBondId: 'ha', fragmentBondId: 'ra' },
        { hostBondId: 'hb', fragmentBondId: 'rb' },
      ],
    })
    expect(plan.rejected.length).toBeGreaterThan(0)
    expect(plan.candidates.length).toBeLessThan(4)
  })

  it('removes terminal hydrogens required by the new fused edges', () => {
    const host = molecule(
      [atom('h1'), atom('h2'), atom('x1', 'H'), atom('x2', 'H'), atom('y1', 'H'), atom('y2', 'H')],
      [
        bond('hb', 'h1', 'h2', 2),
        bond('hx1', 'h1', 'x1'),
        bond('hx2', 'h2', 'x2'),
        bond('hy1', 'h1', 'y1'),
        bond('hy2', 'h2', 'y2'),
      ],
    )
    const fragment = molecule(
      [atom('r1'), atom('r2'), atom('r3')],
      [bond('rb', 'r1', 'r2', 2), bond('r23', 'r2', 'r3'), bond('r31', 'r3', 'r1')],
    )
    const plan = planFragmentFusionAcrossBonds({
      host,
      fragment,
      anchors: [{ hostBondId: 'hb', fragmentBondId: 'rb' }],
    })
    expect(plan.candidates.length).toBeGreaterThan(0)
    expect(plan.candidates[0].removedHostAtomIds).toEqual(['x1', 'x2'])
  })

  it('bounds endpoint orientation enumeration', () => {
    const anchors = Array.from({ length: 9 }, (_, index) => ({
      hostBondId: `h${index}`,
      fragmentBondId: `r${index}`,
    }))
    const plan = planFragmentFusionAcrossBonds({
      host: molecule([], []),
      fragment: molecule([], []),
      anchors,
    })
    expect(plan).toMatchObject({
      candidates: [],
      rejected: [{ ok: false, code: 'too-many-anchors' }],
    })
  })
})
