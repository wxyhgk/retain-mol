import { describe, expect, it } from 'vitest'
import { parseTemplateStructureFile } from './templateStructureParser'

describe('parseTemplateStructureFile', () => {
  it('parses XYZ structures for template authoring', () => {
    const result = parseTemplateStructureFile('2\nH2\nH 0 0 0\nH 0 0 0.74\n', 'hydrogen.xyz')

    expect(result.format).toBe('xyz')
    expect(result.molecule.name).toBe('H2')
    expect(result.molecule.atoms).toHaveLength(2)
  })

  it('rejects unsupported structure files', () => {
    expect(() => parseTemplateStructureFile('', 'template.pdb')).toThrow('仅支持 XYZ、MOL 和 SDF 文件')
  })
})
