import { describe, expect, it } from 'vitest'
import { newAtom, newBond } from '../../molecule'
import { getFragment } from '../fragmentLibrary'
import {
  PlacementCommandSession,
  runAttachFragmentToAtomCommand,
  runFuseFragmentOnBondCommand,
  resolvePlacementCommandInput,
  runPlacementCommand,
  runPlacementPreviewCommand,
} from './fragmentCommands'

describe('fragment commands', () => {
  it('attaches a fragment to an atom', () => {
    const c = newAtom('C', 0, 0, 0)
    const benzene = getFragment('benzene')
    expect(benzene).toBeDefined()
    if (!benzene) return

    const result = runAttachFragmentToAtomCommand({ atoms: [c], bonds: [] }, {
      atomId: c.id,
      fragment: benzene,
    })

    expect(result.ok).toBe(true)
    if (!result.ok || !result.changed) return
    expect(result.molecule.atoms.length).toBeGreaterThan(1)
    expect(result.molecule.bonds.length).toBeGreaterThan(0)
  })

  it('fuses a ring fragment onto a bond', () => {
    const c1 = newAtom('C', 0, 0, 0)
    const c2 = newAtom('C', 1.4, 0, 0)
    const bond = newBond(c1.id, c2.id)
    const benzene = getFragment('benzene')
    expect(benzene).toBeDefined()
    if (!benzene) return

    const result = runFuseFragmentOnBondCommand({ atoms: [c1, c2], bonds: [bond] }, {
      bondId: bond.id,
      fragment: benzene,
    })

    expect(result.ok).toBe(true)
    if (!result.ok || !result.changed) return
    expect(result.molecule.atoms.length).toBeGreaterThan(2)
  })
})

describe('runPlacementCommand', () => {
  it('places a single bare atom when no fragment is active', () => {
    const result = runPlacementCommand({ atoms: [], bonds: [] }, {
      activeElement: 'N',
      position: { x: 1, y: 2, z: 3 },
    })

    expect(result.ok).toBe(true)
    if (!result.ok || !result.changed) return
    expect(result.molecule.atoms).toHaveLength(1)
    expect(result.molecule.atoms[0]).toMatchObject({ symbol: 'N', x: 1, y: 2, z: 3 })
    expect(result.molecule.bonds).toHaveLength(0)
  })

  it('places a standalone ring fragment', () => {
    const benzene = getFragment('benzene')
    expect(benzene).toBeDefined()
    if (!benzene) return

    const result = runPlacementCommand({ atoms: [], bonds: [] }, {
      activeElement: 'C',
      position: { x: 0, y: 0, z: 0 },
      fragment: benzene,
    })

    expect(result.ok).toBe(true)
    if (!result.ok || !result.changed) return
    expect(result.molecule.atoms).toHaveLength(benzene.atoms.length)
    expect(result.molecule.bonds).toHaveLength(benzene.bonds.length)
  })

  it('places a hybrid prototype for multi-bond fragments', () => {
    const vinyl = getFragment('c-sp2')
    const partner = getFragment('c-sp2')
    expect(vinyl).toBeDefined()
    expect(partner).toBeDefined()
    if (!vinyl || !partner) return

    const result = runPlacementCommand({ atoms: [], bonds: [] }, {
      activeElement: 'C',
      position: { x: 0, y: 0, z: 0 },
      fragment: vinyl,
      hybridPartner: partner,
    })

    expect(result.ok).toBe(true)
    if (!result.ok || !result.changed) return
    expect(result.molecule.atoms.filter(atom => atom.symbol === 'C')).toHaveLength(2)
    expect(result.molecule.bonds.some(candidate => candidate.order === 2)).toBe(true)
  })

  it('nudges background placement away from existing atoms', () => {
    const existing = newAtom('C', 0, 0, 0)
    const result = runPlacementCommand({ atoms: [existing], bonds: [] }, {
      activeElement: 'C',
      position: { x: 0, y: 0, z: 0 },
      orientation: { x: 0, y: 0, z: 1 },
    })

    expect(result.ok).toBe(true)
    if (!result.ok || !result.changed) return
    expect(result.molecule.atoms).toHaveLength(2)
    const placed = result.molecule.atoms.find(atom => atom.id !== existing.id)
    expect(placed).toBeDefined()
    if (!placed) return
    expect(Math.hypot(placed.x - existing.x, placed.y - existing.y, placed.z - existing.z))
      .toBeGreaterThan(0.5)
  })
})

