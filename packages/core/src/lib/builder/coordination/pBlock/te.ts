import { defineTransitionMetalCoordinationSet } from '../createTransitionMetalFragments'

export const TE_COORDINATION_SET = defineTransitionMetalCoordinationSet('Te', [
  { geometryId: 'tetrahedral', name: 'Te · 四面体' },
  { geometryId: 'octahedral-d3d', name: 'Te · 八面体' },
])
