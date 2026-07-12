import type { FragmentDef } from '../../fragmentLibrary'
import { getFragment } from '../../fragmentLibrary'

export interface PlacementCommandInput {
  readonly activeElement: string
  readonly position: { readonly x: number; readonly y: number; readonly z: number }
  readonly orientation?: { readonly x: number; readonly y: number; readonly z: number }
  readonly fragment?: FragmentDef
  readonly hybridPartner?: FragmentDef
  readonly avoidClashes?: boolean
}

export interface ResolvePlacementCommandInput {
  readonly activeElement: string
  readonly activeFragmentId: string | null
  readonly position: { readonly x: number; readonly y: number; readonly z: number }
  readonly sketchPlane?: {
    readonly normal: readonly [number, number, number]
  } | null
  readonly viewDirection?: { readonly x: number; readonly y: number; readonly z: number }
}

export function resolvePlacementCommandInput(
  input: ResolvePlacementCommandInput,
): PlacementCommandInput {
  const fragment = input.activeFragmentId ? getFragment(input.activeFragmentId) : undefined
  return {
    activeElement: input.activeElement,
    position: input.position,
    orientation: resolvePlacementOrientation(input),
    fragment,
    hybridPartner: resolveHybridPlacementPartner(fragment),
    avoidClashes: true,
  }
}

export function resolvePlacementOrientation(
  input: Pick<ResolvePlacementCommandInput, 'sketchPlane' | 'viewDirection'>,
): PlacementCommandInput['orientation'] {
  return input.sketchPlane
    ? {
        x: input.sketchPlane.normal[0],
        y: input.sketchPlane.normal[1],
        z: input.sketchPlane.normal[2],
      }
    : input.viewDirection
}

export function resolveHybridPlacementPartner(fragment: FragmentDef | undefined): FragmentDef | undefined {
  const order = fragment?.attachOrder ?? 1
  if (!fragment || order <= 1) return undefined
  return getFragment(order === 3 ? 'c-sp' : 'c-sp2')
}
