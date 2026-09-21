import type { Molecule } from '../molecule'
import type { ConstrainedGeometryRequest } from '../geometry/constrained/contracts'

export const MODELING_SCHEMA_VERSION = 1 as const

export const MODELING_COMMAND_KINDS = [
  'atom.add',
  'atom.replace',
  'atom.remove',
  'atom.move',
  'atom.setCharge',
  'atom.setRadical',
  'atom.addHydrogen',
  'bond.add',
  'bond.remove',
  'bond.setOrder',
  'fragment.attach',
  'fragment.bridge',
  'fragment.fuse',
  'geometry.setBondLength',
  'geometry.setBondAngle',
  'geometry.setDihedral',
  'geometry.rotateGroup',
  'geometry.solveConstraints',
] as const

export type ModelingCommandKind = typeof MODELING_COMMAND_KINDS[number]
export type ModelingPlanSource = 'ai' | 'human' | 'import' | 'system'

export interface ModelingPosition {
  readonly x: number
  readonly y: number
  readonly z: number
}

export type ModelingAnchor =
  | { readonly kind: 'atom'; readonly atomId: string }
  | { readonly kind: 'bond'; readonly bondId: string }
  | {
      readonly kind: 'space'
      readonly position: ModelingPosition
      readonly normal?: ModelingPosition
    }

export type ModelingScope =
  | { readonly kind: 'molecule' }
  | {
      readonly kind: 'selection'
      readonly atomIds: readonly string[]
      readonly bondIds: readonly string[]
    }

export interface ModelingConstraints {
  /** Existing atoms whose coordinates must remain equal to the target's base revision. */
  readonly fixedAtomPositions?: readonly string[]
  /** Existing atoms that must not be removed or have their element replaced. */
  readonly protectedAtomIds?: readonly string[]
}

export interface ModelingCommandBase {
  /** Stable within one plan and used in diagnostics/audit logs. */
  readonly commandId: string
  readonly kind: ModelingCommandKind
}

export type ModelingCommand =
  | (ModelingCommandBase & {
      readonly kind: 'atom.add'
      /** Caller-supplied id keeps a dry-run deterministic and referenceable. */
      readonly atomId: string
      readonly symbol: string
      readonly position: ModelingPosition
    })
  | (ModelingCommandBase & {
      readonly kind: 'atom.replace'
      readonly atomId: string
      readonly symbol: string
    })
  | (ModelingCommandBase & {
      readonly kind: 'atom.remove'
      readonly atomId: string
    })
  | (ModelingCommandBase & {
      readonly kind: 'atom.move'
      readonly atomId: string
      readonly position: ModelingPosition
    })
  | (ModelingCommandBase & {
      readonly kind: 'atom.setCharge'
      readonly atomId: string
      readonly charge: number
    })
  | (ModelingCommandBase & {
      readonly kind: 'atom.setRadical'
      readonly atomId: string
      readonly radical: number
    })
  | (ModelingCommandBase & {
      readonly kind: 'atom.addHydrogen'
      readonly atomId: string
      /** Stable id assigned to the generated H so later commands can reference it. */
      readonly hydrogenAtomId: string
    })
  | (ModelingCommandBase & {
      readonly kind: 'bond.add'
      readonly bondId: string
      readonly atomId1: string
      readonly atomId2: string
      readonly order: 1 | 2 | 3
    })
  | (ModelingCommandBase & {
      readonly kind: 'bond.remove'
      readonly bondId: string
    })
  | (ModelingCommandBase & {
      readonly kind: 'bond.setOrder'
      readonly bondId: string
      readonly order: 1 | 2 | 3
    })
  | (ModelingCommandBase & {
      readonly kind: 'fragment.attach'
      readonly atomId: string
      /** Registered template id. The planner cannot inject an arbitrary fragment payload. */
      readonly fragmentId: string
      /** Rotation about the newly created single bond. */
      readonly torsionAngleDegrees?: number
    })
  | (ModelingCommandBase & {
      readonly kind: 'fragment.bridge'
      /** Two existing heavy atoms or their replaceable H atoms. */
      readonly atomId1: string
      readonly atomId2: string
      /** Registered rigid template with two H leaving sites on attachIndex. */
      readonly fragmentId: string
      /** Selects one orientation around the target-target axis. */
      readonly orientationDegrees?: number
    })
  | (ModelingCommandBase & {
      readonly kind: 'fragment.fuse'
      readonly bondId: string
      /** Registered ring template whose attachment edge is fused onto bondId. */
      readonly fragmentId: string
    })
  | (ModelingCommandBase & {
      readonly kind: 'geometry.setBondLength'
      readonly atomId1: string
      readonly atomId2: string
      readonly length: number
    })
  | (ModelingCommandBase & {
      readonly kind: 'geometry.setBondAngle'
      readonly atomId1: string
      readonly atomId2: string
      readonly atomId3: string
      readonly angleDegrees: number
    })
  | (ModelingCommandBase & {
      readonly kind: 'geometry.setDihedral'
      readonly atomId1: string
      readonly atomId2: string
      readonly atomId3: string
      readonly atomId4: string
      readonly angleDegrees: number
    })
  | (ModelingCommandBase & {
      readonly kind: 'geometry.solveConstraints'
      /** Bounded coordinate-only solve; all original ring bonds are preserved. */
      readonly request: ConstrainedGeometryRequest
    })
  | (ModelingCommandBase & {
      readonly kind: 'geometry.rotateGroup'
      /** Atoms moved as one rigid body. Axis atoms may be omitted from this set. */
      readonly atomIds: readonly string[]
      readonly axisAtomId1: string
      readonly axisAtomId2: string
      readonly angleDegrees: number
    })

