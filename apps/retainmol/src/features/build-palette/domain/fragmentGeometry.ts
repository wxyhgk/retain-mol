import type { FragmentAttachmentSite } from '@retainmol/mol-viewer/fragments'

export function groupEquivalentAttachmentSites(
  sites: readonly FragmentAttachmentSite[],
): readonly FragmentAttachmentSite[] {
  const seen = new Set<string>()
  return sites.filter(site => {
    const key = `${site.equivalenceGroup}:${site.bondOrder}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export interface AttachmentSitePickerModel {
  readonly fragmentId: string
  readonly element: string
  readonly geometryId: string
  readonly name: string
  readonly pointGroup?: string
  readonly sites: readonly FragmentAttachmentSite[]
}

// Projection helpers for coordination geometry glyph

export interface ProjectedCoordinationSite {
  readonly x: number
  readonly y: number
  readonly depth: number
}

export type BondDepthStyle = 'back' | 'plane' | 'front'

type ViewRotation = readonly [xDegrees: number, yDegrees: number, zDegrees: number]

const VIEW_ROTATIONS: Readonly<Record<string, ViewRotation>> = {
  linear: [0, 0, 0],
  'trigonal-planar': [0, 0, -90],
  't-shaped': [0, 0, 0],
  'trigonal-pyramidal': [0, 0, 0],
  tetrahedral: [0, 0, 22],
  'square-planar': [0, 0, 0],
  'trigonal-bipyramidal': [58, 0, -30],
  'square-pyramidal': [55, 0, 45],
  'octahedral-d3d': [28, 38, 8],
  'trigonal-prismatic-d3h': [56, 0, 30],
  'pentagonal-bipyramidal-d5h': [60, 0, -18],
  'capped-octahedral-c3v': [24, 34, 10],
  'square-antiprismatic-d4d': [52, 18, 22],
  'dodecahedral-d2d': [28, 34, 12],
  'tricapped-trigonal-prismatic-d3h': [54, 12, 30],
  'capped-square-antiprismatic-c4v': [56, 18, 22],
  'pentagonal-prismatic-d5h': [54, 14, 18],
}

export function projectCoordinationDirections(
  directions: readonly (readonly [number, number, number])[],
  geometryId = 'default',
): readonly ProjectedCoordinationSite[] {
  const [rotationX, rotationY, rotationZ] = (VIEW_ROTATIONS[geometryId] ?? [28, 38, 8])
    .map(degrees => degrees * Math.PI / 180) as [number, number, number]
  const cosX = Math.cos(rotationX)
  const sinX = Math.sin(rotationX)
  const cosY = Math.cos(rotationY)
  const sinY = Math.sin(rotationY)
  const cosZ = Math.cos(rotationZ)
  const sinZ = Math.sin(rotationZ)

  return directions
    .map(([x, y, z]) => {
      const pitchY = y * cosX - z * sinX
      const pitchZ = y * sinX + z * cosX
      const yawX = x * cosY + pitchZ * sinY
      const depth = -x * sinY + pitchZ * cosY
      const rotatedX = yawX * cosZ - pitchY * sinZ
      const rotatedY = yawX * sinZ + pitchY * cosZ
      const perspective = 1 + depth * 0.13

      return {
        x: 26 + rotatedX * 14.5 * perspective,
        y: 18 - rotatedY * 13.2 * perspective,
        depth,
      }
    })
    .sort((left, right) => left.depth - right.depth)
}

export function bondDepthStyle(depth: number): BondDepthStyle {
  if (depth < -0.18) return 'back'
  if (depth > 0.18) return 'front'
  return 'plane'
}
