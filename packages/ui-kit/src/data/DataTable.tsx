import * as React from 'react'
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type ColumnDef,
  type Row,
  type SortDirection,
  type TableOptions,
  useReactTable,
} from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react'

import { cn } from '../utils'
import { sortAriaValue } from './dataTableAccessibility'

type ForwardedTableOptions<TData> = Omit<
  TableOptions<TData>,
  'columns' | 'data' | 'getCoreRowModel' | 'getSortedRowModel'
>

export type DataTableColumn<TData> = ColumnDef<TData>

export interface DataTableProps<TData>
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** A concise accessible name for the table. */
  label: string
  columns: ReadonlyArray<ColumnDef<TData>>
  data: readonly TData[]
  tableOptions?: ForwardedTableOptions<TData>
  emptyContent?: React.ReactNode
  isLoading?: boolean
  loadingRowCount?: number
  onRowClick?: (row: Row<TData>) => void
  getRowClassName?: (row: Row<TData>) => string | undefined
  sortLabel?: (columnId: string, direction: false | SortDirection) => string
  tableClassName?: string
}

function SortIcon({ direction }: { direction: false | SortDirection }) {
  const Icon = direction === 'asc'
    ? ArrowUp
    : direction === 'desc'
      ? ArrowDown
      : ChevronsUpDown

  return <Icon aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground" />
}

export function DataTable<TData>({
  label,
  columns,
  data,
  tableOptions,
  emptyContent = 'No results.',
  isLoading = false,
  loadingRowCount = 5,
  onRowClick,
  getRowClassName,
  sortLabel = (columnId, direction) => {
    if (direction === 'asc') return `Sort ${columnId} descending`
    if (direction === 'desc') return `Clear sorting for ${columnId}`
    return `Sort ${columnId} ascending`
  },
  className,
  tableClassName,
  ...containerProps
}: DataTableProps<TData>) {
  const stableColumns = React.useMemo(() => [...columns], [columns])
  const stableData = React.useMemo(() => [...data], [data])

  // TanStack Table intentionally returns stateful callbacks that React Compiler cannot memoize.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    getSortedRowModel: getSortedRowModel(),
    ...tableOptions,
    columns: stableColumns,
    data: stableData,
    getCoreRowModel: getCoreRowModel(),
  })
  const visibleColumnCount = Math.max(table.getVisibleLeafColumns().length, 1)
  const rows = table.getRowModel().rows

  return (
    <div
      className={cn('relative w-full overflow-auto rounded-md border border-border bg-background', className)}
      {...containerProps}
    >
      <table
        aria-busy={isLoading || undefined}
        aria-label={label}
        className={cn('w-full caption-bottom text-sm', tableClassName)}
      >
        <thead className="border-b border-border bg-muted/40">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const direction = header.column.getIsSorted()
                const canSort = header.column.getCanSort()

                return (
                  <th
                    key={header.id}
                    aria-sort={canSort ? sortAriaValue(direction) : undefined}
                    className="h-10 px-3 text-left align-middle text-xs font-medium text-muted-foreground"
                    colSpan={header.colSpan}
                    scope="col"
                  >
                    {header.isPlaceholder ? null : canSort ? (
                      <button
                        type="button"
                        className="inline-flex min-h-8 max-w-full items-center gap-1.5 rounded-sm text-left outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                        aria-label={sortLabel(header.column.id, direction)}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <span className="min-w-0 truncate">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </span>
                        <SortIcon direction={direction} />
                      </button>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </th>
                )
              })}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-border">
          {isLoading ? (
            Array.from({ length: Math.max(1, loadingRowCount) }, (_, rowIndex) => (
              <tr key={`loading-${rowIndex}`} aria-hidden="true">
                {Array.from({ length: visibleColumnCount }, (_, cellIndex) => (
                  <td key={cellIndex} className="h-11 px-3">
                    <span className="block h-3.5 w-full max-w-32 animate-pulse rounded bg-muted" />
                  </td>
                ))}
              </tr>
            ))
          ) : rows.length > 0 ? (
            rows.map((row) => (
              <tr
                key={row.id}
                className={cn(
                  'transition-colors hover:bg-muted/40',
                  onRowClick && 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
                  getRowClassName?.(row),
                )}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                onKeyDown={onRowClick
                  ? (event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        onRowClick(row)
                      }
                    }
                  : undefined}
                tabIndex={onRowClick ? 0 : undefined}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="h-11 px-3 align-middle text-foreground">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td className="h-24 px-3 text-center text-sm text-muted-foreground" colSpan={visibleColumnCount}>
                {emptyContent}
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {isLoading && (
        <span className="sr-only" role="status" aria-live="polite">
          Loading
        </span>
      )}
    </div>
  )
}
