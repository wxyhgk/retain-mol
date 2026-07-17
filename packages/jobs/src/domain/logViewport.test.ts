import { describe, expect, it } from 'vitest'
import { isNearBottom } from './logViewport'

describe('logViewport', () => {
  it('treats positions within the threshold as bottom', () => {
    expect(isNearBottom(0, 100, 100)).toBe(true)
    expect(isNearBottom(880, 100, 1000)).toBe(true)
    expect(isNearBottom(877, 100, 1000)).toBe(true)
  })

  it('treats positions beyond the threshold as scrolled away', () => {
    expect(isNearBottom(876, 100, 1000)).toBe(false)
    expect(isNearBottom(0, 100, 1000)).toBe(false)
  })

  it('honors a custom threshold', () => {
    expect(isNearBottom(800, 100, 1000, 200)).toBe(true)
    expect(isNearBottom(700, 100, 1000, 200)).toBe(false)
  })
})
