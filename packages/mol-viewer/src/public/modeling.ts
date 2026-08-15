import { editChanged } from '../lib/builder/commands/shared'
import {
  createModelingContext,
  dryRunEditPlan,
  parseEditPlan,
  type EditPlan,
  type ModelingCommitResult,
  type ModelingContext,
  type ModelingIssue,
} from '../lib/modeling'
import {
  defaultViewerRuntime,
  getViewerRuntimeServices,
  type ViewerRuntime,
} from '../runtime/ViewerRuntime'

export {
  HEADLESS_MODELING_OBJECT_ID,
  EXPECTED_EFFECT_SCHEMA_VERSION,
  EXPECTED_EFFECT_SEMANTICS,
  EXPECTED_EFFECT_SUPPORTED_COMMAND_KINDS,
  MODELING_COMMAND_KINDS,
  MODELING_SCHEMA_VERSION,
  applyExpectedEffectCommand,
  compareExpectedEffect,
  compileFragmentAttachRelation,
  compileExpectedEffect,
  computeCanonicalMoleculeDigest,
  computeCanonicalSnapshotDigest,
  computeMoleculeRevision,
  createCanonicalEffectChanges,
  createCanonicalMoleculeSnapshot,
  createHeadlessModelingContext,
  dryRunEditPlan,
  editPlanSchema,
  modelingCommandSchema,
  modelingConstraintsSchema,
  parseEditPlan,
  replayEditPlan,
  replayEditPlanTrace,
  isExpectedEffectCommandSupported,
  validateModelingCommandConstraints,
  validateModelingConstraintInvariants,
  validateModelingConstraints,
  verifyRotateGroupRelation,
  verifyFragmentAttachRelation,
} from '../lib/modeling'
export type {
  EditPlan,
  EditPlanParseResult,
  ApplyExpectedEffectCommandResult,
  CanonicalAtomSnapshot,
  CanonicalBondSnapshot,
  CanonicalCoordinationSite,
  CanonicalCoordinationSiteAssignment,
  CanonicalMoleculeSnapshot,
  ExpectedEffect,
  ExpectedEffectChanges,
  ExpectedEffectComparison,
  ExpectedEffectCompileResult,
  ExpectedEffectEntityChange,
  ExpectedEffectIndeterminate,
  ExpectedEffectIndeterminateReason,
  ExpectedEffectMismatch,
  ExpectedEffectMismatchCode,
  ExpectedEffectSemanticsSupport,
  ExpectedEffectSupportedCommand,
  ExpectedEffectSupportedCommandKind,
  FragmentAttachAtomIdMapping,
  FragmentAttachBondIdMapping,
  FragmentAttachCommand,
  FragmentAttachRelation,
  FragmentAttachRelationCompileResult,
  FragmentAttachRelationDiagnostic,
  FragmentAttachRelationDiagnosticCode,
  FragmentAttachVerificationResult,
  HeadlessModelingOptions,
  HeadlessModelingTraceResult,
  HeadlessModelingTraceStep,
  ModelingChangeSet,
  ModelingCommand,
  ModelingCommandBase,
  ModelingCommandKind,
  ModelingCommitResult,
  ModelingContext,
  ModelingCommandEffectReceipt,
  ModelingConstraints,
  ModelingDryRunResult,
  ModelingEditorIntentContext,
  ModelingEffectReceipt,
  ModelingIssue,
  ModelingIssueCode,
  ModelingIssueSeverity,
  ModelingAnchor,
  ModelingObjectContext,
  ModelingPlanSource,
  ModelingPosition,
  ModelingResultBase,
  ModelingSelectionContext,
  ModelingScope,
  RotateGroupCommand,
  RotateGroupRelation,
  RotateGroupRelationDiagnostic,
  RotateGroupRelationDiagnosticCode,
  RotateGroupVerificationResult,
} from '../lib/modeling'
export type { Atom, Bond, Molecule } from '../lib/molecule'
export type {
  CoordinationBondOrder,
  CoordinationSite,
  CoordinationSiteAssignment,
} from '../lib/types'
export type { ViewerRuntime } from '../runtime/ViewerRuntime'

/** Read-only, serializable snapshot intended for AI planners and collaboration clients. */
export function getModelingContext(
  runtime: ViewerRuntime = defaultViewerRuntime,
): ModelingContext {
  const services = getViewerRuntimeServices(runtime)
  return createModelingContext(
    services.moleculeStore.getState(),
    services.editorStore.getState(),
  )
}

function commitFailure(
  result: ReturnType<typeof dryRunEditPlan>,
  issue: ModelingIssue,
): ModelingCommitResult {
  return {
    ok: false,
    changed: false,
    targetObjectId: result.targetObjectId,
    baseRevision: result.baseRevision,
    committed: false,
    transactionId: null,
    issues: [...result.issues, issue],
  }
}

/**
 * Validate, dry-run and atomically commit one complete plan as a single undo step.
 * The v1 adapter intentionally targets only the active scene object.
 */
export function commitEditPlan(
  input: EditPlan | unknown,
  runtime: ViewerRuntime = defaultViewerRuntime,
): ModelingCommitResult {
  const parsed = parseEditPlan(input)
  const context = getModelingContext(runtime)
  const result = dryRunEditPlan(context, input)
  if (!result.ok) return { ...result, committed: false, transactionId: null }
  if (!parsed.ok) return { ...result, committed: false, transactionId: null }
  if (context.activeObjectId !== result.targetObjectId) {
    return commitFailure(result, {
      severity: 'error',
      code: 'target-not-active',
      message: 'v1 建模执行器只允许提交到当前活跃对象',
    })
  }
  if (!result.changed) {
    return { ...result, committed: false, transactionId: null }
  }

  const services = getViewerRuntimeServices(runtime)
  const owner = `modeling:${parsed.plan.planId}`
  try {
    services.moleculeStore.getState().runTransaction(owner, () => {
      const currentContext = createModelingContext(
        services.moleculeStore.getState(),
        services.editorStore.getState(),
      )
      const currentTarget = currentContext.objects.find(
        object => object.objectId === parsed.plan.targetObjectId,
      )
      if (!currentTarget || currentTarget.revision !== result.baseRevision) {
        throw new Error('提交前目标结构发生变化，请基于最新上下文重新规划')
      }
      services.moleculeStore.getState().commitEditResult(
        editChanged(result.molecule),
        { selectionPolicy: 'preserve', bumpAtomPositionVersion: true },
      )
    })
  } catch (error) {
    return commitFailure(result, {
      severity: 'error',
      code: 'command-failed',
      message: error instanceof Error ? error.message : '建模事务提交失败',
    })
  }

  return {
    ...result,
    committed: true,
    transactionId: parsed.plan.planId,
  }
}
