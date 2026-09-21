import type { ModelingCommand, ModelingCommandKind } from '../contracts'

export const EXPECTED_EFFECT_SCHEMA_VERSION = 2 as const

export const EXPECTED_EFFECT_SUPPORTED_COMMAND_KINDS = [
  'atom.add',
  'atom.replace',
  'atom.remove',
  'atom.move',
  'bond.add',
  'bond.remove',
  'bond.setOrder',
] as const satisfies readonly ModelingCommandKind[]

export type ExpectedEffectSupportedCommandKind =
  typeof EXPECTED_EFFECT_SUPPORTED_COMMAND_KINDS[number]

export type ExpectedEffectSupportedCommand = Extract<
  ModelingCommand,
  { readonly kind: ExpectedEffectSupportedCommandKind }
>

export type ExpectedEffectSemanticsSupport = 'supported' | 'unsupported'

export interface CanonicalCoordinationSite {
  readonly id: string
  readonly label: string
  readonly direction: readonly [number, number, number]
  readonly bondOrder: 1 | 2 | 3
  readonly equivalenceGroup: string
}

export interface CanonicalCoordinationSiteAssignment {
  readonly atomId: string
  readonly siteId: string
}

export interface CanonicalAtomSnapshot {
  readonly id: string
  readonly symbol: string
  readonly isotope: number | null
  readonly x: number
  readonly y: number
  readonly z: number
  readonly charge: number | null
  readonly chirality: 'R' | 'S' | null
  readonly radical: number | null
  readonly label: string | null
  readonly coordinationGeometry: string | null
  readonly coordinationDirections: readonly (readonly [number, number, number])[]
  readonly coordinationSites: readonly CanonicalCoordinationSite[]
  readonly coordinationNumber: number | null
}

export interface CanonicalBondSnapshot {
  readonly id: string
  readonly atomId1: string
  readonly atomId2: string
  readonly order: 1 | 2 | 3
  readonly wedge: 'up' | 'down' | null
  readonly ez: 'E' | 'Z' | null
  readonly aromatic: boolean
  readonly coordinationSites: readonly CanonicalCoordinationSiteAssignment[]
}

export interface CanonicalMoleculeSnapshot {
  readonly name: string | null
  readonly atoms: readonly CanonicalAtomSnapshot[]
  readonly bonds: readonly CanonicalBondSnapshot[]
}

export interface ExpectedEffectEntityChange<T> {
  readonly id: string
  readonly before: T | null
  readonly after: T | null
}

export interface ExpectedEffectChanges {
  readonly atoms: readonly ExpectedEffectEntityChange<CanonicalAtomSnapshot>[]
  readonly bonds: readonly ExpectedEffectEntityChange<CanonicalBondSnapshot>[]
}

export interface ModelingCommandEffectReceipt {
  readonly commandId: string
  readonly kind: ModelingCommandKind
  readonly preDigest: string
  readonly postDigest: string
  readonly changes: ExpectedEffectChanges
}

export interface ModelingEffectReceipt {
  readonly schemaVersion: typeof EXPECTED_EFFECT_SCHEMA_VERSION
  readonly planId: string
  readonly baseDigest: string
  readonly finalDigest: string
  readonly commands: readonly ModelingCommandEffectReceipt[]
}

export interface ExpectedEffect extends ModelingEffectReceipt {
  readonly status: 'compiled'
  readonly baseSnapshot: CanonicalMoleculeSnapshot
  readonly finalSnapshot: CanonicalMoleculeSnapshot
}

export type ExpectedEffectIndeterminateReason =
  | 'unsupported-effect-semantics'
  | 'invalid-effect-input'

export interface ExpectedEffectIndeterminate {
  readonly status: 'indeterminate'
  readonly reason: ExpectedEffectIndeterminateReason
  readonly message: string
  readonly commandIndex?: number
  readonly commandId?: string
  readonly commandKind?: ModelingCommandKind
  readonly unsupportedCommandKinds?: readonly ModelingCommandKind[]
}

export type ExpectedEffectCompileResult = ExpectedEffect | ExpectedEffectIndeterminate

export type ExpectedEffectMismatchCode =
  | 'schema-version-mismatch'
  | 'plan-id-mismatch'
  | 'base-digest-mismatch'
  | 'final-digest-mismatch'
  | 'missing-command-receipt'
  | 'extra-command-receipt'
  | 'command-order-mismatch'
  | 'command-kind-mismatch'
  | 'pre-digest-mismatch'
  | 'post-digest-mismatch'
  | 'atom-changes-mismatch'
  | 'bond-changes-mismatch'

export interface ExpectedEffectMismatch {
  readonly code: ExpectedEffectMismatchCode
  readonly message: string
  readonly commandIndex?: number
  readonly commandId?: string
}

export type ExpectedEffectComparison =
  | { readonly verdict: 'pass'; readonly mismatches: readonly [] }
  | { readonly verdict: 'reject'; readonly mismatches: readonly ExpectedEffectMismatch[] }
  | {
      readonly verdict: 'indeterminate'
      readonly reason: ExpectedEffectIndeterminateReason
      readonly message: string
      readonly mismatches: readonly []
    }
