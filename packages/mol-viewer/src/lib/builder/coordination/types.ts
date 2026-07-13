import type { FragmentDef } from '../fragment/model'
import type { CoordinationSite } from '../../types'

export type CoordinationGeometryId =
  | 'linear'
  | 'trigonal-planar'
  | 't-shaped'
  | 'trigonal-pyramidal'
  | 'tetrahedral'
  | 'square-planar'
  | 'trigonal-bipyramidal'
  | 'square-pyramidal'
  | 'octahedral-d3d'
  | 'trigonal-prismatic-d3h'
  | 'pentagonal-bipyramidal-d5h'
  | 'capped-octahedral-c3v'
  | 'square-antiprismatic-d4d'
  | 'dodecahedral-d2d'
  | 'tricapped-trigonal-prismatic-d3h'
  | 'capped-square-antiprismatic-c4v'
  | 'pentagonal-prismatic-d5h'

export interface CoordinationGeometryTemplate {
  readonly id: CoordinationGeometryId
  readonly name: string
  readonly short: string
  readonly coordinationNumber: number
  readonly pointGroup?: string
  readonly directions: readonly (readonly [number, number, number])[]
  readonly sites: readonly CoordinationSite[]
}

export type CoordinationSiteOverride = Partial<Pick<CoordinationSite,
  'label' | 'bondOrder' | 'equivalenceGroup' | 'direction'
>>

export interface TransitionMetalCoordinationSpec {
  readonly geometryId: CoordinationGeometryId
  readonly name?: string
  readonly short?: string
  readonly pointGroup?: string
  readonly directions?: readonly (readonly [number, number, number])[]
  readonly siteOverrides?: Readonly<Record<string, CoordinationSiteOverride>>
  /** Element-specific M-H slot distance. Defaults to the covalent-radius sum. */
  readonly slotBondLength?: number
}

export interface TransitionMetalCoordinationSet {
  readonly symbol: string
  readonly fragments: readonly FragmentDef[]
}
