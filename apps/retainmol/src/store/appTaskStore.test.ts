import { beforeEach, describe, expect, it } from 'vitest'
import {
  beginAppTask,
  endAppTask,
  selectAppBusyMessage,
  updateAppTask,
  useAppTaskStore,
} from './appTaskStore'

describe('appTaskStore', () => {
  beforeEach(() => useAppTaskStore.setState({ tasks: [] }))

  it('only updates and ends the task identified by its token', () => {
    const first = beginAppTask('placement', 'first')
    const second = beginAppTask('placement', 'second')

    updateAppTask(first, 'first updated')
    endAppTask(first)

    expect(useAppTaskStore.getState().tasks).toEqual([
      { id: second, owner: 'placement', message: 'second' },
    ])
  })

  it('reveals the previous task after the latest task ends', () => {
    const first = beginAppTask('placement', 'distance geometry')
    const second = beginAppTask('optimization', 'xTB')
    expect(selectAppBusyMessage(useAppTaskStore.getState())).toBe('xTB')

    endAppTask(second)
    expect(selectAppBusyMessage(useAppTaskStore.getState())).toBe('distance geometry')
    endAppTask(first)
    expect(selectAppBusyMessage(useAppTaskStore.getState())).toBeNull()
  })
})
