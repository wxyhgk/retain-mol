import type { Molecule } from './types'

/** Copy the supported Molecule snapshot fields without changing edit semantics. */
export function cloneMolecule(molecule: Molecule): Molecule {
  return {
    ...(molecule.name === undefined ? {} : { name: molecule.name }),
    atoms: molecule.atoms.map(atom => ({
      ...atom,
      ...(atom.coordinationDirections
        ? { coordinationDirections: atom.coordinationDirections.map(direction => [...direction] as const) }
        : {}),
      ...(atom.coordinationSites
        ? { coordinationSites: atom.coordinationSites.map(site => ({ ...site, direction: [...site.direction] as const })) }
        : {}),
    })),
    bonds: molecule.bonds.map(bond => ({
      ...bond,
      ...(bond.coordinationSites
        ? { coordinationSites: bond.coordinationSites.map(site => ({ ...site })) }
        : {}),
    })),
  }
}

