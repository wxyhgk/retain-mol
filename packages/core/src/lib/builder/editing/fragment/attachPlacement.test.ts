import { describe, expect, it } from 'vitest'
import { newAtom } from '../../../molecule'
import { getFragment } from '../../fragmentLibrary'
import { planAttachFragmentPlacement } from './attachPlacement'
import { add, applyQuat, dot, identityQuat, normalize, scale, sub, type Vec3 } from '../../math'

describe('planAttachFragmentPlacement', () => {
  it('rolls around the attach axis when the aligned pose clashes', () => {
    const fragment = getFragment('c-sp3')
    expect(fragment).toBeDefined()
    if (!fragment) return

    const attachOriginAtom = fragment.atoms[fragment.attachIndex]
    const attachHAtom = fragment.atoms[fragment.attachHIndex]
    const attachOrigin: Vec3 = [attachOriginAtom.x, attachOriginAtom.y, attachOriginAtom.z]
    const axis = normalize([
      attachHAtom.x - attachOriginAtom.x,
      attachHAtom.y - attachOriginAtom.y,
      attachHAtom.z - attachOriginAtom.z,
    ])
    const anchor: Vec3 = [0, 0, 0]
    const alignedRotation = identityQuat()
    let defaultClashAtom = fragment.atoms[fragment.attachIndex]
    let maxRadialDistance = -Infinity
    for (let index = 0; index < fragment.atoms.length; index++) {
      if (index === fragment.attachIndex || index === fragment.attachHIndex) continue
      const atom = fragment.atoms[index]
      const p = sub([atom.x, atom.y, atom.z], attachOrigin)
      const axial = scale(axis, dot(p, axis))
      const radial = sub(p, axial)
      const radialDistance = dot(radial, radial)
      if (radialDistance > maxRadialDistance) {
        defaultClashAtom = atom
        maxRadialDistance = radialDistance
      }
    }
    expect(maxRadialDistance).toBeGreaterThan(1e-6)

    const blockerPosition = add(
      applyQuat(sub([defaultClashAtom.x, defaultClashAtom.y, defaultClashAtom.z], attachOrigin), alignedRotation),
      anchor,
    )
    const blocker = newAtom('C', blockerPosition[0], blockerPosition[1], blockerPosition[2])

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

    const similarity = Math.abs(
      plan.rotation.reduce((sum, component, index) => sum + component * alignedRotation[index], 0),
    )
    expect(similarity).toBeLessThan(0.999)
  })
})
