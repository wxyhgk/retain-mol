import { defineTransitionMetalCoordinationSet } from '../createTransitionMetalFragments'

export const SN_COORDINATION_SET = defineTransitionMetalCoordinationSet('Sn', [
  { geometryId: 'tetrahedral', name: 'Sn · 四面体' },
  { geometryId: 'trigonal-bipyramidal', name: 'Sn · 三角双锥' },
  { geometryId: 'octahedral-d3d', name: 'Sn · 八面体' },
])
