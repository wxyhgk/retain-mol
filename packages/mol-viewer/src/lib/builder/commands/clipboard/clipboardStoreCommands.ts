import type { Molecule } from '../../../molecule'
import { newAtom, newBond } from '../../../molecule'
import type { MolClipboard } from '../../../types'
import type { ClipboardCommandResult, PasteAtomsCommandResult } from '../shared'

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
        radical: atom.radical,
        coordinationGeometry: atom.coordinationGeometry,
        coordinationDirections: atom.coordinationDirections?.map(direction => [...direction] as const),
        coordinationSites: atom.coordinationSites?.map(site => ({
          ...site,
          direction: [...site.direction] as const,
        })),
        coordinationNumber: atom.coordinationNumber,
      })),
      bonds: selectedBonds.map(bond => ({
        a: indexByAtomId.get(bond.atomId1)!,
        b: indexByAtomId.get(bond.atomId2)!,
        order: bond.order,
        aromatic: bond.aromatic,
        coordinationSites: bond.coordinationSites?.flatMap(assignment => {
          const atom = indexByAtomId.get(assignment.atomId)
          return atom === undefined ? [] : [{ atom, siteId: assignment.siteId }]
        }),
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

  const newAtoms = clipboard.atoms.map(clipAtom => ({
    ...newAtom(clipAtom.symbol, clipAtom.x + offsetX, clipAtom.y, clipAtom.z),
    charge: clipAtom.charge,
    radical: clipAtom.radical,
    coordinationGeometry: clipAtom.coordinationGeometry,
    coordinationDirections: clipAtom.coordinationDirections?.map(direction => [...direction] as const),
    coordinationSites: clipAtom.coordinationSites?.map(site => ({
      ...site,
      direction: [...site.direction] as const,
    })),
    coordinationNumber: clipAtom.coordinationNumber,
  }))
  const newBonds = clipboard.bonds.map(clipBond => {
    const atomId1 = newAtoms[clipBond.a].id
    const atomId2 = newAtoms[clipBond.b].id
    const baseBond = newBond(atomId1, atomId2, clipBond.order)
    const coordinationSites = clipBond.coordinationSites?.flatMap(assignment => {
      const atom = newAtoms[assignment.atom]
      return atom ? [{ atomId: atom.id, siteId: assignment.siteId }] : []
    })
    return coordinationSites?.length
      ? { ...baseBond, aromatic: clipBond.aromatic, coordinationSites }
      : { ...baseBond, aromatic: clipBond.aromatic }
  })

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
