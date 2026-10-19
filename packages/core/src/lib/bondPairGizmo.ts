import type { Vec3 } from './math/vec3'

export type BondPairGizmoMode = 'azimuth' | 'axis-angle' | 'both'
export type BondPairGizmoPhase = 'start' | 'preview' | 'commit' | 'cancel'

export interface BondPairGizmoConfig {
  readonly enabled: boolean
  readonly referenceBondId: string
  readonly movingBondId: string
  readonly referenceAnchorAtomId: string
  readonly movingAnchorAtomId: string
  readonly mode?: BondPairGizmoMode
  /** Show the 0° and 180° mathematical coplanarity shortcut handles. */
  readonly showCoplanarHandles?: boolean
}

export interface BondPairGizmoValue {
  readonly distance: number
  readonly axisAngleDegrees: number
  /** Rotation relative to the geometry present when this gizmo was mounted. */
  readonly azimuthDegrees: number
  readonly coplanar: false | 0 | 180
}

export type BondPairGizmoErrorCode =
  | 'invalid-number'
  | 'invalid-angle'
  | 'invalid-distance'
  | 'unsupported-move-mode'
  | 'session-not-started'
  | 'reference-bond-not-found'
  | 'moving-bond-not-found'
  | 'same-bond'
  | 'reference-object-hidden'
  | 'moving-object-hidden'
  | 'moving-object-locked'
  | 'reference-anchor-not-on-bond'
  | 'moving-anchor-not-on-bond'
  | 'zero-length-reference-bond'
  | 'zero-length-moving-bond'
  | 'connected-bond-pair'
  | 'topology-changed'

export interface BondPairGizmoError {
  readonly code: BondPairGizmoErrorCode
  readonly reason: string
}

/** Prepared geometry DTO passed across Builder → Renderer. */
export interface BondPairGizmoGeometry {
  readonly value: BondPairGizmoValue
  readonly referenceOther: Vec3
  readonly referenceAnchor: Vec3
  readonly movingAnchor: Vec3
  readonly movingOther: Vec3
  readonly movingAtomIds: ReadonlySet<string>
  readonly movingObjectId: string
  readonly topologySignature: string
}

export type BondPairGizmoInspection =
  | { readonly ok: true; readonly snapshot: BondPairGizmoGeometry }
  | { readonly ok: false; readonly code: BondPairGizmoErrorCode; readonly reason: string }
