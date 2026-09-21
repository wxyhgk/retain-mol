import type { Molecule } from '../../../molecule'
import { minimizeGeometry } from '../../../io/molFormat'
import { editMolecule, type CleanupGeometryCommandResult } from '../shared'

export function runCleanupGeometryCommand(molecule: Molecule): CleanupGeometryCommandResult {
  const result = minimizeGeometry(molecule)
  return result.ok === false
    ? { ok: false, reason: result.reason ?? '几何优化失败' }
    : editMolecule(molecule, result.molecule)
}
