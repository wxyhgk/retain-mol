import type { Molecule, Vector3Data } from '../../model/types'
import type { GeometryMotionOptions, GeometryMotionReport } from '../motion/contracts'

/** Geometric path handedness, not a CIP or automatic chemical P/M assignment. */
export type HelicalHandedness = 'right' | 'left'

export interface GeometryConstraintBase {
  readonly id: string
  readonly strength: 'hard' | 'soft'
  /** Positive weight for soft preferences; hard requirements always gate success. */
  readonly weight?: number
}

export type GeometryConstraint =
  | (GeometryConstraintBase & { readonly kind: 'distance'; readonly atomIds: readonly [string, string]; readonly target: number; readonly tolerance: number })
  | (GeometryConstraintBase & { readonly kind: 'minimum-distance'; readonly atomIds: readonly [string, string]; readonly minimum: number; readonly tolerance: number })
  | (GeometryConstraintBase & { readonly kind: 'angle'; readonly atomIds: readonly [string, string, string]; readonly targetDegrees: number; readonly toleranceDegrees: number })
  | (GeometryConstraintBase & { readonly kind: 'dihedral'; readonly atomIds: readonly [string, string, string, string]; readonly targetDegrees: number; readonly toleranceDegrees: number })
  | (GeometryConstraintBase & { readonly kind: 'position'; readonly atomId: string; readonly target: Vector3Data; readonly tolerance: number })
  | (GeometryConstraintBase & { readonly kind: 'helicity'; readonly atomIds: readonly string[]; readonly handedness: HelicalHandedness; readonly minTwistDegrees: number })

export interface GeometryConstraintIssue {
  readonly code: 'invalid-input' | 'invalid-constraint' | 'degenerate-geometry' | 'stereochemistry-violation'
  readonly message: string
  readonly constraintId?: string
  readonly atomIds: readonly string[]
}

export interface GeometryConstraintMeasurement {
  readonly constraintId: string
  readonly kind: GeometryConstraint['kind']
  readonly strength: 'hard' | 'soft'
  readonly atomIds: readonly string[]
  readonly actual: number | null
  readonly unit: 'angstrom' | 'degree'
  /** Nonnegative amount outside the allowed range, in the stated unit. */
  readonly violation: number | null
  readonly satisfied: boolean
}

export interface GeometryConstraintReport {
  readonly validInput: boolean
  readonly satisfied: boolean
  readonly hardViolationCount: number
  readonly softPenalty: number
  readonly measurements: readonly GeometryConstraintMeasurement[]
  readonly issues: readonly GeometryConstraintIssue[]
}

export interface ConstrainedGeometryRequest {
  readonly constraints: readonly GeometryConstraint[]
  /** All unlisted atoms remain exactly fixed. */
  readonly movableAtomIds: readonly string[]
  /** Preserve every original bond length, including all ring closure edges. Default 0.03 Å. */
  readonly bondLengthTolerance?: number
  /** Preserve original adjacent bond angles within this tolerance. Default 10°. */
  readonly angleToleranceDegrees?: number
  /** Geometric lower bound for nonbonded pairs beyond two bonds; default 0.8 Å, zero disables. Not a van der Waals model. */
  readonly nonbondedMinimumDistance?: number
  readonly maxIterations?: number
  /** Opt-in clearance check of linear interpolation from the input to the final candidate; not the solver's numerical trajectory. */
  readonly motion?: GeometryMotionOptions
}

export interface ConstrainedGeometryResult {
  readonly ok: boolean
  readonly status: 'converged' | 'invalid-input' | 'not-converged'
  /** On failure this is the original input; an unaccepted iterate is never returned as a molecule. */
  readonly molecule: Molecule
  /** Measurements of the returned molecule, not a rejected intermediate iterate. */
  readonly report: GeometryConstraintReport
  /** Diagnostic-only measurements of a rejected final iterate, when one was attempted. */
  readonly attemptReport?: GeometryConstraintReport
  /** Linear input-to-candidate motion diagnosis, including a rejected candidate when motion is unsafe or indeterminate. */
  readonly motionReport?: GeometryMotionReport
  readonly iterations: number
  readonly movedAtomIds: readonly string[]
  readonly reason?: string
}
