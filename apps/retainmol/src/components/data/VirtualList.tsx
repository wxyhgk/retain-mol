import * as React from 'react'
import { Virtuoso } from 'react-virtuoso'

import { cn } from '@/lib/utils'

export interface VirtualListProps<TItem> {
  /** A concise accessible name for the list. */
  label: string
  items: readonly TItem[]
  renderItem: (item: TItem, index: number) => React.ReactNode
  getItemKey?: (item: TItem, index: number) => React.Key
  emptyContent?: React.ReactNode
  className?: string
  itemClassName?: string
  style?: React.CSSProperties
  height?: React.CSSProperties['height']
  overscan?: number
  initialTopMostItemIndex?: number
  endReached?: (index: number) => void
  isScrollingChanged?: (isScrolling: boolean) => void
}

export function VirtualList<TItem>({
  label,
  items,
  renderItem,
  getItemKey,
  emptyContent = 'No items.',
  className,
  itemClassName,
  style,
  height = 320,
  overscan = 160,
  initialTopMostItemIndex,
  endReached,
  isScrollingChanged,
}: VirtualListProps<TItem>) {
  const stableItems = React.useMemo(() => [...items], [items])

  if (items.length === 0) {
    return (
      <div
        aria-label={label}
        className={cn('flex items-center justify-center text-sm text-muted-foreground', className)}
        role="list"
        style={{ height, ...style }}
      >
        <div role="status">{emptyContent}</div>
      </div>
    )
  }

  return (
    <div
      aria-label={label}
      className={cn('min-h-0 w-full overflow-hidden', className)}
      role="list"
      style={{ height, ...style }}
    >
      <Virtuoso
        className="h-full w-full"
        computeItemKey={getItemKey
          ? (index, item) => getItemKey(item, index)
          : undefined}
        data={stableItems}
        endReached={endReached}
        initialTopMostItemIndex={initialTopMostItemIndex}
        isScrolling={isScrollingChanged}
        itemContent={(index, item) => (
          <div className={itemClassName} role="listitem">
            {renderItem(item, index)}
          </div>
        )}
        overscan={overscan}
      />
    </div>
  )
}
