import { beforeEach, describe, expect, it } from 'vitest'
import {
  beginOptimizationTask,
  finishOptimizationTask,
  reportOptimizationTask,
  useOptimizationTaskStore,
} from './optimizationTaskStore'

describe('optimizationTaskStore', () => {
  beforeEach(() => {
    useOptimizationTaskStore.setState({ taskId: null, activeKind: null, message: '' })
  })

  it('allows only one optimization task at a time', () => {
    const first = beginOptimizationTask('xtb', 'starting')
    expect(first).not.toBeNull()
    expect(beginOptimizationTask('forcefield', 'blocked')).toBeNull()
  })

  it('ignores progress and completion from a stale task', () => {
    const taskId = beginOptimizationTask('xtb', 'starting')!
    reportOptimizationTask(taskId + 1, 'stale progress')
    finishOptimizationTask(taskId + 1, 'stale result')
    expect(useOptimizationTaskStore.getState()).toMatchObject({
      activeKind: 'xtb',
      message: 'starting',
    })

    reportOptimizationTask(taskId, 'step 2')
    finishOptimizationTask(taskId, 'done')
    expect(useOptimizationTaskStore.getState()).toMatchObject({
      activeKind: null,
      message: 'done',
    })
  })
})
