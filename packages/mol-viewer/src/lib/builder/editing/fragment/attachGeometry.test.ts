import * as THREE from 'three'
import { describe, expect, it } from 'vitest'
import { lookupBondLengthByOrder } from '../../../../config/geometry.config'
import { newAtom } from '../../../molecule'
import { getFragment } from '../../fragmentLibrary'
import { buildAttachFragmentGeometry } from './attachGeometry'

describe('buildAttachFragmentGeometry', () => {
  it('aligns the fragment attach direction against the host growth direction', () => {
    const fragment = getFragment('c-sp3')
    expect(fragment).toBeDefined()
    if (!fragment) return

    const host = newAtom('C', 0, 0, 0)
    const direction = new THREE.Vector3(1, 0, 0)
    const geometry = buildAttachFragmentGeometry({ fragment, host, direction, order: 1 })
    const attachAtom = fragment.atoms[fragment.attachIndex]
    const attachHydrogen = fragment.atoms[fragment.attachHIndex]
    const attachDirection = new THREE.Vector3(
      attachHydrogen.x - attachAtom.x,
      attachHydrogen.y - attachAtom.y,
      attachHydrogen.z - attachAtom.z,
    ).normalize()

    attachDirection.applyQuaternion(geometry.alignedRotation)

    expect(attachDirection.x).toBeCloseTo(-1)
    expect(attachDirection.y).toBeCloseTo(0)
    expect(attachDirection.z).toBeCloseTo(0)
  })

  it('places the fragment anchor at the configured bond length for the attach order', () => {
    const fragment = getFragment('c-sp2')
    expect(fragment).toBeDefined()
    if (!fragment) return

    const host = newAtom('C', 1, 2, 3)
    const direction = new THREE.Vector3(0, 1, 0)
    const geometry = buildAttachFragmentGeometry({ fragment, host, direction, order: 2 })
    const expectedBondLength = lookupBondLengthByOrder('C', 'C', 2)

    expect(expectedBondLength).toBeDefined()
    expect(geometry.anchor.x).toBeCloseTo(1)
    expect(geometry.anchor.y).toBeCloseTo(2 + expectedBondLength!)
    expect(geometry.anchor.z).toBeCloseTo(3)
  })
})
