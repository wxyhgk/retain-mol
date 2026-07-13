import type { CoordinationSite } from '../../types'

export interface FragmentAtom {
  symbol: string
  x: number
  y: number
  z: number
}

export interface FragmentBond {
  a: number
  b: number
  order: 1 | 2 | 3
  coordinationSiteId?: string
}

export interface FragmentDef {
  id: string
  name: string
  short: string
  formula: string
  atoms: FragmentAtom[]
  bonds: FragmentBond[]
  attachIndex: number
  attachHIndex: number
  attachDirection?: [number, number, number]
  attachBond?: [number, number]
  attachOrder?: 1 | 2 | 3
  group?: 'sp3' | 'sp2' | 'sp' | 'coordination' | 'ring' | 'group'
  coordination?: {
    geometryId: string
    coordinationNumber: number
    pointGroup?: string
    directions: [number, number, number][]
    sites: CoordinationSite[]
  }
}
