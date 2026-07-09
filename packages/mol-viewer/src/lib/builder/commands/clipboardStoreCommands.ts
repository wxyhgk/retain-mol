import type { Molecule } from '../../molecule'
import { newAtom, newBond } from '../../molecule'
import type { MolClipboard } from '../../types'
import type { ClipboardCommandResult, PasteAtomsCommandResult } from './storeCommandTypes'

export function runCopySelectionCommand(
  molecule: Molecule,
  selectedAtomIds: ReadonlySet<string>,
): ClipboardCommandResult {
  if (selectedAtomIds.size === 0) return { clipboard: null }
  const selectedAtoms = molecule.atoms.filter(atom => selectedAtomIds.has(atom.id))
  const indexByAtomId = new Map(selectedAtoms.map((atom, index) => [atom.id, index] as const))
  const selectedBonds = molecule.bonds.filter(
    bond => indexByAtomId.has(bond.atomId1) && indexByAtomId.has(bond.atomId2)
  )
  return {
    clipboard: {
      atoms: selectedAtoms.map(atom => ({
        symbol: atom.symbol,
        x: atom.x,
        y: atom.y,
        z: atom.z,
        charge: atom.charge,
      })),
      bonds: selectedBonds.map(bond => ({
        a: indexByAtomId.get(bond.atomId1)!,
        b: indexByAtomId.get(bond.atomId2)!,
        order: bond.order,
        aromatic: bond.aromatic,
      })),
    },
  }
}

export function runPasteAtomsCommand(
  molecule: Molecule,
  clipboard: MolClipboard,
  pasteOffsetX: number,
): PasteAtomsCommandResult {
  if (clipboard.atoms.length === 0) return { ok: true, changed: false, newAtomIds: [] }

  let maxX = molecule.atoms.reduce((max, atom) => Math.max(max, atom.x), -Infinity)
  if (!isFinite(maxX)) maxX = 0
  const clipMinX = clipboard.atoms.reduce((min, atom) => Math.min(min, atom.x), Infinity)
  const offsetX = isFinite(clipMinX) ? maxX + pasteOffsetX - clipMinX : pasteOffsetX

  const newAtoms = clipboard.atoms.map(clipAtom =>
    newAtom(clipAtom.symbol, clipAtom.x + offsetX, clipAtom.y, clipAtom.z)
  )
  const newBonds = clipboard.bonds.map(clipBond =>
    newBond(newAtoms[clipBond.a].id, newAtoms[clipBond.b].id, clipBond.order)
  )

  return {
    ok: true,
    changed: true,
    molecule: {
      ...molecule,
      atoms: [...molecule.atoms, ...newAtoms],
      bonds: [...molecule.bonds, ...newBonds],
    },
    newAtomIds: newAtoms.map(atom => atom.id),
  }
}
