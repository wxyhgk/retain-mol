import { getElementConfig } from '../../../../config/elements.config'
import { RENDER } from '../../../../config/render.config'
import type { GrowGuideSpec } from '../../../presentation/types'
import type { Vector3Data } from '../../../model/types'
import type { Molecule } from '../../../molecule'
import { resolveHSlotGrowth } from '../../editing/atomOps'
import { ringPlaneIntersection } from '../../geometry/plane'
import { calcGrowPosition, getGrowGuide as calcGrowGuide } from '../../geometry/vsepr'
import { isSlotH } from '../../queries'

export interface GrowPreviewCommandInput {
  readonly sourceId: string
  readonly cursorLocal: { readonly x: number; readonly y: number; readonly z: number }
  readonly activeElement: string
  readonly freeDirection: boolean
}

export interface GrowPreviewResult {
  readonly pos: Vector3Data
  readonly radius: number
  readonly color: number
}

export function getGrowPreviewCommand(
  molecule: Molecule,
  input: GrowPreviewCommandInput,
): GrowPreviewResult | null {
  const center = molecule.atoms.find(atom => atom.id === input.sourceId)
  if (!center) return null
  const cfg = getElementConfig(input.activeElement)

  if (isSlotH(molecule, input.sourceId)) {
    if (input.activeElement === 'H') return null
    const position = resolveHSlotGrowth(molecule, input.sourceId, input.activeElement)
    if (!position) return null
    return {
      pos: { x: position.x, y: position.y, z: position.z },
      radius: cfg.covalentRadius * RENDER.growGhostRadiusFactor,
      color: cfg.color,
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
    radius: cfg.covalentRadius * RENDER.growGhostRadiusFactor,
    color: cfg.color,
  }
}

export interface GrowGuideCommandInput {
  readonly sourceId: string
  readonly activeElement: string
  readonly sketchPlane?: {
    readonly origin: readonly [number, number, number]
    readonly normal: readonly [number, number, number]
  } | null
}

export function getGrowGuideCommand(
  molecule: Molecule,
  input: GrowGuideCommandInput,
): GrowGuideSpec {
  const center = molecule.atoms.find(atom => atom.id === input.sourceId)
  if (!center) return null
  if (isSlotH(molecule, input.sourceId)) return null

  const guide = calcGrowGuide(center, molecule.bonds, molecule.atoms, input.activeElement)
  if (guide.kind === 'free') return null

  const cfg = getElementConfig(input.activeElement)
  const ghostRadius = cfg.covalentRadius * RENDER.growGhostRadiusFactor
  const ghostColor = cfg.color

  if (input.sketchPlane && guide.kind === 'ring') {
    const points = ringPlaneIntersection(guide.center, guide.axis, guide.radius, {
      origin: [...input.sketchPlane.origin],
      normal: [...input.sketchPlane.normal],
    })
    if (points.length > 0) {
      return {
        kind: 'points',
        positions: points.map(point => ({ x: point[0], y: point[1], z: point[2] })),
        ghostRadius,
        ghostColor,
      }
    }
  }

  if (guide.kind === 'ring') {
    return {
      kind: 'ring',
      center: { x: guide.center[0], y: guide.center[1], z: guide.center[2] },
      axis: { x: guide.axis[0], y: guide.axis[1], z: guide.axis[2] },
      radius: guide.radius,
      ghostRadius,
      ghostColor,
    }
  }

  return {
    kind: 'points',
    positions: guide.positions.map(position => ({ x: position[0], y: position[1], z: position[2] })),
    ghostRadius,
    ghostColor,
  }
}
