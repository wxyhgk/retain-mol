import { create } from 'zustand'
import { DEFAULT_JOB_LIST_FILTER, type JobListFilter } from '../domain/jobFilter'

export type JobListView = 'cards' | 'table'
/** 平台任务中心的主体视图（与编辑器侧栏的 listView 是两个概念）。 */
export type JobCenterView = 'table' | 'shelf'

interface JobUiState {
  selectedJobId: string | null
  listView: JobListView
  centerView: JobCenterView
  listFilter: JobListFilter
  selectJob(jobId: string | null): void
  setListView(view: JobListView): void
  setCenterView(view: JobCenterView): void
  setListFilter(filter: Partial<JobListFilter>): void
}

export const useJobUiStore = create<JobUiState>(set => ({
  selectedJobId: null,
  listView: 'cards',
  centerView: 'table',
  listFilter: DEFAULT_JOB_LIST_FILTER,
  selectJob: selectedJobId => set({ selectedJobId }),
  setListView: listView => set({ listView }),
  setCenterView: centerView => set({ centerView }),
  setListFilter: filter => set(state => ({ listFilter: { ...state.listFilter, ...filter } })),
}))
