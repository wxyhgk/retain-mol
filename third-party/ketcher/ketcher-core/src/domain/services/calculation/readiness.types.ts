import type { CalculationSnapshotV1 } from '../../entities/calculation/calculationSnapshot';

export type CalculationReadinessSeverity = 'error' | 'warning';

export type CalculationReadinessIssueCode =
  | 'EMPTY_STRUCTURE'
  | 'MISSING_COORDINATES'
  | 'NON_FINITE_COORDINATES'
  | 'GEOMETRY_APPEARS_TWO_DIMENSIONAL'
  | 'UNKNOWN_ATOMIC_NUMBER'
  | 'ATOMIC_NUMBER_MISMATCH'
  | 'TOTAL_CHARGE_INFERRED'
  | 'INVALID_TOTAL_CHARGE'
  | 'MULTIPLICITY_UNSPECIFIED'
  | 'INVALID_MULTIPLICITY'
  | 'ELECTRON_MULTIPLICITY_MISMATCH'
  | 'INVALID_ELECTRON_COUNT'
  | 'MULTIPLE_FRAGMENTS'
  | 'IMPLICIT_HYDROGENS_PRESENT';

export interface CalculationReadinessIssue {
  code: CalculationReadinessIssueCode;
  severity: CalculationReadinessSeverity;
  message: string;
  atomRefs: readonly string[];
}

export interface CalculationReadinessResult {
  ready: boolean;
  issues: readonly CalculationReadinessIssue[];
  electronCount: number | null;
  effectiveTotalCharge: number | null;
  effectiveMultiplicity: number | null;
}

/**
 * The validator accepts a snapshot-shaped value because calculation documents
 * may arrive from storage or an external service without runtime type safety.
 */
export type CalculationReadinessInput = CalculationSnapshotV1;
