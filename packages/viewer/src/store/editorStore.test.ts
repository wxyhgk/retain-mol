import { beforeEach, describe, expect, it } from 'vitest'
import { useEditorStore } from './editorStore'

describe('editorStore brush state', () => {
  beforeEach(() => {
    useEditorStore.setState({
      activeTool: 'select',
      activeElement: 'C',
      activeFragmentId: 'c-sp3',
      brushArmed: true,
    })
  })

  it('preserves the selected fragment while switching through selection mode', () => {
    useEditorStore.getState().disarmBrush()

    expect(useEditorStore.getState()).toMatchObject({
      activeFragmentId: 'c-sp3',
      brushArmed: false,
    })

    useEditorStore.getState().armBrush()

    expect(useEditorStore.getState()).toMatchObject({
      activeFragmentId: 'c-sp3',
      brushArmed: true,
    })
  })
})
