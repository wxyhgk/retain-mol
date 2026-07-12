import { describe, expect, it } from 'vitest'
import { getFragment } from '../../fragmentLibrary'
import {
  resolveHybridPlacementPartner,
  resolvePlacementCommandInput,
  resolvePlacementOrientation,
} from './placementCommandResolver'

describe('placement command resolver', () => {
  it('resolves UI placement state into a bare atom placement command', () => {
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
      avoidClashes: true,
    })
    expect(input.fragment).toBeUndefined()
    expect(input.hybridPartner).toBeUndefined()
  })

  it('prefers the sketch plane normal over view direction', () => {
    expect(resolvePlacementOrientation({
      sketchPlane: { normal: [0, 1, 0] },
      viewDirection: { x: 0, y: 0, z: 1 },
    })).toEqual({ x: 0, y: 1, z: 0 })
  })

  it('resolves hybrid partners only for multi-bond fragments', () => {
    const sp3 = getFragment('c-sp3')
    const sp2 = getFragment('c-sp2')
    const sp = getFragment('c-sp')

    expect(resolveHybridPlacementPartner(sp3)).toBeUndefined()
    expect(resolveHybridPlacementPartner(sp2)?.id).toBe('c-sp2')
    expect(resolveHybridPlacementPartner(sp)?.id).toBe('c-sp')
  })
})
