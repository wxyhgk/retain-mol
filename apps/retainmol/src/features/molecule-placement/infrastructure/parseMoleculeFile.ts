import { parseXYZ, type Molecule } from '@retainmol/mol-viewer/core'
import { parseMol, parseSdf } from '@retainmol/mol-viewer/io'

export async function parseMoleculeFile(file: File): Promise<{ molecule: Molecule; moleculeCount: number }> {
  const name = file.name.toLowerCase()
  const source = await file.text()
  if (name.endsWith('.xyz')) return { molecule: parseXYZ(source), moleculeCount: 1 }
  if (name.endsWith('.mol')) return { molecule: parseMol(source), moleculeCount: 1 }
  if (name.endsWith('.sdf')) {
    const molecules = parseSdf(source)
    if (molecules.length === 0) throw new Error('SDF 文件中未找到有效分子')
    return { molecule: molecules[0], moleculeCount: molecules.length }
  }
  throw new Error('仅支持 XYZ、MOL 和 SDF 结构文件')
}
