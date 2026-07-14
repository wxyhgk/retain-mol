import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { AsyncBoundary } from './AsyncBoundary'
import { didResetKeysChange } from './asyncBoundaryReset'
import { ChartFrame } from './ChartFrame'
import { DataTable } from './DataTable'
import { FileDropzone } from './FileDropzone'
import { VirtualList } from './VirtualList'
import { sortAriaValue } from './dataTableAccessibility'

describe('data component accessibility', () => {
  it('maps table sorting state to aria-sort values', () => {
    expect(sortAriaValue(false)).toBe('none')
    expect(sortAriaValue('asc')).toBe('ascending')
    expect(sortAriaValue('desc')).toBe('descending')
  })

  it('renders a labelled native table and its rows', () => {
    type Item = { name: string }
    const markup = renderToStaticMarkup(createElement(DataTable<Item>, {
      label: 'Items',
      columns: [{ accessorKey: 'name', header: 'Name' }],
      data: [{ name: 'Alpha' }],
    }))

    expect(markup).toContain('<table aria-label="Items"')
    expect(markup).toContain('scope="col"')
    expect(markup).toContain('Alpha')
  })

  it('applies client-side sorting through the TanStack sorted row model', () => {
    type Item = { name: string }
    const markup = renderToStaticMarkup(createElement(DataTable<Item>, {
      label: 'Sorted items',
      columns: [{ accessorKey: 'name', header: 'Name' }],
      data: [{ name: 'Beta' }, { name: 'Alpha' }],
      tableOptions: { initialState: { sorting: [{ id: 'name', desc: false }] } },
    }))

    expect(markup.indexOf('Alpha')).toBeLessThan(markup.indexOf('Beta'))
    expect(markup).toContain('aria-sort="ascending"')
  })

  it('renders an accessible empty virtual list', () => {
    const markup = renderToStaticMarkup(createElement(VirtualList<string>, {
      label: 'Results',
      items: [],
      renderItem: (item) => item,
    }))

    expect(markup).toContain('role="list"')
    expect(markup).toContain('aria-label="Results"')
    expect(markup).toContain('role="status"')
  })

  it('renders a keyboard-addressable file input target', () => {
    const markup = renderToStaticMarkup(createElement(FileDropzone, {
      label: 'Select files',
      description: 'Text files only',
      onDrop: vi.fn(),
    }))

    expect(markup).toContain('role="button"')
    expect(markup).toContain('aria-label="Select files"')
    expect(markup).toContain('type="file"')
    expect(markup).toContain('Text files only')
  })

  it('associates chart title, description, and text alternative', () => {
    const markup = renderToStaticMarkup(createElement(ChartFrame, {
      title: 'Distribution',
      description: 'Last 30 days',
      accessibleSummary: 'Values range from 1 to 8.',
      children: createElement('div', null, 'chart'),
    }))

    expect(markup).toContain('<figure aria-labelledby=')
    expect(markup).toContain('aria-describedby=')
    expect(markup).toContain('Distribution')
    expect(markup).toContain('Values range from 1 to 8.')
  })
})

describe('AsyncBoundary', () => {
  it('renders resolved children', () => {
    const markup = renderToStaticMarkup(createElement(
      AsyncBoundary,
      null,
      createElement('span', null, 'Ready'),
    ))

    expect(markup).toContain('Ready')
  })

  it('detects reset key changes with Object.is semantics', () => {
    expect(didResetKeysChange([1, 'a'], [1, 'a'])).toBe(false)
    expect(didResetKeysChange([Number.NaN], [Number.NaN])).toBe(false)
    expect(didResetKeysChange([0], [-0])).toBe(true)
    expect(didResetKeysChange([1], [1, 2])).toBe(true)
  })
})
