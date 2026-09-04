import { describe, expect, it } from 'vitest'
import { ROW_SCREEN_FACTOR, WORLD_PER_PX, initialRowOffset, visibleRowsForHeight } from './shelfCamera'
import { SHELF } from '../../../domain/shelf/shelfLayout'

describe('shelfCamera', () => {
  it('derives visible rows from the compressed row pitch', () => {
    const rowScreenPx = (SHELF.rowPitch * ROW_SCREEN_FACTOR) / WORLD_PER_PX
    expect(visibleRowsForHeight(rowScreenPx * 3 + 1)).toBe(3)
    expect(visibleRowsForHeight(rowScreenPx - 1)).toBe(1)
    expect(visibleRowsForHeight(0)).toBe(1)
  })

  it('anchors the first row near the viewport top and never below center', () => {
    expect(initialRowOffset(0)).toBe(0)
    const offset = initialRowOffset(800)
    expect(offset).toBeGreaterThan(0)
    // 换算回屏幕像素后应小于半屏
    expect(offset * ROW_SCREEN_FACTOR / WORLD_PER_PX).toBeLessThan(400)
  })
})
