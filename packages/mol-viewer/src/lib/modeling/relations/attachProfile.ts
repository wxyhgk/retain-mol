import { sha256Hex } from '../effects/sha256'
import {
  computeFragmentCanonicalBytesSha256,
  computeFragmentDigest,
  serializeCanonicalFragment,
} from '../../builder/fragment/identity'
import type { FragmentDef } from '../../builder/fragment/model'
import { validateFragmentDef } from '../../builder/kernel/FragmentValidator'

const PROFILE_DIGEST_PREFIX = 'fragment-attach-profile-v1-sha256-'
const COORDINATE_SCALE = 1000

type Vec3 = readonly [number, number, number]

export interface FragmentAttachProfileSelection {
  readonly profileId: string
  readonly rigidFrameAxisAtomIndex: number
  readonly guestRadialAtomIndex: number
  readonly handednessAtomIndex: number
}

export interface FragmentAttachProfileV1 {
  readonly schemaVersion: 1
  readonly profileId: string
  readonly fragmentId: string
  readonly fragmentDigest: string
  readonly fragmentCanonicalBytesSha256: string
  readonly attachAtomIndex: number
  readonly authoredAttachHydrogenIndex: number
  readonly rigidFrameAxisAtomIndex: number
  readonly guestRadialAtomIndex: number
  readonly handednessAtomIndex: number
  readonly linkBondOrder: 1
  readonly torsionZero: 'projected-radials-aligned'
  readonly torsionPositiveAxis: 'host-to-guest'
}

export interface FrozenFragmentAttachProfileV1 {
  readonly fragmentCanonicalJson: string
  readonly profileCanonicalJson: string
  readonly profileSha256: string
  readonly profile: FragmentAttachProfileV1
}

function point(fragment: FragmentDef, index: number): Vec3 {
  const atom = fragment.atoms[index]!
  return [
    quantizeCoordinate(atom.x, `${index}.x`),
    quantizeCoordinate(atom.y, `${index}.y`),
    quantizeCoordinate(atom.z, `${index}.z`),
  ]
}

function quantizeCoordinate(value: number, field: string): number {
  const units = Math.round(value * COORDINATE_SCALE)
  if (!Number.isSafeInteger(units)) {
    throw new TypeError(`${field} cannot be represented at the fixed coordinate scale`)
  }
  return units
}

function subtract(left: Vec3, right: Vec3): Vec3 {
  return [left[0] - right[0], left[1] - right[1], left[2] - right[2]]
}

function dot(left: Vec3, right: Vec3): number {
  return left[0] * right[0] + left[1] * right[1] + left[2] * right[2]
}

function cross(left: Vec3, right: Vec3): Vec3 {
  return [
    left[1] * right[2] - left[2] * right[1],
    left[2] * right[0] - left[0] * right[2],
    left[0] * right[1] - left[1] * right[0],
  ]
}

function squaredNorm(vector: Vec3): number {
  return dot(vector, vector)
}

function requireIndex(fragment: FragmentDef, index: number, field: string): void {
  if (!Number.isInteger(index) || index < 0 || index >= fragment.atoms.length) {
    throw new TypeError(`${field} must identify one fragment atom`)
  }
}

function retainedComponent(fragment: FragmentDef): Set<number> {
  const removedIndex = fragment.attachHIndex
  const adjacency = new Map<number, number[]>()
  for (let index = 0; index < fragment.atoms.length; index += 1) {
    if (index !== removedIndex) adjacency.set(index, [])
  }
  for (const bond of fragment.bonds) {
    if (bond.a === removedIndex || bond.b === removedIndex) continue
    adjacency.get(bond.a)?.push(bond.b)
    adjacency.get(bond.b)?.push(bond.a)
  }
  const visited = new Set<number>()
  const queue = [fragment.attachIndex]
  while (queue.length > 0) {
    const index = queue.shift()!
    if (visited.has(index) || !adjacency.has(index)) continue
    visited.add(index)
    queue.push(...adjacency.get(index)!)
  }
  return visited
}

