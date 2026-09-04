import type * as React from 'react'

export type TableSortDirection = false | 'asc' | 'desc'

export function sortAriaValue(
  direction: TableSortDirection,
): React.AriaAttributes['aria-sort'] {
  if (direction === 'asc') return 'ascending'
  if (direction === 'desc') return 'descending'
  return 'none'
}
