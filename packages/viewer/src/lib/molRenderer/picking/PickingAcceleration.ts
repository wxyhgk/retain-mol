import type * as THREE from 'three'

/** The renderable class whose raycast candidates are being selected. */
export type PickTargetKind = 'atom' | 'bond'

/**
 * Input supplied to a picking acceleration strategy for one raycast.
 *
 * An accelerator may return a narrower candidate array, but it must retain
 * every object that could be the nearest intersection for this ray.
 */
export interface PickingAccelerationQuery {
  readonly target: PickTargetKind
  readonly raycaster: THREE.Raycaster
  readonly candidates: THREE.Object3D[]
}

/**
 * Candidate-selection boundary for molecular picking.
 *
 * Strategies intentionally do not perform raycasting themselves. Three.js
 * remains the single source of truth for intersection ordering and hit data.
 */
export interface PickingAcceleration {
  readonly id: string
  selectCandidates(query: PickingAccelerationQuery): THREE.Object3D[]
}

/** Baseline strategy: retain the existing full candidate raycast behavior. */
export class NonePickingAcceleration implements PickingAcceleration {
  readonly id = 'none'

  selectCandidates({ candidates }: PickingAccelerationQuery): THREE.Object3D[] {
    return candidates
  }
}

/** Shared default to avoid allocating a strategy for every interaction handler. */
export const nonePickingAcceleration: PickingAcceleration = new NonePickingAcceleration()