function assertProfileGeometry(
  fragment: FragmentDef,
  selection: FragmentAttachProfileSelection,
): void {
  const indices = [
    fragment.attachIndex,
    fragment.attachHIndex,
    selection.rigidFrameAxisAtomIndex,
    selection.guestRadialAtomIndex,
    selection.handednessAtomIndex,
  ]
  const fields = [
    'attachAtomIndex',
    'authoredAttachHydrogenIndex',
    'rigidFrameAxisAtomIndex',
    'guestRadialAtomIndex',
    'handednessAtomIndex',
  ]
  indices.forEach((index, offset) => requireIndex(fragment, index, fields[offset]!))
  if (new Set(indices).size !== indices.length) {
    throw new TypeError('Fragment attach profile atoms must be pairwise distinct')
  }
  if (fragment.atoms[fragment.attachHIndex]?.symbol !== 'H') {
    throw new TypeError('authoredAttachHydrogenIndex must identify hydrogen')
  }
  const authoredHydrogenBonds = fragment.bonds.filter(bond => (
    bond.a === fragment.attachHIndex || bond.b === fragment.attachHIndex
  ))
  if (
    authoredHydrogenBonds.length !== 1
    || authoredHydrogenBonds[0]?.order !== 1
    || !(
      (authoredHydrogenBonds[0].a === fragment.attachIndex
        && authoredHydrogenBonds[0].b === fragment.attachHIndex)
      || (authoredHydrogenBonds[0].b === fragment.attachIndex
        && authoredHydrogenBonds[0].a === fragment.attachHIndex)
    )
  ) {
    throw new TypeError('Authored attach hydrogen must have one single bond to the attach atom')
  }

  const retained = retainedComponent(fragment)
  for (const [field, index] of [
    ['rigidFrameAxisAtomIndex', selection.rigidFrameAxisAtomIndex],
    ['guestRadialAtomIndex', selection.guestRadialAtomIndex],
    ['handednessAtomIndex', selection.handednessAtomIndex],
  ] as const) {
    if (!retained.has(index)) {
      throw new TypeError(`${field} must remain connected to the attach atom after hydrogen removal`)
    }
  }

  const origin = point(fragment, fragment.attachIndex)
  const attachAxis = subtract(point(fragment, fragment.attachHIndex), origin)
  const frameAxis = subtract(point(fragment, selection.rigidFrameAxisAtomIndex), origin)
  const radial = subtract(point(fragment, selection.guestRadialAtomIndex), origin)
  const handedness = subtract(point(fragment, selection.handednessAtomIndex), origin)
  if (squaredNorm(attachAxis) === 0 || squaredNorm(frameAxis) === 0) {
    throw new TypeError('Fragment attach profile contains a degenerate axis')
  }
  const frameNormal = cross(frameAxis, radial)
  if (squaredNorm(frameNormal) === 0) {
    throw new TypeError('Fragment attach profile contains a degenerate radial frame')
  }
  if (dot(handedness, frameNormal) === 0) {
    throw new TypeError('Fragment attach profile requires a proper rigid handedness witness')
  }
}

export function serializeCanonicalFragmentAttachProfile(
  profile: FragmentAttachProfileV1,
): string {
  return JSON.stringify({
    schemaVersion: profile.schemaVersion,
    profileId: profile.profileId,
    fragmentId: profile.fragmentId,
    fragmentDigest: profile.fragmentDigest,
    fragmentCanonicalBytesSha256: profile.fragmentCanonicalBytesSha256,
    attachAtomIndex: profile.attachAtomIndex,
    authoredAttachHydrogenIndex: profile.authoredAttachHydrogenIndex,
    rigidFrameAxisAtomIndex: profile.rigidFrameAxisAtomIndex,
    guestRadialAtomIndex: profile.guestRadialAtomIndex,
    handednessAtomIndex: profile.handednessAtomIndex,
    linkBondOrder: profile.linkBondOrder,
    torsionZero: profile.torsionZero,
    torsionPositiveAxis: profile.torsionPositiveAxis,
  })
}

export function freezeFragmentAttachProfile(
  fragment: FragmentDef,
  selection: FragmentAttachProfileSelection,
): FrozenFragmentAttachProfileV1 {
  const issues = validateFragmentDef(fragment)
  if (issues.length > 0) throw new TypeError(issues.map(issue => issue.message).join('; '))
  if (!selection.profileId) throw new TypeError('profileId must not be empty')
  assertProfileGeometry(fragment, selection)

  const fragmentCanonicalJson = serializeCanonicalFragment(fragment)
  const profile: FragmentAttachProfileV1 = {
    schemaVersion: 1,
    profileId: selection.profileId,
    fragmentId: fragment.id,
    fragmentDigest: computeFragmentDigest(fragment),
    fragmentCanonicalBytesSha256: computeFragmentCanonicalBytesSha256(fragment),
    attachAtomIndex: fragment.attachIndex,
    authoredAttachHydrogenIndex: fragment.attachHIndex,
    rigidFrameAxisAtomIndex: selection.rigidFrameAxisAtomIndex,
    guestRadialAtomIndex: selection.guestRadialAtomIndex,
    handednessAtomIndex: selection.handednessAtomIndex,
    linkBondOrder: 1,
    torsionZero: 'projected-radials-aligned',
    torsionPositiveAxis: 'host-to-guest',
  }
  const profileCanonicalJson = serializeCanonicalFragmentAttachProfile(profile)
  return {
    fragmentCanonicalJson,
    profileCanonicalJson,
    profileSha256: `${PROFILE_DIGEST_PREFIX}${sha256Hex(profileCanonicalJson)}`,
    profile,
  }
}

export function isFragmentAttachProfileSha256(value: string): boolean {
  return /^fragment-attach-profile-v1-sha256-[0-9a-f]{64}$/.test(value)
}
