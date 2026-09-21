import { describe, expect, it } from 'vitest'
import { newAtom, newBond } from '../../molecule'
import {
  getGrowGuideGeometry,
  getGrowPreviewGeometry,
} from './growPreview'

describe('getGrowPreviewGeometry', () => {
  it('returns a preview for an unsaturated atom', () => {
    const c = newAtom('C', 0, 0, 0)

    const preview = getGrowPreviewGeometry({ atoms: [c], bonds: [] }, {
      sourceId: c.id,
      activeElement: 'C',
      cursorLocal: { x: 1, y: 0, z: 0 },
      freeDirection: false,
    })

    expect(preview).not.toBeNull()
    expect(preview?.symbol).toBe('C')
    expect(preview).not.toHaveProperty('color')
    expect(preview).not.toHaveProperty('radius')
  })

  it('uses bonded H slots as fixed growth previews and ignores H-on-H growth', () => {
    const c = newAtom('C', 0, 0, 0)
    const h = newAtom('H', 1.09, 0, 0)
    const mol = { atoms: [c, h], bonds: [newBond(c.id, h.id)] }

    const preview = getGrowPreviewGeometry(mol, {
      sourceId: h.id,
      activeElement: 'C',
      cursorLocal: { x: 9, y: 9, z: 9 },
      freeDirection: false,
    })

    expect(preview).not.toBeNull()
    expect(preview?.pos.x).not.toBe(9)
    expect(getGrowPreviewGeometry(mol, {
      sourceId: h.id,
      activeElement: 'H',
      cursorLocal: { x: 9, y: 9, z: 9 },
      freeDirection: false,
    })).toBeNull()
  })
})

describe('getGrowGuideGeometry', () => {
  it('returns guide geometry for an unsaturated atom', () => {
    const c = newAtom('C', 0, 0, 0)
    const h = newAtom('H', 1.09, 0, 0)

    const guide = getGrowGuideGeometry({ atoms: [c, h], bonds: [newBond(c.id, h.id)] }, {
      sourceId: c.id,
      activeElement: 'C',
    })

    expect(guide).not.toBeNull()
  })

  it('does not return guide geometry for bonded H slots', () => {
    const c = newAtom('C', 0, 0, 0)
    const h = newAtom('H', 1.09, 0, 0)

    expect(getGrowGuideGeometry({ atoms: [c, h], bonds: [newBond(c.id, h.id)] }, {
      sourceId: h.id,
      activeElement: 'C',
    })).toBeNull()
  })
})
