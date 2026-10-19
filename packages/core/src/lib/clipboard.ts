/** Serializable fragment clipboard data; independent of the system clipboard. */
import type { CoordinationSite } from './model/types'

export interface ClipboardAtom {
  symbol: string
  isotope?: number
  x: number; y: number; z: number
  charge?: number
  radical?: number
  chirality?: 'R' | 'S'
  label?: string
  coordinationGeometry?: string
  coordinationDirections?: readonly (readonly [number, number, number])[]
  coordinationSites?: readonly CoordinationSite[]
  coordinationNumber?: number
}

export interface ClipboardBond {
  a: number   // index into ClipboardAtom[]
  b: number
  order: 1 | 2 | 3
  aromatic?: boolean
  wedge?: 'up' | 'down'
  ez?: 'E' | 'Z'
  coordinationSites?: readonly { atom: number; siteId: string }[]
}

export interface MolClipboard {
  atoms: ClipboardAtom[]
  bonds: ClipboardBond[]
}

