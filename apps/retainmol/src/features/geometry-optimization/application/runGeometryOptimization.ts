import { useEditorStore } from '@/domain/viewer/editorState'
import {
  beginAppTask,
  endAppTask,
  selectHasAppTasks,
  updateAppTask,
  useAppTaskStore,
} from '@/store/appTaskStore'
import {
  optimizeActiveWithForceField,
  refineActiveWithGfn2Xtb,
  type GeometryOptimizationOutcome,
} from './geometryOptimizationService'
import {
  beginOptimizationTask,
  finishOptimizationTask,
  reportOptimizationTask,
  type GeometryOptimizationKind,
} from '../model/optimizationTaskStore'

const RUNNING_MESSAGE: Record<GeometryOptimizationKind, string> = {
  forcefield: '正在运行 MMFF94 / UFF…',
  xtb: '正在运行 GFN2-xTB…',
}

export async function runGeometryOptimization(
  kind: GeometryOptimizationKind,
): Promise<GeometryOptimizationOutcome | null> {
  if (selectHasAppTasks(useAppTaskStore.getState())) return null
  const runningMessage = RUNNING_MESSAGE[kind]
  const taskId = beginOptimizationTask(kind, runningMessage)
  if (taskId === null) return null
  const appTaskId = beginAppTask('geometry-optimization', runningMessage)

  const report = (message: string) => {
    reportOptimizationTask(taskId, message)
    updateAppTask(appTaskId, message)
  }

  report(runningMessage)
  let outcome: GeometryOptimizationOutcome
  try {
    outcome = kind === 'forcefield'
      ? await optimizeActiveWithForceField()
      : await refineActiveWithGfn2Xtb(report)
  } catch (error) {
    outcome = {
      ok: false,
      message: `优化失败：${error instanceof Error ? error.message : '未知错误'}`,
    }
  } finally {
    endAppTask(appTaskId)
  }

  finishOptimizationTask(taskId, outcome.message)
  useEditorStore.getState().flashHint(outcome.message)
  return outcome
}
