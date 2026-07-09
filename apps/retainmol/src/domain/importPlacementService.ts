import { parseClipboard } from '@retainmol/mol-viewer/io'
import { placeMoleculeInViewer } from '@/domain/moleculePlacementService'

export function pasteMoleculeText(text: string | undefined) {
  if (!text || text.length < 10) return false

  try {
    const { format, molecule } = parseClipboard(text)
    void placeMoleculeInViewer(molecule, { mode: 'add-to-scene' })

    console.log(`[paste] ${format.toUpperCase()} -> ${molecule.atoms.length} atoms`)
    return true
  } catch {
    return false
  }
}
