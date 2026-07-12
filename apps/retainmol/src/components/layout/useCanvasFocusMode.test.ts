import { describe, expect, it } from 'vitest'
import { isWorkspaceControlTarget } from './useCanvasFocusMode'

describe('isWorkspaceControlTarget', () => {
  it('treats floating panels and controls as workspace chrome', () => {
    const target = { closest: () => ({}) } as unknown as EventTarget
    expect(isWorkspaceControlTarget(target)).toBe(true)
  })

  it('allows the canvas surface to enter focus mode', () => {
    const target = { closest: () => null } as unknown as EventTarget
    expect(isWorkspaceControlTarget(target)).toBe(false)
    expect(isWorkspaceControlTarget(null)).toBe(false)
  })
})
