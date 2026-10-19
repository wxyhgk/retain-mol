import type { Atom, Bond, Molecule } from '../../../molecule'
import { newAtom, newBond } from '../../../molecule'
import type { ClipboardAtom, ClipboardBond, MolClipboard } from '../../../clipboard'
import type { ClipboardCommandResult, PasteAtomsCommandResult } from '../shared'

function copyAtomToClipboard(atom: Atom): ClipboardAtom {
  return {
    symbol: atom.symbol,
    x: atom.x,
    y: atom.y,
    z: atom.z,
    ...(atom.isotope === undefined ? {} : { isotope: atom.isotope }),
    ...(atom.label === undefined ? {} : { label: atom.label }),
    ...(atom.chirality === undefined ? {} : { chirality: atom.chirality }),
    ...(atom.charge === undefined ? {} : { charge: atom.charge }),
    ...(atom.radical === undefined ? {} : { radical: atom.radical }),
    ...(atom.coordinationGeometry === undefined
      ? {}
      : { coordinationGeometry: atom.coordinationGeometry }),
    ...(atom.coordinationDirections === undefined
      ? {}
      : { coordinationDirections: atom.coordinationDirections.map(direction => [...direction] as const) }),
    ...(atom.coordinationSites === undefined
      ? {}
      : {
          coordinationSites: atom.coordinationSites.map(site => ({
            ...site,
            direction: [...site.direction] as const,
          })),
        }),
    ...(atom.coordinationNumber === undefined
      ? {}
      : { coordinationNumber: atom.coordinationNumber }),
  }
}

function pasteClipboardAtom(clipAtom: ClipboardAtom, offsetX: number): Atom {
  return {
    ...newAtom(clipAtom.symbol, clipAtom.x + offsetX, clipAtom.y, clipAtom.z),
    ...(clipAtom.isotope === undefined ? {} : { isotope: clipAtom.isotope }),
    ...(clipAtom.label === undefined ? {} : { label: clipAtom.label }),
    ...(clipAtom.chirality === undefined ? {} : { chirality: clipAtom.chirality }),
    ...(clipAtom.charge === undefined ? {} : { charge: clipAtom.charge }),
    ...(clipAtom.radical === undefined ? {} : { radical: clipAtom.radical }),
    ...(clipAtom.coordinationGeometry === undefined
      ? {}
      : { coordinationGeometry: clipAtom.coordinationGeometry }),
    ...(clipAtom.coordinationDirections === undefined
      ? {}
      : { coordinationDirections: clipAtom.coordinationDirections.map(direction => [...direction] as const) }),
    ...(clipAtom.coordinationSites === undefined
      ? {}
      : {
          coordinationSites: clipAtom.coordinationSites.map(site => ({
            ...site,
            direction: [...site.direction] as const,
          })),
        }),
    ...(clipAtom.coordinationNumber === undefined
      ? {}
      : { coordinationNumber: clipAtom.coordinationNumber }),
  }
}

function copyBondToClipboard(
  bond: Bond,
  indexByAtomId: ReadonlyMap<string, number>,
): ClipboardBond | null {
  const a = indexByAtomId.get(bond.atomId1)
  const b = indexByAtomId.get(bond.atomId2)
  if (a === undefined || b === undefined) return null
  const coordinationSites = bond.coordinationSites?.flatMap(assignment => {
    const atom = indexByAtomId.get(assignment.atomId)
    return atom === undefined ? [] : [{ atom, siteId: assignment.siteId }]
  })
  return {
    a,
    b,
    order: bond.order,
    ...(bond.wedge === undefined ? {} : { wedge: bond.wedge }),
    ...(bond.ez === undefined ? {} : { ez: bond.ez }),
    ...(bond.aromatic === undefined ? {} : { aromatic: bond.aromatic }),
    ...(coordinationSites?.length ? { coordinationSites } : {}),
  }
}

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
      atoms: selectedAtoms.map(copyAtomToClipboard),
      bonds: selectedBonds.flatMap(bond => {
        const copied = copyBondToClipboard(bond, indexByAtomId)
        return copied ? [copied] : []
      }),
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

  const newAtoms = clipboard.atoms.map(clipAtom => pasteClipboardAtom(clipAtom, offsetX))
  const newBonds = clipboard.bonds.flatMap(clipBond => {
    const atom1 = newAtoms[clipBond.a]
    const atom2 = newAtoms[clipBond.b]
    if (!atom1 || !atom2) return []
    const atomId1 = atom1.id
    const atomId2 = atom2.id
    const baseBond = newBond(atomId1, atomId2, clipBond.order)
    const coordinationSites = clipBond.coordinationSites?.flatMap(assignment => {
      const atom = newAtoms[assignment.atom]
      return atom ? [{ atomId: atom.id, siteId: assignment.siteId }] : []
    })
    return [{
      ...baseBond,
      ...(clipBond.wedge === undefined ? {} : { wedge: clipBond.wedge }),
      ...(clipBond.ez === undefined ? {} : { ez: clipBond.ez }),
      ...(clipBond.aromatic === undefined ? {} : { aromatic: clipBond.aromatic }),
      ...(coordinationSites?.length ? { coordinationSites } : {}),
    }]
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
