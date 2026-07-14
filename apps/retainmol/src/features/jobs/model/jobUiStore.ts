import { create } from 'zustand'

export type JobListView = 'cards' | 'table'

interface JobUiState {
  selectedJobId: string | null
  listView: JobListView
  selectJob(jobId: string | null): void
  setListView(view: JobListView): void
}

export const useJobUiStore = create<JobUiState>(set => ({
  selectedJobId: null,
  listView: 'cards',
  selectJob: selectedJobId => set({ selectedJobId }),
  setListView: listView => set({ listView }),
}))
