import { describe, expect, it } from 'vitest'
import { newAtom, newBond } from '../lib/molecule'
import { runGrowFromHydrogenCommand } from '../lib/builder/commands/atom'
import { resolveBuilderIntent } from '../lib/builder/commands/interaction'
import { getGrowGuideForIntent, getGrowPreviewForIntent } from './builderPreviewEffects'

function growIntent(activeElement: string) {
  return resolveBuilderIntent({
    activeTool: 'select', activeElement, atomClickMode: 'grow',
    activeFragmentId: null, brushArmed: true,
  })
}

describe('growth geometry and appearance composition', () => {
  it.each([
    ['C', 0.77 * 0.45, 0x404040],
    ['N', 0.75 * 0.45, 0x3050f8],
    ['O', 0.73 * 0.45, 0xff2020],
    ['F', 0.71 * 0.45, 0x90e050],
    ['Fe', 1.52 * 0.45, 0xe06633],
  ] as const)('keeps the %s H-slot ghost at the committed position with its existing style', (symbol, radius, color) => {
    const c = newAtom('C', 0, 0, 0)
    const h = newAtom('H', 1.09, 0, 0)
    const molecule = { atoms: [c, h], bonds: [newBond(c.id, h.id)] }
    const preview = getGrowPreviewForIntent(growIntent(symbol), molecule, {
      sourceId: h.id, cursorLocal: { x: 9, y: 9, z: 9 }, freeDirection: true,
    })
    const result = runGrowFromHydrogenCommand(molecule, h.id, symbol)
    expect(result.ok && result.changed).toBe(true)
    if (!result.ok || !result.changed) throw new Error('expected committed growth')
    const atom = result.molecule.atoms.find(atom => atom.id === h.id)!
    expect(preview).toEqual({ pos: { x: atom.x, y: atom.y, z: atom.z }, radius, color })
    expect(molecule.atoms[1]?.symbol).toBe('H')
  })

  it('retains a spatial ring radius while attaching the smaller ghost radius and color', () => {
    const c = newAtom('C', 0, 0, 0)
    const h = newAtom('H', 1.09, 0, 0)
    const molecule = { atoms: [c, h], bonds: [newBond(c.id, h.id)] }
    const intent = growIntent('O')
    const ring = getGrowGuideForIntent(intent, molecule, c.id)
    expect(ring?.kind).toBe('ring')
    if (ring?.kind !== 'ring') throw new Error('expected ring')
    expect(ring.radius).toBeGreaterThan(ring.ghostRadius)
    expect(ring.ghostRadius).toBeCloseTo(0.73 * 0.45)
    expect(ring.ghostColor).toBe(0xff2020)

    const points = getGrowGuideForIntent({
      ...intent, sketchPlane: { origin: [0, 0, 0], normal: [0, 0, 1] },
    }, molecule, c.id)
    expect(points?.kind).toBe('points')
    if (points?.kind !== 'points') throw new Error('expected plane intersections')
    expect(points.positions).toHaveLength(2)
    for (const point of points.positions) expect(point.z).toBeCloseTo(0)
    expect(points.ghostRadius).toBe(ring.ghostRadius)
    expect(points.ghostColor).toBe(ring.ghostColor)
  })
})
