import { describe, expect, it } from 'vitest'
import { SHELF, clampScroll, layoutShelf, shelfColumns, shelfRowCount } from './shelfLayout'

describe('shelfLayout', () => {
  it('derives clamped column counts from container width', () => {
    expect(shelfColumns(0)).toBe(1)
    expect(shelfColumns(SHELF.cellPx - 1)).toBe(1)
    expect(shelfColumns(SHELF.cellPx * 2)).toBe(2)
    expect(shelfColumns(10_000)).toBe(6)
  })

  it('lays out a wall grid: columns horizontal, rows stacked downward', () => {
    const slots = layoutShelf(['a', 'b', 'c', 'd', 'e', 'f', 'g'], 3)
    expect(slots).toHaveLength(7)
    expect(slots.at(0)).toMatchObject({ jobId: 'a', row: 0, col: 0, x: -SHELF.colPitch, y: 0 })
    expect(slots.at(1)).toMatchObject({ col: 1, x: 0 })
    expect(slots.at(3)).toMatchObject({ row: 1, y: -SHELF.rowPitch })
    // 第三行只有一个盒子，居中在 x=0
    expect(slots.at(6)).toMatchObject({ jobId: 'g', row: 2, col: 0, x: 0, y: -2 * SHELF.rowPitch })
  })

  it('handles empty and single-item lists', () => {
    expect(layoutShelf([], 3)).toEqual([])
    expect(layoutShelf(['solo'], 3).at(0)).toMatchObject({ x: 0, y: 0 })
    expect(shelfRowCount(0, 3)).toBe(0)
    expect(shelfRowCount(7, 3)).toBe(3)
  })

  it('clamps scroll to content that overflows the viewport', () => {
    expect(clampScroll(999, 2, 3)).toBe(0)
    expect(clampScroll(-5, 5, 2)).toBe(0)
    expect(clampScroll(999, 5, 2)).toBe(3 * SHELF.rowPitch)
    expect(clampScroll(SHELF.rowPitch, 5, 2)).toBe(SHELF.rowPitch)
  })
})
