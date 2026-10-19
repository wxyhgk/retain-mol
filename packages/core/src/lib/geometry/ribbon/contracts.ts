import type { Vector3Data } from '../../model/types'
import type { GeometryConstraint } from '../constrained/contracts'

/** Explicit ordered cross sections; these cross-section pairs need not be chemical bonds. */
export interface GeometryRibbonSection {
  readonly leftAtomId: string
  readonly rightAtomId: string
}

export interface GeometryRibbonRegion {
  readonly id: string
  readonly sections: readonly GeometryRibbonSection[]
  /** Crossed means the last left rail connects to the first right rail and vice versa. */
  readonly closure: 'open' | 'parallel' | 'crossed'
}

export interface GeometryRibbonIssue {
  readonly code: 'invalid-input' | 'invalid-region' | 'missing-rail-bond' | 'invalid-guide' | 'degenerate-geometry'
  readonly message: string
  readonly atomIds: readonly string[]
  readonly sectionIndex?: number
}

export interface GeometryRibbonValidation {
  readonly ok: boolean
  /** Ordered left/right pairs flattened to stable atom IDs, never inferred from storage order. */
  readonly atomIds: readonly string[]
  readonly issues: readonly GeometryRibbonIssue[]
}

export interface GeometryRibbonGuideRequest {
  readonly sectionCount: number
  readonly radius: number
  readonly halfWidth: number
  /** Integer signed half turns. Positive rotates by the right-hand rule about the forward tangent. */
  readonly halfTwists: number
}

export interface GeometryRibbonGuideSection {
  readonly center: Vector3Data
  readonly left: Vector3Data
  readonly right: Vector3Data
}

/** Procedural geometric targets only, not a chemical Molecule or a verified conformer. */
export interface GeometryRibbonGuide extends GeometryRibbonGuideRequest {
  readonly kind: 'circular-ribbon-guide'
  readonly unit: 'angstrom'
  readonly closure: 'parallel' | 'crossed'
  /** Samples around one full circle; the coincident endpoint at a full turn is omitted. */
  readonly sections: readonly GeometryRibbonGuideSection[]
}

export type GeometryRibbonGuideResult =
  | { readonly ok: true; readonly guide: GeometryRibbonGuide }
  | { readonly ok: false; readonly issues: readonly GeometryRibbonIssue[] }

export interface GeometryRibbonMeasurements extends GeometryRibbonValidation {
  readonly widthsAngstrom: readonly (number | null)[]
  /**
   * Signed adjacent-section turns after shortest tangent transport, in degrees.
   * Closed regions include a seam measurement; crossed seams reverse the first
   * width direction. Undefined or antipodal rotations are null. These local
   * samples do not establish global P/M, linking number, or absence of self-crossing.
   */
  readonly turnsDegrees: readonly (number | null)[]
}

export interface GeometryRibbonGuideConstraintOptions {
  readonly tolerance: number
  readonly weight?: number
}

export type GeometryRibbonGuideConstraintsResult =
  | { readonly ok: true; readonly atomIds: readonly string[]; readonly constraints: readonly GeometryConstraint[] }
  | { readonly ok: false; readonly issues: readonly GeometryRibbonIssue[] }
