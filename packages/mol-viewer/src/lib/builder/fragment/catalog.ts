import type { FragmentDef } from './model'
import { COORDINATION_FRAGMENTS } from './catalogs/coordination'
import { ORGANIC_STUB_FRAGMENTS } from './catalogs/organicStubs'
import { RING_FRAGMENTS } from './catalogs/rings'

/** Built-in fragments in their stable catalog order. */
export const FRAGMENTS: FragmentDef[] = [
  ...ORGANIC_STUB_FRAGMENTS,
  ...COORDINATION_FRAGMENTS,
  ...RING_FRAGMENTS,
]
