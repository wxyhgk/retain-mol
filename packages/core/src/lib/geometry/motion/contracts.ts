/** Geometric clearances in angstroms, not van der Waals or force-field radii. */
export interface GeometryMotionOptions {
  /** Default 0.8. Atom pairs separated by one or two bonds are excluded from this clearance; their coincident degeneracies are still rejected. Must be positive. */
  readonly minAtomDistance?: number
  /** Default 0.15. Bond endpoints and atoms directly bonded to either endpoint are excluded. Must be positive. */
  readonly minAtomBondDistance?: number
  /** Default 0.1. Bonds sharing an endpoint are excluded. Must be positive. */
  readonly minBondDistance?: number
  /** Maximum interval subdivision depth, integer in [0, 30]. Default 20. */
  readonly maxDepth?: number
  /** Shared budget for candidate pair visits and distance evaluations, integer in [1, 1000000]. Default 100000. */
  readonly maxChecks?: number
}

export interface GeometryMotionIssue {
  readonly kind: 'atom-atom' | 'atom-bond' | 'bond-bond' | 'invalid-input' | 'budget-exhausted'
  readonly message: string
  readonly atomIds: readonly string[]
  readonly bondIds: readonly string[]
  readonly timeInterval?: readonly [number, number]
  readonly sampleTime?: number
  readonly distance?: number
}

/** Only the stated linear interpolation and geometric exclusions are certified. */
export interface GeometryMotionReport {
  readonly status: 'safe' | 'collision' | 'indeterminate' | 'invalid-input'
  readonly safe: boolean
  readonly trajectory: 'linear'
  readonly unit: 'angstrom'
  readonly issues: readonly GeometryMotionIssue[]
  readonly checkedPairs: number
  /** Candidate visits, including graph-distance exclusion preparation and excluded pairs. */
  readonly pairVisits: number
  readonly evaluations: number
}
