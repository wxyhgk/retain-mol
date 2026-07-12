import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { SidebarProvider } from '@/components/ui/sidebar'
import { ToolRail } from './ToolRail'

describe('ToolRail', () => {
  it('renders the structure-editing rail without the canvas Select and Draw modes', () => {
    const html = renderToStaticMarkup(createElement(
      SidebarProvider,
      null,
      createElement(ToolRail, {
        controller: {
          workspaceTool: 'bond',
          activeElement: 'C',
          activateTool: vi.fn(),
          inspectElement: vi.fn(),
        },
        onToggleInspector: vi.fn(),
      }),
    ))

    expect(html.match(/data-rail-tool=/g)).toHaveLength(8)
    const expected = [
      { tool: 'erase', label: 'Erase' },
      { tool: 'bond', label: 'Bond' },
      { tool: 'atom', label: 'Atom' },
      { tool: 'charge', label: 'Charge' },
      { tool: 'ring', label: 'Ring' },
      { tool: 'measure', label: 'Measure' },
      { tool: 'text', label: 'Text' },
      { tool: 'more', label: 'More' },
    ]
    for (const item of expected) {
      expect(html).toContain(`data-rail-tool="${item.tool}"`)
      expect(html).toContain(`aria-label="${item.label}"`)
    }
    expect(html).not.toContain('data-rail-tool="select"')
    expect(html).not.toContain('data-rail-tool="draw"')
    expect(html).toMatch(/data-rail-tool="bond"[^>]*aria-pressed="true"/)
  })
})
