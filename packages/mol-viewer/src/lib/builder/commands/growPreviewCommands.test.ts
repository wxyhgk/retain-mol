import { describe, expect, it } from 'vitest'
import { newAtom, newBond } from '../../molecule'
import {
  getGrowGuideCommand,
  getGrowPreviewCommand,
} from './growPreviewCommands'

describe('getGrowPreviewCommand', () => {
  it('returns a preview for an unsaturated atom', () => {
    const c = newAtom('C', 0, 0, 0)

    const preview = getGrowPreviewCommand({ atoms: [c], bonds: [] }, {
      sourceId: c.id,
      activeElement: 'C',
      cursorLocal: { x: 1, y: 0, z: 0 },
      freeDirection: false,
    })

    expect(preview).not.toBeNull()
    expect(preview?.radius).toBeGreaterThan(0)
  })

  it('uses bonded H slots as fixed growth previews and ignores H-on-H growth', () => {
    const c = newAtom('C', 0, 0, 0)
    const h = newAtom('H', 1.09, 0, 0)
    const mol = { atoms: [c, h], bonds: [newBond(c.id, h.id)] }

    const preview = getGrowPreviewCommand(mol, {
      sourceId: h.id,
      activeElement: 'C',
      cursorLocal: { x: 9, y: 9, z: 9 },
      freeDirection: false,
    })

    expect(preview).not.toBeNull()
    expect(preview?.pos.x).not.toBe(9)
    expect(getGrowPreviewCommand(mol, {
      sourceId: h.id,
      activeElement: 'H',
      cursorLocal: { x: 9, y: 9, z: 9 },
      freeDirection: false,
    })).toBeNull()
  })
})

describe('getGrowGuideCommand', () => {
  it('returns guide geometry for an unsaturated atom', () => {
    const c = newAtom('C', 0, 0, 0)
    const h = newAtom('H', 1.09, 0, 0)

    const guide = getGrowGuideCommand({ atoms: [c, h], bonds: [newBond(c.id, h.id)] }, {
      sourceId: c.id,
      activeElement: 'C',
    })

    expect(guide).not.toBeNull()
  })

  it('does not return guide geometry for bonded H slots', () => {
    const c = newAtom('C', 0, 0, 0)
    const h = newAtom('H', 1.09, 0, 0)

    expect(getGrowGuideCommand({ atoms: [c, h], bonds: [newBond(c.id, h.id)] }, {
      sourceId: h.id,
      activeElement: 'C',
    })).toBeNull()
  })
})
