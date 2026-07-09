import type { Molecule } from '../../molecule'
import { centerMolecule, inferBonds, newAtom } from '../../molecule'
import { minimizeGeometry } from '../../io/molFormat'
import { editChanged, editUnchanged, type EditCommandResult } from './commandResult'
import type {
  AddAtomCommandResult,
  CleanupGeometryCommandResult,
  MoleculeChangedCommandResult,
} from './storeCommandTypes'

export function runSetMoleculeCommand(molecule: Molecule): MoleculeChangedCommandResult {
  return { ok: true, changed: true, molecule }
}

export function runAddAtomCommand(
  molecule: Molecule,
  symbol: string,
  x: number,
  y: number,
  z: number,
): AddAtomCommandResult {
  const atom = newAtom(symbol, x, y, z)
  return {
    ok: true,
    changed: true,
    molecule: { ...molecule, atoms: [...molecule.atoms, atom] },
    atomId: atom.id,
  }
}

export function runMoveAtomCommand(
  molecule: Molecule,
  atomId: string,
  x: number,
  y: number,
  z: number,
): EditCommandResult {
  if (!molecule.atoms.some(atom => atom.id === atomId)) return editUnchanged()
  return editChanged({
    ...molecule,
    atoms: molecule.atoms.map(atom => atom.id === atomId ? { ...atom, x, y, z } : atom),
  })
}

export function runSetAtomPositionsCommand(
  molecule: Molecule,
  positions: ReadonlyMap<string, { readonly x: number; readonly y: number; readonly z: number }>,
): EditCommandResult {
  let changed = false
  const atoms = molecule.atoms.map(atom => {
    const position = positions.get(atom.id)
    if (!position) return atom
    if (atom.x !== position.x || atom.y !== position.y || atom.z !== position.z) changed = true
    return { ...atom, x: position.x, y: position.y, z: position.z }
  })
  return changed
    ? editChanged({ ...molecule, atoms })
    : editUnchanged()
}

export function runAutoInferBondsCommand(molecule: Molecule): EditCommandResult {
  return editChanged({ ...molecule, bonds: inferBonds(molecule.atoms) })
}

export function runCleanupGeometryCommand(molecule: Molecule): CleanupGeometryCommandResult {
  const result = minimizeGeometry(molecule)
  return result.ok === false
    ? { ok: false, reason: result.reason }
    : { ok: true, changed: true, molecule: result.molecule }
}

export function runClearMoleculeCommand(): MoleculeChangedCommandResult {
  return { ok: true, changed: true, molecule: { atoms: [], bonds: [], name: 'New Molecule' } }
}

export function runCenterMoleculeCommand(molecule: Molecule): EditCommandResult {
  return editChanged(centerMolecule(molecule))
}
