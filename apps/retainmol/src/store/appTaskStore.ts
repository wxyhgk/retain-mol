import { create } from 'zustand'

export interface AppTask {
  readonly id: number
  readonly owner: string
  readonly message: string
}

interface AppTaskState {
  readonly tasks: readonly AppTask[]
}

export const useAppTaskStore = create<AppTaskState>(() => ({ tasks: [] }))

let nextTaskId = 0

export function beginAppTask(owner: string, message: string): number {
  const id = ++nextTaskId
  useAppTaskStore.setState(state => ({
    tasks: [...state.tasks, { id, owner, message }],
  }))
  return id
}

export function updateAppTask(id: number, message: string) {
  useAppTaskStore.setState(state => ({
    tasks: state.tasks.map(task => task.id === id ? { ...task, message } : task),
  }))
}

export function endAppTask(id: number) {
  useAppTaskStore.setState(state => ({
    tasks: state.tasks.filter(task => task.id !== id),
  }))
}

export const selectAppBusyMessage = (state: AppTaskState) =>
  state.tasks.at(-1)?.message ?? null

export const selectHasAppTasks = (state: AppTaskState) => state.tasks.length > 0
