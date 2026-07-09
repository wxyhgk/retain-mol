import * as THREE from 'three'
import { describe, expect, it } from 'vitest'
import { newAtom } from '../../../molecule'
import { getFragment } from '../../fragmentLibrary'
import { planAttachFragmentPlacement } from './attachPlacement'

describe('planAttachFragmentPlacement', () => {
  it('rolls around the attach axis when the aligned pose clashes', () => {
    const fragment = getFragment('c-sp3')
    expect(fragment).toBeDefined()
    if (!fragment) return

    const attachOriginAtom = fragment.atoms[fragment.attachIndex]
    const attachHAtom = fragment.atoms[fragment.attachHIndex]
    const attachOrigin = new THREE.Vector3(attachOriginAtom.x, attachOriginAtom.y, attachOriginAtom.z)
    const axis = new THREE.Vector3(
      attachHAtom.x - attachOriginAtom.x,
      attachHAtom.y - attachOriginAtom.y,
      attachHAtom.z - attachOriginAtom.z,
    ).normalize()
    const anchor = new THREE.Vector3(0, 0, 0)
    const alignedRotation = new THREE.Quaternion()
    let defaultClashAtom = fragment.atoms[fragment.attachIndex]
    let maxRadialDistance = -Infinity
    for (let index = 0; index < fragment.atoms.length; index++) {
      if (index === fragment.attachIndex || index === fragment.attachHIndex) continue
      const atom = fragment.atoms[index]
      const p = new THREE.Vector3(atom.x, atom.y, atom.z).sub(attachOrigin)
      const axial = axis.clone().multiplyScalar(p.dot(axis))
      const radialDistance = p.sub(axial).lengthSq()
      if (radialDistance > maxRadialDistance) {
        defaultClashAtom = atom
        maxRadialDistance = radialDistance
      }
    }
    expect(maxRadialDistance).toBeGreaterThan(1e-6)

    const blockerPosition = new THREE.Vector3(defaultClashAtom.x, defaultClashAtom.y, defaultClashAtom.z)
      .sub(attachOrigin)
      .applyQuaternion(alignedRotation)
      .add(anchor)
    const blocker = newAtom('C', blockerPosition.x, blockerPosition.y, blockerPosition.z)

    const plan = planAttachFragmentPlacement({
      molecule: { atoms: [blocker], bonds: [] },
      fragment,
      attachOrigin,
      alignedRotation,
      anchor,
      axis,
      skipIndex: fragment.attachHIndex,
      excludeAtomIds: new Set(),
    })

    expect(plan.rotation.angleTo(alignedRotation)).toBeGreaterThan(0.01)
  })
})
