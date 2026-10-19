import { TRANSITION_METAL_COORDINATION_SETS } from '../../coordination/elements'
import { P_BLOCK_COORDINATION_SETS } from '../../coordination/pBlock'
import type { FragmentDef } from '../model'

export const COORDINATION_FRAGMENTS: readonly FragmentDef[] = [
  ...TRANSITION_METAL_COORDINATION_SETS.flatMap(set => set.fragments),
  ...P_BLOCK_COORDINATION_SETS.flatMap(set => set.fragments),
]
