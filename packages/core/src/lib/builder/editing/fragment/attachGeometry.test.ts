import { describe, expect, it } from 'vitest'
import { lookupBondLengthByOrder } from '../../../../config/geometry.config'
import { newAtom } from '../../../molecule'
import { getFragment } from '../../fragmentLibrary'
import { buildAttachFragmentGeometry } from './attachGeometry'
import { applyQuat, normalize } from '../../math'

describe('buildAttachFragmentGeometry', () => {
  it('aligns the fragment attach direction against the host growth direction', () => {
    const fragment = getFragment('c-sp3')
    expect(fragment).toBeDefined()
    if (!fragment) return

    const host = newAtom('C', 0, 0, 0)
    const direction: [number, number, number] = [1, 0, 0]
    const geometry = buildAttachFragmentGeometry({ fragment, host, direction, order: 1 })
    const attachAtom = fragment.atoms[fragment.attachIndex]
    const attachHydrogen = fragment.atoms[fragment.attachHIndex]
    const attachDirection = normalize([
      attachHydrogen.x - attachAtom.x,
      attachHydrogen.y - attachAtom.y,
      attachHydrogen.z - attachAtom.z,
    ])

    const alignedDirection = applyQuat(attachDirection, geometry.alignedRotation)

    expect(alignedDirection[0]).toBeCloseTo(-1)
    expect(alignedDirection[1]).toBeCloseTo(0)
    expect(alignedDirection[2]).toBeCloseTo(0)
  })

  it('places the fragment anchor at the configured bond length for the attach order', () => {
    const fragment = getFragment('c-sp2')
    expect(fragment).toBeDefined()
    if (!fragment) return

    const host = newAtom('C', 1, 2, 3)
    const direction: [number, number, number] = [0, 1, 0]
    const geometry = buildAttachFragmentGeometry({ fragment, host, direction, order: 2 })
    const expectedBondLength = lookupBondLengthByOrder('C', 'C', 2)

    expect(expectedBondLength).toBeDefined()
    expect(geometry.anchor[0]).toBeCloseTo(1)
    expect(geometry.anchor[1]).toBeCloseTo(2 + expectedBondLength!)
    expect(geometry.anchor[2]).toBeCloseTo(3)
  })
})
