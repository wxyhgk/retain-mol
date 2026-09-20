import { describe, expect, it } from 'vitest'
import { molfileSyncKey } from './molfileSyncKey'

const fixture = '\n  -INDIGO-09202622312D\n\n  2  1  0  0  0  0  0  0  0  0999 V2000\n'
  + '    0.0000    0.0000    0.0000 C   0  0  0  0  0\n'
  + '    1.0000    1.0000    0.0000 F   0  0  0  0  0\n'
  + '  1  2  1  0  0  0  0\nM  END\n'

describe('molfileSyncKey', () => {
  it('does not re-import an unchanged 2D canvas when the export minute changes', () => {
    const later = fixture.replace('0920262231', '0920262232')
    expect(later).not.toBe(fixture)
    expect(molfileSyncKey(later)).toBe(molfileSyncKey(fixture))
    expect(molfileSyncKey(later.replace(/\n/g, '\r\n'))).toBe(molfileSyncKey(fixture))
  })

  it('still detects stereo, coordinates, element and dimensionality edits', () => {
    const edits = [
      fixture.replace('  1  2  1  0', '  1  2  1  1'),
      fixture.replace('1.0000', '1.5000'),
      fixture.replace('F   0', 'Br  0'),
      fixture.replace('2D', '3D'),
    ]
    for (const edit of edits) expect(molfileSyncKey(edit)).not.toBe(molfileSyncKey(fixture))
  })

  it('retains V3000 stereo fields and nonstandard header content', () => {
    const v3000 = '\n  -INDIGO-09202622312D\n\n  0  0  0  0  0  0  0  0  0  0999 V3000\nM  V30 1 C 0 0 0 0 CFG=1\nM  END\n'
    expect(molfileSyncKey(v3000.replace('2231', '2232'))).toBe(molfileSyncKey(v3000))
    expect(molfileSyncKey(v3000.replace('CFG=1', 'CFG=2'))).not.toBe(molfileSyncKey(v3000))
    expect(molfileSyncKey('name\ncustom header\ncomment\ncounts')).toBe('name\ncustom header\ncomment\ncounts')
    expect(molfileSyncKey('')).toBe('')
  })
})
