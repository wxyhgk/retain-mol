import { describe, expect, it } from 'vitest'
import { newAtom } from '../../../molecule'
import { getFragment } from '../../fragmentLibrary'
import { placementOffsetCandidates } from '../../geometry/placementPlanner'
import { PlacementCommandSession, runPlacementCommand } from './placementCommands'

describe('interaction placement commands', () => {
  it('places a bare atom when no fragment is active', () => {
    const result = runPlacementCommand({ atoms: [], bonds: [] }, {
      activeElement: 'N',
      position: { x: 1, y: 2, z: 3 },
    })

    expect(result.ok).toBe(true)
    if (!result.ok || !result.changed) return
    expect(result.molecule.atoms).toHaveLength(1)
    expect(result.molecule.atoms[0]).toMatchObject({ symbol: 'N', x: 1, y: 2, z: 3 })
  })

  it('places standalone and hybrid fragment prototypes', () => {
    const benzene = getFragment('benzene')!
    const sp2 = getFragment('c-sp2')!
    const standalone = runPlacementCommand({ atoms: [], bonds: [] }, {
      activeElement: 'C', position: { x: 0, y: 0, z: 0 }, fragment: benzene,
    })
    const hybrid = runPlacementCommand({ atoms: [], bonds: [] }, {
      activeElement: 'C', position: { x: 0, y: 0, z: 0 }, fragment: sp2, hybridPartner: sp2,
    })

    expect(standalone.ok && standalone.changed && standalone.molecule.atoms).toHaveLength(benzene.atoms.length)
    expect(hybrid.ok && hybrid.changed && hybrid.molecule.atoms.filter(atom => atom.symbol === 'C')).toHaveLength(2)
  })

  it('nudges placement away from an existing atom', () => {
    const existing = newAtom('C', 0, 0, 0)
    const result = runPlacementCommand({ atoms: [existing], bonds: [] }, {
      activeElement: 'C',
      position: { x: 0, y: 0, z: 0 },
      orientation: { x: 0, y: 0, z: 1 },
    })

    expect(result.ok).toBe(true)
    if (!result.ok || !result.changed) return
    expect(result.message).toBe('已自动避开碰撞')
  })

  it('rejects placement when every fallback is blocked', () => {
    const blockers = [
      newAtom('C', 0, 0, 0),
      ...placementOffsetCandidates({ x: 0, y: 0, z: 1 })
        .map(offset => newAtom('C', offset.x, offset.y, offset.z)),
    ]

    expect(runPlacementCommand({ atoms: blockers, bonds: [] }, {
      activeElement: 'C',
      position: { x: 0, y: 0, z: 0 },
      orientation: { x: 0, y: 0, z: 1 },
    })).toEqual({ ok: false, reason: '放置位置空间不足，请在更远处重试' })
  })

  it('resolves and commits through one placement session', () => {
    const session = new PlacementCommandSession()
    const input = session.resolve({
      activeElement: 'C',
      activeFragmentId: null,
      position: { x: 0, y: 0, z: 0 },
      viewDirection: { x: 0, y: 0, z: 1 },
    })
    const result = session.commit({ atoms: [], bonds: [] }, input)

    expect(result.ok && result.changed && result.molecule.atoms).toHaveLength(1)
  })
})
