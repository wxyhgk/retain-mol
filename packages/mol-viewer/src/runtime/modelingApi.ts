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
} from './ViewerRuntime'

/** Read-only, serializable snapshot intended for AI planners and collaboration clients. */
export function getModelingContext(
  runtime: ViewerRuntime = defaultViewerRuntime,
): ModelingContext {
  const services = getViewerRuntimeServices(runtime)
  const editorState = services.editorStore.getState()
  return createModelingContext(
    services.moleculeStore.getState(),
    {
      tool: editorState.activeTool,
      brushArmed: editorState.brushArmed,
      activeElement: editorState.activeElement,
      atomClickMode: editorState.atomClickMode,
      activeFragmentId: editorState.activeFragmentId,
    },
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
      const currentContext = getModelingContext(runtime)
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
