import type { ModelingCommand } from '../contracts'

export type RotateGroupCommand = Extract<
  ModelingCommand,
  { readonly kind: 'geometry.rotateGroup' }
>

export type SpatialRelationVerdict = 'pass' | 'reject' | 'indeterminate'

export type RotateGroupRelationDiagnosticCode =
  | 'invalid-before-graph'
  | 'invalid-command'
  | 'axis-not-single-bond'
  | 'axis-not-bridge'
  | 'moving-side-incomplete'
  | 'moving-side-ambiguous'
  | 'degenerate-axis'
  | 'no-radial-witness'
  | 'numeric-uncertainty'
  | 'graph-changed'
  | 'non-coordinate-field-changed'
  | 'fixed-side-moved'
  | 'axis-endpoint-moved'
  | 'moving-side-not-rigid'
  | 'rotation-mismatch'
  | 'angle-mismatch'

export interface RotateGroupRelationDiagnostic {
  readonly code: RotateGroupRelationDiagnosticCode
  readonly message: string
  readonly atomId?: string
  readonly atomId2?: string
}

/** Canonical relation derived from a rotateGroup command and its complete before graph. */
export interface RotateGroupRelation {
  readonly kind: 'rotate-group'
  readonly commandId: string
  readonly angleDegrees: number
  /** Ordered exactly as the command axis; this order defines the signed angle. */
  readonly axisAtomIds: readonly [commandOriginAtomId: string, commandDirectionAtomId: string]
  readonly fixedAxisAtomId: string
  readonly movingAxisAtomId: string
  /** All atoms outside the moving component, including the fixed axis endpoint. */
  readonly fixedAtomIds: readonly string[]
  /** The complete component on the moving side, including its axis endpoint. */
  readonly movingAtomIds: readonly string[]
  /** Deterministic off-axis witness selected from the moving component. */
  readonly radialAtomId: string
}

export type RotateGroupRelationCompileResult =
  | {
      readonly verdict: 'pass'
      readonly relation: RotateGroupRelation
    }
  | {
      readonly verdict: 'reject' | 'indeterminate'
      readonly diagnostic: RotateGroupRelationDiagnostic
    }

export type RotateGroupVerificationResult =
  | {
      readonly verdict: 'pass'
      readonly relation: RotateGroupRelation
    }
  | {
      readonly verdict: 'reject' | 'indeterminate'
      readonly diagnostic: RotateGroupRelationDiagnostic
      readonly relation?: RotateGroupRelation
    }
