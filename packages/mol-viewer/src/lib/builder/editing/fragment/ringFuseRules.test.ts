import { describe, expect, it } from 'vitest'
import { newAtom, newBond } from '../../../molecule'
import { getFragment } from '../../fragmentLibrary'
import { buildRingFuseSkipSet, resolveRingFuseTarget, validateRingFuseSharedValence } from './ringFuseRules'

const benzene = getFragment('benzene')!

describe('ring fuse rules', () => {
  it('resolves a valid non-hydrogen target bond', () => {
    const c1 = newAtom('C', 0, 0, 0)
    const c2 = newAtom('C', 1, 0, 0)
    const bond = newBond(c1.id, c2.id)

    const result = resolveRingFuseTarget({ atoms: [c1, c2], bonds: [bond] }, bond.id)

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.bond).toBe(bond)
    expect(result.targetAtom1).toBe(c1)
    expect(result.targetAtom2).toBe(c2)
  })

  it('rejects missing, dangling, and X-H target bonds', () => {
    const c = newAtom('C', 0, 0, 0)
    const h = newAtom('H', 1, 0, 0)
    const xhBond = newBond(c.id, h.id)
    const dangling = newBond(c.id, 'missing')

    expect(resolveRingFuseTarget({ atoms: [c], bonds: [] }, 'missing'))
      .toEqual({ ok: false, reason: '键不存在' })
    expect(resolveRingFuseTarget({ atoms: [c], bonds: [dangling] }, dangling.id))
      .toEqual({ ok: false, reason: '键不存在' })
    expect(resolveRingFuseTarget({ atoms: [c, h], bonds: [xhBond] }, xhBond.id))
      .toEqual({ ok: false, reason: '不能在 X-H 键上并环' })
  })

  it('skips the shared fragment bond atoms and their hydrogens', () => {
    const [f1i, f2i] = benzene.attachBond!
    const isH = (index: number) => benzene.atoms[index].symbol === 'H'

    const skip = buildRingFuseSkipSet(benzene, f1i, f2i, isH)

    expect(skip.has(f1i)).toBe(true)
    expect(skip.has(f2i)).toBe(true)
    const skippedHydrogens = [...skip].filter(index => isH(index))
    expect(skippedHydrogens.length).toBeGreaterThanOrEqual(2)
  })

  it('rejects shared atoms with no hydrogen and no open valence', () => {
    const center = newAtom('C', 0, 0, 0)
    const target = newAtom('C', 1, 0, 0)
    const neighbors = [
      newAtom('C', -1, 0, 0),
      newAtom('C', 0, 1, 0),
      newAtom('C', 0, -1, 0),
    ]
    const molecule = {
      atoms: [center, target, ...neighbors],
      bonds: [
        newBond(center.id, target.id),
        ...neighbors.map(atom => newBond(center.id, atom.id)),
      ],
    }

    expect(validateRingFuseSharedValence(molecule, [center, target]))
      .toBe('C 已饱和，无法并环')
  })

  it('allows shared atoms to proceed when a hydrogen can be removed', () => {
    const c1 = newAtom('C', 0, 0, 0)
    const c2 = newAtom('C', 1, 0, 0)
    const h1 = newAtom('H', -1, 0, 0)
    const h2 = newAtom('H', 2, 0, 0)
    const molecule = {
      atoms: [c1, c2, h1, h2],
      bonds: [
        newBond(c1.id, c2.id),
        newBond(c1.id, h1.id),
        newBond(c2.id, h2.id),
      ],
    }

    expect(validateRingFuseSharedValence(molecule, [c1, c2])).toBeNull()
  })
})
