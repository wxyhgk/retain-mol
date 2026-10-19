import type { Atom } from '../../../molecule'
import type { PlacementScore } from '../../geometry/placementPlanner'
import type { Quat, Vec3 } from '../../math'

export interface BridgeFragmentOptions {
  /** Selects one point on the feasible placement circle around the target-target axis. */
  readonly orientationDegrees?: number
}

export interface FragmentBridgeSlots {
  readonly centerIndex: number
  readonly center: Vec3
  readonly leavingHydrogenIndices: readonly [number, number]
  readonly orders: readonly [1 | 2 | 3, 1 | 2 | 3]
  readonly directions: readonly [Vec3, Vec3]
}

export interface BridgeTarget {
  readonly host: Atom
  readonly preferredDirection: Vec3
  readonly removeAtomIds: ReadonlySet<string>
  readonly bondLength: number
  readonly order: 1 | 2 | 3
}

export interface BridgePlacement {
  readonly center: Vec3
  readonly rotation: Quat
  readonly score: PlacementScore
  readonly directionPenalty: number
}
