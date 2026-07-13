export type PublicFragmentGroup = 'sp3' | 'sp2' | 'sp' | 'coordination' | 'ring' | 'group'
export type PublicFragmentBondOrder = 1 | 2 | 3
export type PublicFragmentDirection = readonly [number, number, number]

export interface PublicFragmentAtom {
  readonly symbol: string
  readonly x: number
  readonly y: number
  readonly z: number
}

export interface PublicFragmentBond {
  readonly a: number
  readonly b: number
  readonly order: PublicFragmentBondOrder
  readonly coordinationSiteId?: string
}

export interface PublicCoordinationSite {
  readonly id: string
  readonly label: string
  readonly direction: PublicFragmentDirection
  readonly bondOrder: PublicFragmentBondOrder
  readonly equivalenceGroup: string
}

export interface PublicFragmentCoordination {
  readonly geometryId: string
  readonly coordinationNumber: number
  readonly pointGroup?: string
  readonly directions: readonly PublicFragmentDirection[]
  readonly sites: readonly PublicCoordinationSite[]
}

export interface PublicFragmentDef {
  readonly id: string
  readonly name: string
  readonly short: string
  readonly formula: string
  readonly atoms: readonly PublicFragmentAtom[]
  readonly bonds: readonly PublicFragmentBond[]
  readonly attachIndex: number
  readonly attachHIndex: number
  readonly attachDirection?: PublicFragmentDirection
  readonly attachBond?: readonly [number, number]
  readonly attachOrder?: PublicFragmentBondOrder
  readonly group?: PublicFragmentGroup
  readonly coordination?: PublicFragmentCoordination
}

export interface FragmentSummary {
  readonly id: string
  readonly name: string
  readonly short: string
  readonly formula: string
  readonly group?: PublicFragmentGroup
  readonly attachOrder?: PublicFragmentBondOrder
  readonly atomCount: number
  readonly bondCount: number
}

export interface FragmentAttachmentSite extends PublicCoordinationSite {}
