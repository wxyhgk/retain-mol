import { create } from 'zustand'

export interface ComputeJob {
  id: string
  typeId: string
  typeLabel: string
  backendId: string
  backendLabel: string
  status: 'running' | 'done' | 'error'
  progress?: { step: number; message?: string }
  result?: Record<string, unknown>
  error?: string
  createdAt: number
  objectId: string
}

interface ComputeState {
  jobs: ComputeJob[]
  activeJobId: string | null

  startJob: (params: Omit<ComputeJob, 'id' | 'status' | 'createdAt'>) => string
  updateProgress: (id: string, progress: ComputeJob['progress']) => void
  finishJob: (id: string, result: Record<string, unknown>) => void
  failJob: (id: string, error: string) => void
  setActiveJob: (id: string | null) => void
  removeJob: (id: string) => void
}

export const useComputeStore = create<ComputeState>(set => ({
  jobs: [],
  activeJobId: null,

  startJob: (params) => {
    const id = crypto.randomUUID().slice(0, 8)
    set(s => ({
      jobs: [{ ...params, id, status: 'running' as const, createdAt: Date.now() }, ...s.jobs].slice(0, 30),
      activeJobId: id,
    }))
    return id
  },

  updateProgress: (id, progress) =>
    set(s => ({ jobs: s.jobs.map(j => j.id === id ? { ...j, progress } : j) })),

  finishJob: (id, result) =>
    set(s => ({ jobs: s.jobs.map(j => j.id === id ? { ...j, status: 'done' as const, result, progress: undefined } : j) })),

  failJob: (id, error) =>
    set(s => ({ jobs: s.jobs.map(j => j.id === id ? { ...j, status: 'error' as const, error, progress: undefined } : j) })),

  setActiveJob: (activeJobId) => set({ activeJobId }),

  removeJob: (id) =>
    set(s => ({
      jobs: s.jobs.filter(j => j.id !== id),
      activeJobId: s.activeJobId === id ? null : s.activeJobId,
    })),
}))
