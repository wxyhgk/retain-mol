import { create } from 'zustand'

export type GeometryOptimizationKind = 'forcefield' | 'xtb'

interface OptimizationTaskState {
  taskId: number | null
  activeKind: GeometryOptimizationKind | null
  message: string
}

export const useOptimizationTaskStore = create<OptimizationTaskState>(() => ({
  taskId: null,
  activeKind: null,
  message: '',
}))

let nextTaskId = 0

export function beginOptimizationTask(
  kind: GeometryOptimizationKind,
  message: string,
): number | null {
  if (useOptimizationTaskStore.getState().activeKind) return null
  const taskId = ++nextTaskId
  useOptimizationTaskStore.setState({ taskId, activeKind: kind, message })
  return taskId
}

export function reportOptimizationTask(taskId: number, message: string) {
  if (useOptimizationTaskStore.getState().taskId !== taskId) return
  useOptimizationTaskStore.setState({ message })
}

export function finishOptimizationTask(taskId: number, message: string) {
  if (useOptimizationTaskStore.getState().taskId !== taskId) return
  useOptimizationTaskStore.setState({ taskId: null, activeKind: null, message })
}
