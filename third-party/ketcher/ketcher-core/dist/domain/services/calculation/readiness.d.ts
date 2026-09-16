import type { CalculationReadinessInput, CalculationReadinessResult } from './readiness.types';
/**
 * Performs calculation-readiness checks without invoking a chemistry engine.
 * The checks deliberately avoid bond-order/valence inference. In particular,
 * missing hydrogen warnings are based only on explicit snapshot metadata.
 */
export declare function validateCalculationReadiness(snapshot: CalculationReadinessInput): CalculationReadinessResult;
