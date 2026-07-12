import { beforeEach, describe, expect, it } from 'vitest'
import { useUiThemeStore } from './uiThemeStore'

describe('uiThemeStore', () => {
  beforeEach(() => useUiThemeStore.setState({ theme: 'day' }))

  it('uses the day theme by default and toggles both ways', () => {
    expect(useUiThemeStore.getState().theme).toBe('day')
    useUiThemeStore.getState().toggleTheme()
    expect(useUiThemeStore.getState().theme).toBe('night')
    useUiThemeStore.getState().toggleTheme()
    expect(useUiThemeStore.getState().theme).toBe('day')
  })
})
