import { getAtomChiralityState, getMolecularFormula, type Molecule } from '@retainmol/mol-viewer/core'

export const EMPTY: Molecule = { atoms: [], bonds: [] }
export function stereoCenter(molecule: Molecule) {
  // The bundled fixture has one center. A general host should offer a center selector.
  return molecule.atoms.find(atom => getAtomChiralityState(molecule, atom.id).computed !== null)
}

export function describeMolecule(molecule: Molecule): string {
  const center = stereoCenter(molecule)
  const chirality = center ? getAtomChiralityState(molecule, center.id) : null
  const lengths = center ? ['F', 'Br', 'I'].flatMap(symbol => {
    const atom = molecule.atoms.find(item => item.symbol === symbol)
    if (!atom || !molecule.bonds.some(bond =>
      (bond.atomId1 === center.id && bond.atomId2 === atom.id) || (bond.atomId2 === center.id && bond.atomId1 === atom.id))) return []
    return [`C–${symbol} ${Math.hypot(atom.x - center.x, atom.y - center.y, atom.z - center.z).toFixed(4)} Å`]
  }) : []
  return [
    `${getMolecularFormula(molecule.atoms) || '空分子'} · ${molecule.atoms.length} 原子 / ${molecule.bonds.length} 键`,
    `当前构型 ${chirality?.computed ?? '—'} · 指定 ${chirality?.specified ?? '未指定'}`,
    ...lengths,
  ].join('\n')
}
