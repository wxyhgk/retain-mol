import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { newAtom, newBond } from '@retainmol/mol-viewer/core'
import type { Molecule } from '@retainmol/mol-viewer/core'
import { Molecule2D } from './Molecule2D'

function ethanol(): Molecule {
  const c1 = newAtom('C', 0, 0, 0)
  const c2 = newAtom('C', 1.5, 0, 0)
  const o = newAtom('O', 2.2, 1.2, 0)
  return {
    name: 'ethanol',
    atoms: [c1, c2, o],
    bonds: [newBond(c1.id, c2.id, 1), newBond(c2.id, o.id, 1)],
  }
}

describe('Molecule2D', () => {
  it('renders an inline svg with an accessible name', () => {
    const html = renderToStaticMarkup(<Molecule2D molecule={ethanol()} />)
    expect(html).toContain('role="img"')
    expect(html).toContain('aria-label="ethanol"')
    expect(html).toContain('<svg')
    expect(html).toContain('currentColor')
  })

  it('renders two instances with distinct svg ids', () => {
    const mol = ethanol()
    const html = renderToStaticMarkup(
      <div>
        <Molecule2D molecule={mol} width={100} height={80} />
        <Molecule2D molecule={mol} width={100} height={80} />
      </div>,
    )
    const ids = [...html.matchAll(/id="(m2d[^"]*)"/g)].map(match => match[1])
    expect(new Set(ids).size).toBeGreaterThanOrEqual(2)
  })
})
