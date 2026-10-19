import type { Molecule } from '../../../molecule'
import type { FragmentDef } from '../../fragment/model'

export type BridgeRingTemplateBond = readonly [number, number]

export interface BridgeRingBetweenBondsInput {
  readonly targetBondIds: readonly [string, string]
  readonly fragment: FragmentDef
  readonly templateBondPairs: readonly [BridgeRingTemplateBond, BridgeRingTemplateBond]
}

export type BridgeRingFailureCode =
  | 'target-bond-not-found'
  | 'target-bond-invalid'
  | 'same-target-bond'
  | 'target-bonds-share-atom'
  | 'template-invalid'
  | 'template-not-seven-cycle'
  | 'template-bond-invalid'
  | 'template-bonds-share-atom'
  | 'no-valid-mapping'

export type BridgeRingMappingFailureCode =
  | 'element-mismatch'
  | 'duplicate-existing-bond'
  | 'over-valence'

export type BridgeRingAtomRef =
  | { readonly kind: 'existing'; readonly atomId: string }
  | { readonly kind: 'template'; readonly templateIndex: number }

export interface BridgeRingAtomSpec {
  readonly templateIndex: number
  readonly symbol: string
}

export interface BridgeRingBondSpec {
  readonly atom1: BridgeRingAtomRef
  readonly atom2: BridgeRingAtomRef
  readonly order: 1 | 2 | 3
}

export interface BridgeRingMappingDiagnostic {
  readonly reverseFirst: boolean
  readonly reverseSecond: boolean
  readonly code: BridgeRingMappingFailureCode
  readonly reason: string
}

export interface BridgeRingTopologyCandidate {
  readonly key: string
  readonly reverseFirst: boolean
  readonly reverseSecond: boolean
  readonly templateAtomToExistingAtomId: ReadonlyMap<number, string>
  readonly newHeavyAtomTemplateIndices: readonly number[]
  readonly removeAtomIds: readonly string[]
  readonly atomSpecs: readonly BridgeRingAtomSpec[]
  readonly bondSpecs: readonly BridgeRingBondSpec[]
}

export type PlanBridgeRingResult =
  | {
      readonly ok: true
      readonly candidates: readonly BridgeRingTopologyCandidate[]
      readonly rejectedMappings: readonly BridgeRingMappingDiagnostic[]
    }
  | {
      readonly ok: false
      readonly code: BridgeRingFailureCode
      readonly reason: string
      readonly rejectedMappings?: readonly BridgeRingMappingDiagnostic[]
    }

export type BridgeRingTopologyPlanner = (
  molecule: Molecule,
  input: BridgeRingBetweenBondsInput,
) => PlanBridgeRingResult
