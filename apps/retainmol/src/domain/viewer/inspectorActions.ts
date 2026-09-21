import { computeMoleculeRevision, commitEditPlan, type ModelingCommand } from '@retainmol/mol-viewer/modeling'
import { defaultViewerRuntime, getViewerApi } from '@retainmol/mol-viewer/runtime'
import { useMoleculeStore } from './moleculeState'
import { activateAppWorkspaceTool } from '../workspaceToolController'
import { selectAppBusyMessage, useAppTaskStore } from '@/store/appTaskStore'

/** Display numbers are labels only; commands always carry an object and entity ID. */
export interface InspectorTarget {
  readonly objectId: string
  readonly kind: 'atom' | 'bond'
  readonly id: string
  readonly revision: string
  readonly label: string
}

type Scene = ReturnType<typeof useMoleculeStore.getState>['objectsById']
export interface InspectorUndoToken {
  readonly target: InspectorTarget
  readonly before: Scene
  readonly after: Scene
  readonly historyEntry: unknown
}

export interface InspectorResult {
  readonly status: 'success' | 'noop' | 'rejected'
  readonly action: string
  readonly target: InspectorTarget
  readonly message: string
  readonly code?: string
  readonly undo?: InspectorUndoToken
}

export function inspectorBusyReason(): string | null {
  const tasks = useAppTaskStore.getState()
  if (tasks.tasks.length > 0) return selectAppBusyMessage(tasks) || '正在处理任务，请稍后重试'
  return !useMoleculeStore.temporal.getState().isTracking ? '正在编辑，请结束当前操作后重试' : null
}

function reject(target: InspectorTarget, action: string, code: string, message: string): InspectorResult {
  return { status: 'rejected', action, target, code, message }
}

function guard(target: InspectorTarget, action: string, editing: boolean): InspectorResult | null {
  const busy = inspectorBusyReason()
  if (busy) return reject(target, action, 'busy', busy)
  const state = useMoleculeStore.getState()
  const object = state.objectsById[target.objectId]
  if (!object) return reject(target, action, 'target-not-found', '目标分子已不存在，请重新选择')
  if (state.activeObjectId !== target.objectId) return reject(target, action, 'target-not-active', '活动分子已切换，请重新选择')
  if (!object.visible || (editing && object.locked)) return reject(target, action, 'object-not-editable', object.locked ? '分子已锁定' : '分子已隐藏')
  const entities = target.kind === 'atom' ? object.molecule.atoms : object.molecule.bonds
  if (!entities.some(entity => entity.id === target.id)) return reject(target, action, 'entity-not-found', '目标已删除，请重新选择')
  if (computeMoleculeRevision(object.molecule) !== target.revision) return reject(target, action, 'stale-context', '分子已变化，请基于当前列表重试')
  return null
}

export function selectInspectorTarget(target: InspectorTarget, focus = false): InspectorResult {
  const action = focus ? '选择并聚焦' : '选择'
  const failure = guard(target, action, false)
  if (failure) return failure
  activateAppWorkspaceTool('select')
  const api = getViewerApi(defaultViewerRuntime)
  api.selection.set(target.kind === 'atom' ? [target.id] : [], target.kind === 'bond' ? [target.id] : [])
  if (focus && !api.view.focusSelection()) {
    return reject(target, action, 'viewport-unavailable', '已选择目标，但 3D 视口尚未就绪，未移动相机')
  }
  return { status: 'success', action, target, message: focus ? '已选择目标并聚焦相机' : '已选择目标，相机位置保持不变' }
}

let nextEditId = 0
function commit(target: InspectorTarget, action: string, command: ModelingCommand): InspectorResult {
  const failure = guard(target, action, true)
  if (failure) return failure
  const before = useMoleculeStore.getState().objectsById
  const result = commitEditPlan({
    schemaVersion: 1, source: 'human', planId: `inspector-${++nextEditId}`,
    targetObjectId: target.objectId, expectedRevision: target.revision, commands: [command],
  })
  if (!result.ok) {
    const issue = result.issues.find(item => item.severity === 'error') ?? result.issues[0]
    return reject(target, action, issue?.code ?? 'command-failed', issue?.message ?? '编辑未提交')
  }
  if (!result.committed) return { status: 'noop', action, target, message: '值未变化，未新增撤销记录' }
  return {
    status: 'success', action, target,
    message: `已完成；影响 ${result.changes.updatedAtomIds.length} 个原子、${result.changes.updatedBondIds.length} 条键`,
    undo: {
      target, before, after: useMoleculeStore.getState().objectsById,
      historyEntry: useMoleculeStore.temporal.getState().pastStates.at(-1),
    },
  }
}

export function replaceInspectorAtom(target: InspectorTarget, symbol: string): InspectorResult {
  const action = `替换元素为 ${symbol}`
  if (target.kind !== 'atom') return reject(target, action, 'invalid-target', '替换元素需要原子目标')
  return commit(target, action, { kind: 'atom.replace', commandId: 'replace', atomId: target.id, symbol })
}

export function setInspectorBondOrder(target: InspectorTarget, order: 1 | 2 | 3): InspectorResult {
  const action = `设置键级为 ${order}`
  if (target.kind !== 'bond') return reject(target, action, 'invalid-target', '修改键级需要键目标')
  return commit(target, action, { kind: 'bond.setOrder', commandId: 'set-order', bondId: target.id, order })
}

/** A receipt may undo its own edit only while it is still the latest scene change. */
export function inspectorUndoReason(token: InspectorUndoToken): string | null {
  const busy = inspectorBusyReason()
  if (busy) return busy
  const state = useMoleculeStore.getState()
  const object = state.objectsById[token.target.objectId]
  if (state.activeObjectId !== token.target.objectId || !object?.visible || object.locked) return '目标已切换、隐藏或锁定'
  if (state.objectsById !== token.after || useMoleculeStore.temporal.getState().pastStates.at(-1) !== token.historyEntry || !token.historyEntry) {
    return '历史已变化，请使用工作区的撤销命令'
  }
  return null
}

export function undoInspectorEdit(token: InspectorUndoToken): InspectorResult {
  const reason = inspectorUndoReason(token)
  if (reason) return reject(token.target, '撤销本次编辑', 'undo-unavailable', reason)
  getViewerApi(defaultViewerRuntime).history.undo()
  if (useMoleculeStore.getState().objectsById !== token.before) return reject(token.target, '撤销本次编辑', 'undo-unconfirmed', '无法确认撤销结果，请检查当前分子')
  return { status: 'success', action: '撤销本次编辑', target: token.target, message: '已恢复本次编辑前的结构' }
}
