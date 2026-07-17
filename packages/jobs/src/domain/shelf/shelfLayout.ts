/**
 * 展柜「墙面」网格布局：所有盒子同深度（不互相遮挡），
 * 列沿屏幕水平方向（每行居中），行沿垂直方向从上到下。
 */
export const SHELF = {
  /** 玻璃盒边长（世界单位） */
  boxSize: 2.6,
  /** 分子可用半径（盒内留白后的半边长） */
  innerHalfExtent: 0.95,
  /** 列间距：盒子 corner-on 水平投影 ~3.7 + 余量 */
  colPitch: 4.6,
  /** 行间距：盒子投影高 ~3.6 + 展签空间 */
  rowPitch: 6.4,
  /** 目标屏幕单元宽（px），用于推导列数 */
  cellPx: 270,
} as const

export interface ShelfSlot {
  jobId: string
  row: number
  col: number
  /** 沿屏幕水平轴的偏移（世界单位，行内居中） */
  x: number
  /** 沿世界 Y 的偏移（行向下为负） */
  y: number
}

export function shelfColumns(containerWidthPx: number): number {
  return Math.min(6, Math.max(1, Math.floor(containerWidthPx / SHELF.cellPx)))
}

export function layoutShelf(jobIds: readonly string[], columns: number): ShelfSlot[] {
  const cols = Math.max(1, columns)
  const slots: ShelfSlot[] = []
  jobIds.forEach((jobId, index) => {
    const row = Math.floor(index / cols)
    const col = index % cols
    const rowWidth = Math.min(cols, jobIds.length - row * cols)
    slots.push({
      jobId,
      row,
      col,
      // 每行独立居中：孤儿行也落在中轴上；`|| 0` 消掉 row=0 时的 -0
      x: (col - (rowWidth - 1) / 2) * SHELF.colPitch || 0,
      y: -(row * SHELF.rowPitch) || 0,
    })
  })
  return slots
}

export function shelfRowCount(count: number, columns: number): number {
  return count <= 0 ? 0 : Math.ceil(count / Math.max(1, columns))
}

/** 滚动偏移（世界单位，沿行方向）夹取：内容不足一屏时锁 0。 */
export function clampScroll(offset: number, rows: number, visibleRows: number): number {
  const maxOffset = Math.max(0, (rows - visibleRows) * SHELF.rowPitch)
  return Math.min(maxOffset, Math.max(0, offset))
}
