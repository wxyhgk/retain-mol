import { describe, expect, it } from 'vitest'
import type { FragmentAttachmentSite } from '@retainmol/mol-viewer/fragments'
import { groupEquivalentAttachmentSites } from './fragmentGeometry'

function site(id: string, equivalenceGroup: string, bondOrder: 1 | 2 | 3): FragmentAttachmentSite {
  return { id, label: id, equivalenceGroup, bondOrder, direction: [1, 0, 0] }
}

describe('groupEquivalentAttachmentSites', () => {
  it('keeps one representative for each equivalence group and bond order', () => {
    const result = groupEquivalentAttachmentSites([
      site('single-1', 'equatorial', 1),
      site('single-2', 'equatorial', 1),
      site('double-1', 'equatorial', 2),
      site('axial-1', 'axial', 1),
    ])

    expect(result.map(item => item.id)).toEqual(['single-1', 'double-1', 'axial-1'])
  })
})
