import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MoleculeCard, type MoleculeCardVariant } from './MoleculeCard'

const VARIANTS: MoleculeCardVariant[] = ['row', 'tile', 'node', 'plaque']

describe('MoleculeCard', () => {
  it('renders title, status, kind, meta and actions in every variant', () => {
    for (const variant of VARIANTS) {
      const html = renderToStaticMarkup(
        <MoleculeCard
          variant={variant}
          title="反应物优化"
          status={<span data-slot="status">运行中</span>}
          kind={<span data-slot="kind">xTB</span>}
          meta={<span data-slot="meta">GFN2</span>}
          actions={<span data-slot="actions">查看</span>}
        />,
      )
      for (const slot of ['status', 'kind', 'meta', 'actions']) {
        expect(html, `${variant} 缺 ${slot}`).toContain(`data-slot="${slot}"`)
      }
      expect(html).toContain('反应物优化')
    }
  })

  it('shows the visual slot except in plaque', () => {
    const withVisual = (variant: MoleculeCardVariant) =>
      renderToStaticMarkup(<MoleculeCard variant={variant} title="t" visual={<i data-slot="visual" />} />)
    expect(withVisual('row')).toContain('data-slot="visual"')
    expect(withVisual('tile')).toContain('data-slot="visual"')
    expect(withVisual('node')).toContain('data-slot="visual"')
    expect(withVisual('plaque')).not.toContain('data-slot="visual"')
  })

  it('becomes a button when onClick is provided', () => {
    const clickable = renderToStaticMarkup(<MoleculeCard title="t" onClick={() => {}} />)
    expect(clickable).toContain('<button')
    const static1 = renderToStaticMarkup(<MoleculeCard title="t" />)
    expect(static1).not.toContain('<button')
  })
})
