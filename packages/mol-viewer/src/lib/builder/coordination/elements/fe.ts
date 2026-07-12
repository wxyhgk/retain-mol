import { defineTransitionMetalCoordinationSet } from '../createTransitionMetalFragments'
import type { TransitionMetalCoordinationSpec } from '../types'

// Fe owns every entry independently. Later Fe-specific bond axes or labels can be
// changed here without affecting any other transition metal.
const FE_COORDINATION_SPECS: readonly TransitionMetalCoordinationSpec[] = [
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

export const FE_COORDINATION_SET = defineTransitionMetalCoordinationSet('Fe', FE_COORDINATION_SPECS)
