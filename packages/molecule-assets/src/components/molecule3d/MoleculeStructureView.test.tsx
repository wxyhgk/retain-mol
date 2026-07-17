import { beforeEach, describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { newAtom, newBond } from '@retainmol/mol-viewer/core'
import type { Molecule } from '@retainmol/mol-viewer/core'
import { MoleculeStructureView } from './MoleculeStructureView'
import { reset3DPoolForTest } from './molecule3dPool'

function water(): Molecule {
  const o = newAtom('O', 0, 0, 0)
  const h1 = newAtom('H', 0.96, 0, 0)
  const h2 = newAtom('H', -0.24, 0.93, 0)
  return { name: 'water', atoms: [o, h1, h2], bonds: [newBond(o.id, h1.id, 1), newBond(o.id, h2.id, 1)] }
}

describe('MoleculeStructureView', () => {
  beforeEach(() => reset3DPoolForTest())

  it('defaults to 2D skeletal view with toggle buttons', () => {
    const html = renderToStaticMarkup(<MoleculeStructureView molecule={water()} />)
    expect(html).toContain('<svg')
    expect(html).toContain('>2D<')
    expect(html).toContain('>3D<')
    expect(html).not.toContain('<canvas')
  })

  it('prefers the poster image when provided', () => {
    const html = renderToStaticMarkup(<MoleculeStructureView molecule={water()} posterUrl="/p.png" />)
    expect(html).toContain('src="/p.png"')
    expect(html).not.toContain('<svg')
  })

  it('hides the toggle when not toggleable', () => {
    const html = renderToStaticMarkup(<MoleculeStructureView molecule={water()} toggleable={false} />)
    expect(html).not.toContain('>3D<')
  })
})
