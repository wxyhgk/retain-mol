import { parseXYZ, type Molecule } from '@retainmol/mol-viewer/core'
import { parseMol, parseSdf } from '@retainmol/mol-viewer/io'

export interface TemplateStructureImportResult {
  readonly molecule: Molecule
  readonly moleculeCount: number
  readonly format: 'xyz' | 'mol' | 'sdf'
}

export function parseTemplateStructureFile(
  text: string,
  filename: string,
): TemplateStructureImportResult {
  const lower = filename.toLowerCase()
  if (lower.endsWith('.xyz')) {
    return { molecule: parseXYZ(text), moleculeCount: 1, format: 'xyz' }
  }
  if (lower.endsWith('.sdf')) {
    const molecules = parseSdf(text)
    if (molecules.length === 0) throw new Error('SDF 文件中没有有效分子')
    return { molecule: molecules[0], moleculeCount: molecules.length, format: 'sdf' }
  }
  if (lower.endsWith('.mol')) {
    return { molecule: parseMol(text), moleculeCount: 1, format: 'mol' }
  }
  throw new Error('仅支持 XYZ、MOL 和 SDF 文件')
}
