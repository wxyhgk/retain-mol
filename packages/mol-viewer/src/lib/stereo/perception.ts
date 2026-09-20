import { Molecule as OCLMolecule } from 'openchemlib'
import type { Molecule } from '../molecule'

/** CIP from coordinates / 2D wedges, never from the stored R/S annotation. */
export function perceiveAtomChirality(molecule: Molecule): ReadonlyMap<string, 'R' | 'S'> {
  const result = new Map<string, 'R' | 'S'>()
  const ocl = new OCLMolecule(molecule.atoms.length, molecule.bonds.length)
  const indices = new Map<string, number>()
  try {
    for (const [index, atom] of molecule.atoms.entries()) {
      const atomicNo = OCLMolecule.getAtomicNoFromLabel(atom.symbol)
      if (!atomicNo || ![atom.x, atom.y, atom.z].every(Number.isFinite)) return result
      const i = ocl.addAtom(atomicNo)
      indices.set(atom.id, i)
      ocl.setAtomX(i, atom.x)
      ocl.setAtomY(i, -atom.y)
      ocl.setAtomZ(i, -atom.z)
      ocl.setAtomCharge(i, atom.charge ?? 0)
      if (atom.radical) ocl.setAtomRadical(i, atom.radical === 1
        ? OCLMolecule.cAtomRadicalStateD : OCLMolecule.cAtomRadicalStateT)
      // ensureHelperArrays moves explicit H atoms; map numbers survive that permutation.
      ocl.setAtomMapNo(i, index + 1)
    }
    for (const bond of molecule.bonds) {
      const a = indices.get(bond.atomId1)
      const b = indices.get(bond.atomId2)
      if (a === undefined || b === undefined) return result
      const type = bond.aromatic ? OCLMolecule.cBondTypeDelocalized
        : bond.order === 2 ? OCLMolecule.cBondTypeDouble
        : bond.order === 3 ? OCLMolecule.cBondTypeTriple
        : bond.wedge === 'up' ? OCLMolecule.cBondTypeUp
        : bond.wedge === 'down' ? OCLMolecule.cBondTypeDown
        : OCLMolecule.cBondTypeSingle
      ocl.addOrChangeBond(a, b, type)
    }
    ocl.ensureHelperArrays(OCLMolecule.cHelperCIP)
    for (let i = 0; i < ocl.getAllAtoms(); i += 1) {
      const atom = molecule.atoms[ocl.getAtomMapNo(i) - 1]
      if (!atom) continue
      const parity = ocl.getAtomParity(i)
      if (parity !== OCLMolecule.cAtomParity1 && parity !== OCLMolecule.cAtomParity2) continue
      const cip = ocl.getAtomCIPParity(i)
      if (cip === OCLMolecule.cAtomCIPParityRorM) result.set(atom.id, 'R')
      if (cip === OCLMolecule.cAtomCIPParitySorP) result.set(atom.id, 'S')
    }
  } catch {
    // Unsupported chemistry must not leave a confidently incorrect annotation.
    result.clear()
  }
  return result
}

/** Refresh only authored annotations; geometric chirality alone does not opt in. */
export function reconcileAtomChirality(molecule: Molecule): Molecule {
  if (!molecule.atoms.some(atom => atom.chirality !== undefined)) return molecule
  const perceived = perceiveAtomChirality(molecule)
  const cleared = new Set<string>()
  let changed = false
  const atoms = molecule.atoms.map(atom => {
    if (atom.chirality === undefined) return atom
    const chirality = perceived.get(atom.id)
    if (chirality === atom.chirality) return atom
    changed = true
    const { chirality: _previous, ...rest } = atom
    if (chirality === undefined) {
      cleared.add(atom.id)
      return rest
    }
    return { ...rest, chirality }
  })
  if (!changed) return molecule
  const bonds = molecule.bonds.map(bond => {
    // The wedge belongs to its narrow end, not to both incident centers.
    if (bond.wedge === undefined || !cleared.has(bond.atomId1)) return bond
    const { wedge: _previous, ...rest } = bond
    return rest
  })
  return { ...molecule, atoms, bonds }
}
