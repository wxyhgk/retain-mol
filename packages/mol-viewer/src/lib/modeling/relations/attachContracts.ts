import type { Atom, Bond } from '../../molecule'
import type { ModelingCommand } from '../contracts'

export type FragmentAttachCommand = Extract<
  ModelingCommand,
  { readonly kind: 'fragment.attach' }
>

export type FragmentAttachRelationDiagnosticCode =
  | 'invalid-before-graph'
  | 'invalid-command'
  | 'target-not-terminal-hydrogen'
  | 'template-not-registered'
  | 'invalid-template-attachment'
  | 'automatic-torsion'
  | 'unsupported-link-order'
  | 'degenerate-attachment-axis'
  | 'degenerate-orientation-evidence'
  | 'numeric-uncertainty'
  | 'graph-rewrite-mismatch'
  | 'fixed-atom-changed'
  | 'fixed-bond-changed'
  | 'new-atom-metadata-mismatch'
  | 'new-bond-mismatch'
  | 'link-bond-mismatch'
  | 'template-distorted'
  | 'template-mirrored'
  | 'template-placement-mismatch'

export interface FragmentAttachRelationDiagnostic {
  readonly code: FragmentAttachRelationDiagnosticCode
  readonly message: string
  readonly atomId?: string
  readonly atomId2?: string
  readonly bondId?: string
  readonly templateAtomIndex?: number
  readonly templateBondIndex?: number
}

export interface FragmentAttachAtomIdMapping {
  readonly templateAtomIndex: number
  readonly atomId: string
}

export interface FragmentAttachBondIdMapping {
  readonly templateBondIndex: number
  readonly bondId: string
}

/** Canonical exact graph rewrite and rigid placement derived from fragment.attach. */
export interface FragmentAttachRelation {
  readonly kind: 'fragment-attach'
  readonly commandId: string
  readonly fragmentId: string
  readonly torsionAngleDegrees: number
  readonly hostAtomId: string
  readonly deletedHydrogenAtomId: string
  readonly deletedHydrogenBondId: string
  readonly templateAttachAtomIndex: number
  readonly templateAttachHydrogenIndex: number
  readonly templateAtomIdByIndex: readonly FragmentAttachAtomIdMapping[]
  readonly templateBondIdByIndex: readonly FragmentAttachBondIdMapping[]
  readonly linkBondId: string
  readonly linkBondOrder: 1
  readonly fixedAtomIds: readonly string[]
  readonly fixedBondIds: readonly string[]
  readonly addedAtomIds: readonly string[]
  readonly addedBondIds: readonly string[]
  readonly expectedAddedAtoms: readonly Atom[]
  readonly expectedAddedBonds: readonly Bond[]
  readonly chiralityWitnessAtomIds?: readonly [string, string, string, string]
}

export type FragmentAttachRelationCompileResult =
  | {
      readonly verdict: 'pass'
      readonly relation: FragmentAttachRelation
    }
  | {
      readonly verdict: 'reject' | 'indeterminate'
      readonly diagnostic: FragmentAttachRelationDiagnostic
    }

export type FragmentAttachVerificationResult =
  | {
      readonly verdict: 'pass'
      readonly relation: FragmentAttachRelation
    }
  | {
      readonly verdict: 'reject' | 'indeterminate'
      readonly diagnostic: FragmentAttachRelationDiagnostic
      readonly relation?: FragmentAttachRelation
    }
