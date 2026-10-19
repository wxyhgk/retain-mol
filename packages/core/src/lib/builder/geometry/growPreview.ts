import type { Molecule, Vector3Data } from '../../model/types'
import { resolveHSlotGrowth } from '../editing/atomOps'
import { ringPlaneIntersection } from './plane'
import { calcGrowPosition, getGrowGuide as calcGrowGuide } from './vsepr'
import { isSlotH } from '../queries'

export interface GrowPreviewGeometryInput {
  readonly sourceId: string
  readonly cursorLocal: { readonly x: number; readonly y: number; readonly z: number }
  readonly activeElement: string
  readonly freeDirection: boolean
}

export interface GrowPreviewGeometry {
  readonly pos: Vector3Data
  readonly symbol: string
}

export function getGrowPreviewGeometry(
  molecule: Molecule,
  input: GrowPreviewGeometryInput,
): GrowPreviewGeometry | null {
  const center = molecule.atoms.find(atom => atom.id === input.sourceId)
  if (!center) return null

  if (isSlotH(molecule, input.sourceId)) {
    if (input.activeElement === 'H') return null
    const position = resolveHSlotGrowth(molecule, input.sourceId, input.activeElement)
    if (!position) return null
    return {
      pos: { x: position.x, y: position.y, z: position.z },
      symbol: input.activeElement,
    }
  }

  const position = calcGrowPosition(
    center,
    molecule.bonds,
    molecule.atoms,
    input.activeElement,
    [input.cursorLocal.x, input.cursorLocal.y, input.cursorLocal.z],
    !input.freeDirection,
  )
  return {
    pos: { x: position[0], y: position[1], z: position[2] },
    symbol: input.activeElement,
  }
}

/** Spatial guide geometry. Ring radius is a chemical placement distance, not line thickness. */
export type GrowGuideGeometry =
  | { kind: 'ring'; center: Vector3Data; axis: Vector3Data; radius: number }
  | { kind: 'points'; positions: readonly Vector3Data[] }
  | null

export interface GrowGuideGeometryInput {
  readonly sourceId: string
  readonly activeElement: string
  readonly sketchPlane?: {
    readonly origin: readonly [number, number, number]
    readonly normal: readonly [number, number, number]
  } | null
}

export function getGrowGuideGeometry(
  molecule: Molecule,
  input: GrowGuideGeometryInput,
): GrowGuideGeometry {
  const center = molecule.atoms.find(atom => atom.id === input.sourceId)
  if (!center) return null
  if (isSlotH(molecule, input.sourceId)) return null

  const guide = calcGrowGuide(center, molecule.bonds, molecule.atoms, input.activeElement)
  if (guide.kind === 'free') return null

  if (input.sketchPlane && guide.kind === 'ring') {
    const points = ringPlaneIntersection(guide.center, guide.axis, guide.radius, {
      origin: [...input.sketchPlane.origin],
      normal: [...input.sketchPlane.normal],
    })
    if (points.length > 0) {
      return {
        kind: 'points',
        positions: points.map(point => ({ x: point[0], y: point[1], z: point[2] })),
      }
    }
  }

  if (guide.kind === 'ring') {
    return {
      kind: 'ring',
      center: { x: guide.center[0], y: guide.center[1], z: guide.center[2] },
      axis: { x: guide.axis[0], y: guide.axis[1], z: guide.axis[2] },
      radius: guide.radius,
    }
  }

  return {
    kind: 'points',
    positions: guide.positions.map(position => ({ x: position[0], y: position[1], z: position[2] })),
  }
}
