import { defineTransitionMetalCoordinationSet } from '../createTransitionMetalFragments'
import type { TransitionMetalCoordinationSpec } from '../types'

const SG_COORDINATION_SPECS: readonly TransitionMetalCoordinationSpec[] = [
  { geometryId: 'linear' },
  { geometryId: 'trigonal-planar' },
  { geometryId: 't-shaped' },
  { geometryId: 'trigonal-pyramidal' },
  { geometryId: 'tetrahedral' },
  { geometryId: 'square-planar' },
  { geometryId: 'trigonal-bipyramidal' },
  { geometryId: 'square-pyramidal' },
  { geometryId: 'octahedral-d3d' },
  { geometryId: 'trigonal-prismatic-d3h' },
  { geometryId: 'pentagonal-bipyramidal-d5h' },
  { geometryId: 'capped-octahedral-c3v' },
  { geometryId: 'square-antiprismatic-d4d' },
  { geometryId: 'dodecahedral-d2d' },
  { geometryId: 'tricapped-trigonal-prismatic-d3h' },
  { geometryId: 'capped-square-antiprismatic-c4v' },
  { geometryId: 'pentagonal-prismatic-d5h' },
]

export const SG_COORDINATION_SET = defineTransitionMetalCoordinationSet('Sg', SG_COORDINATION_SPECS)
