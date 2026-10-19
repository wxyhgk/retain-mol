import { defineTransitionMetalCoordinationSet } from '../createTransitionMetalFragments'

export const PB_COORDINATION_SET = defineTransitionMetalCoordinationSet('Pb', [
  { geometryId: 'tetrahedral', name: 'Pb · 四面体' },
  { geometryId: 'octahedral-d3d', name: 'Pb · 八面体' },
])