export interface EditPlan {
  readonly schemaVersion: typeof MODELING_SCHEMA_VERSION
  readonly planId: string
  readonly source: ModelingPlanSource
  readonly description?: string
  readonly targetObjectId: string
  /** Restricts which existing atoms/bonds an untrusted planner may mutate. */
  readonly scope?: ModelingScope
  /** Grounding intent for atom, bond or free-space generation. */
  readonly anchor?: ModelingAnchor
  /** Optional optimistic concurrency guard copied from ModelingObjectContext.revision. */
  readonly expectedRevision?: string
  /** Optional invariants enforced against the target molecule throughout execution. */
  readonly constraints?: ModelingConstraints
  readonly commands: readonly ModelingCommand[]
}

export interface ModelingSelectionContext {
  readonly atomIds: readonly string[]
  readonly bondIds: readonly string[]
}

export interface ModelingEditorIntentContext {
  readonly tool: 'select' | 'measure' | 'move-object'
  readonly brushArmed: boolean
  readonly activeElement: string
  readonly atomClickMode: 'grow' | 'replace'
  readonly activeFragmentId: string | null
}

export interface ModelingObjectContext {
  readonly objectId: string
  readonly name: string
  readonly visible: boolean
  readonly locked: boolean
  readonly editable: boolean
  readonly offset: ModelingPosition
  readonly coordinateSpace: 'molecule-local'
  readonly revision: string
  readonly molecule: Molecule
}

export interface ModelingContext {
  readonly schemaVersion: typeof MODELING_SCHEMA_VERSION
  readonly activeObjectId: string | null
  readonly objects: readonly ModelingObjectContext[]
  readonly selection: ModelingSelectionContext
  readonly editorIntent: ModelingEditorIntentContext
  readonly capabilities: readonly ModelingCommandKind[]
}

export type ModelingIssueSeverity = 'warning' | 'error'

export type ModelingIssueCode =
  | 'invalid-plan'
  | 'target-not-found'
  | 'target-not-active'
  | 'object-not-editable'
  | 'stale-context'
  | 'duplicate-id'
  | 'unsupported-command'
  | 'unknown-element'
  | 'atom-not-found'
  | 'bond-not-found'
  | 'out-of-scope'
  | 'constraint-violation'
  | 'command-failed'
  | 'command-noop'

export interface ModelingIssue {
  readonly severity: ModelingIssueSeverity
  readonly code: ModelingIssueCode
  readonly message: string
  readonly commandIndex?: number
  readonly commandId?: string
  readonly path?: string
}

export interface ModelingChangeSet {
  readonly addedAtomIds: readonly string[]
  readonly removedAtomIds: readonly string[]
  readonly updatedAtomIds: readonly string[]
  readonly addedBondIds: readonly string[]
  readonly removedBondIds: readonly string[]
  readonly updatedBondIds: readonly string[]
}

export interface ModelingResultBase {
  readonly targetObjectId: string | null
  readonly baseRevision: string | null
  readonly issues: readonly ModelingIssue[]
}

export type ModelingDryRunResult =
  | (ModelingResultBase & {
      readonly ok: true
      readonly changed: boolean
      readonly nextRevision: string
      readonly molecule: Molecule
      readonly selection: ModelingSelectionContext
      readonly changes: ModelingChangeSet
    })
  | (ModelingResultBase & {
      readonly ok: false
      readonly changed: false
    })

export type ModelingCommitResult =
  | (ModelingDryRunResult & {
      readonly ok: true
      readonly committed: boolean
      readonly transactionId: string | null
    })
  | (ModelingDryRunResult & {
      readonly ok: false
      readonly committed: false
      readonly transactionId: null
    })

export type EditPlanParseResult =
  | { readonly ok: true; readonly plan: EditPlan }
  | { readonly ok: false; readonly issues: readonly ModelingIssue[] }
