import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { BondPalette } from './BondPalette'

describe('BondPalette', () => {
  it('shows connect, direct bond-order, and delete controls for the current selection', () => {
    const html = renderToStaticMarkup(createElement(BondPalette, {
      selectedAtomCount: 2,
      selectedBond: {
        id: 'b1',
        order: 2,
        atomSymbols: ['C', 'N'],
      },
      onConnectSelectedAtoms: vi.fn(),
      onSetBondOrder: vi.fn(),
      onDeleteSelectedBond: vi.fn(),
    }))

    expect(html).toContain('连接两个已选原子')
    expect(html).toContain('C - N')
    expect(html).toContain('aria-label="设为单键"')
    expect(html).toContain('aria-label="设为双键"')
    expect(html).toContain('aria-label="设为三键"')
    expect(html).toMatch(/aria-label="设为双键"[^>]*aria-pressed="true"/)
    expect(html).toContain('删除选中键')
  })
})