describe('placement preview/session', () => {
  it('previews only the placement molecule without mutating the base molecule', () => {
    const existing = newAtom('N', 4, 0, 0)
    const preview = runPlacementPreviewCommand({ atoms: [existing], bonds: [] }, {
      activeElement: 'O',
      position: { x: 1, y: 2, z: 3 },
      avoidClashes: false,
    })

    expect(preview.ok).toBe(true)
    if (!preview.ok) return
    expect(preview.preview.atoms).toHaveLength(1)
    expect(preview.preview.atoms[0]).toMatchObject({ symbol: 'O', x: 1, y: 2, z: 3 })
    expect(preview.preview.atoms[0].id).not.toBe(existing.id)
  })

  it('uses a session to resolve, preview, and commit placement', () => {
    const session = new PlacementCommandSession()
    const input = session.resolve({
      activeElement: 'C',
      activeFragmentId: null,
      position: { x: 0, y: 0, z: 0 },
      viewDirection: { x: 0, y: 0, z: 1 },
    })
    const base = { atoms: [], bonds: [] }

    const preview = session.preview(base, input)
    const committed = session.commit(base, input)

    expect(preview.ok).toBe(true)
    expect(committed.ok).toBe(true)
    if (!preview.ok || !committed.ok || !committed.changed) return
    expect(preview.preview.atoms).toHaveLength(1)
    expect(committed.molecule.atoms).toHaveLength(1)
  })
})

describe('resolvePlacementCommandInput', () => {
  it('resolves a bare atom placement when no fragment is active', () => {
    const input = resolvePlacementCommandInput({
      activeElement: 'O',
      activeFragmentId: null,
      position: { x: 1, y: 2, z: 3 },
      viewDirection: { x: 0, y: 0, z: 1 },
    })

    expect(input).toMatchObject({
      activeElement: 'O',
      position: { x: 1, y: 2, z: 3 },
      orientation: { x: 0, y: 0, z: 1 },
    })
    expect(input.fragment).toBeUndefined()
    expect(input.hybridPartner).toBeUndefined()
  })

  it('uses sketch plane normal as placement orientation', () => {
    const input = resolvePlacementCommandInput({
      activeElement: 'C',
      activeFragmentId: 'benzene',
      position: { x: 0, y: 0, z: 0 },
      sketchPlane: { normal: [0, 1, 0] },
      viewDirection: { x: 0, y: 0, z: 1 },
    })

    expect(input.fragment?.id).toBe('benzene')
    expect(input.orientation).toEqual({ x: 0, y: 1, z: 0 })
    expect(input.hybridPartner).toBeUndefined()
  })

  it('resolves a hybrid partner for multi-bond fragment placement', () => {
    const sp2 = resolvePlacementCommandInput({
      activeElement: 'C',
      activeFragmentId: 'c-sp2',
      position: { x: 0, y: 0, z: 0 },
    })
    const sp = resolvePlacementCommandInput({
      activeElement: 'C',
      activeFragmentId: 'c-sp',
      position: { x: 0, y: 0, z: 0 },
    })

    expect(sp2.fragment?.attachOrder).toBe(2)
    expect(sp2.hybridPartner?.id).toBe('c-sp2')
    expect(sp.fragment?.attachOrder).toBe(3)
    expect(sp.hybridPartner?.id).toBe('c-sp')
  })
})
