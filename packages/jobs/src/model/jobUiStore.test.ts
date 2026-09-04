import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_JOB_LIST_FILTER } from '../domain/jobFilter'
import { useJobUiStore } from './jobUiStore'

describe('jobUiStore', () => {
  beforeEach(() => {
    useJobUiStore.setState({ selectedJobId: null, listView: 'cards', centerView: 'table', listFilter: DEFAULT_JOB_LIST_FILTER })
  })

  it('starts with an empty all-bucket filter', () => {
    expect(useJobUiStore.getState().listFilter).toEqual({ query: '', bucket: 'all' })
  })

  it('switches the platform center view independently of the sidebar list view', () => {
    useJobUiStore.getState().setCenterView('shelf')
    expect(useJobUiStore.getState().centerView).toBe('shelf')
    expect(useJobUiStore.getState().listView).toBe('cards')
  })

  it('merges partial filter updates without clobbering the other half', () => {
    const { setListFilter } = useJobUiStore.getState()
    setListFilter({ query: 'benzene' })
    expect(useJobUiStore.getState().listFilter).toEqual({ query: 'benzene', bucket: 'all' })
    setListFilter({ bucket: 'active' })
    expect(useJobUiStore.getState().listFilter).toEqual({ query: 'benzene', bucket: 'active' })
  })

  it('keeps the selection untouched when the filter changes', () => {
    const { selectJob, setListFilter } = useJobUiStore.getState()
    selectJob('job-1')
    setListFilter({ bucket: 'succeeded' })
    expect(useJobUiStore.getState().selectedJobId).toBe('job-1')
  })
})
