import type { Struct } from 'domain/entities';
import {
  MOLECULE_EDIT_PLAN_SCHEMA,
  type MoleculeEditPlanAddAtomCommand,
  type MoleculeEditPlanAddBondCommand,
  type MoleculeEditPlanAtom,
  type MoleculeEditPlanBond,
  type MoleculeEditPlanStep,
  type MoleculeEditPlanV1,
} from './moleculeEditPlan.types';

type TraversalEdge = {
  bond: MoleculeEditPlanBond;
  neighbor: string;
};

function atomCommand(
  atom: MoleculeEditPlanAtom,
): MoleculeEditPlanAddAtomCommand {
  return {
    type: 'addAtom',
    atom: {
      ref: atom.ref,
      element: atom.element,
      position: { x: atom.x, y: atom.y },
      ...(atom.charge !== undefined ? { charge: atom.charge } : {}),
      ...(atom.isotope !== undefined ? { isotope: atom.isotope } : {}),
    },
  };
}

function bondCommand(
  bond: MoleculeEditPlanBond,
): MoleculeEditPlanAddBondCommand {
  return { type: 'addBond', bond: { ...bond } };
}

function numericRefOrder(first: string, second: string) {
  return first.localeCompare(second, undefined, { numeric: true });
}

export function createMoleculeEditPlanFromStruct(
  structure: Struct,
): MoleculeEditPlanV1 {
  if (!structure.atoms.size) {
    throw new Error('Molecule edit plan requires at least one atom');
  }
  const atomRefById = new Map<number, string>();
  const atoms: MoleculeEditPlanAtom[] = [];
  structure.atoms.forEach((atom, atomId) => {
    const ref = `atom-${atomId + 1}`;
    atomRefById.set(atomId, ref);
    atoms.push({
      ref,
      element: atom.label || 'C',
      x: atom.pp.x,
      y: atom.pp.y,
      ...(atom.charge !== null ? { charge: atom.charge } : {}),
      ...(atom.isotope !== null ? { isotope: atom.isotope } : {}),
    });
  });
  atoms.sort((first, second) => numericRefOrder(first.ref, second.ref));

  const bonds: MoleculeEditPlanBond[] = [];
  structure.bonds.forEach((bond, bondId) => {
    const begin = atomRefById.get(bond.begin);
    const end = atomRefById.get(bond.end);
    if (!begin || !end) {
      throw new Error(`Bond ${bondId} references a missing atom`);
    }
    bonds.push({
      ref: `bond-${bondId + 1}`,
      begin,
      end,
      order: bond.type,
      ...(bond.stereo ? { stereo: bond.stereo } : {}),
    });
  });
  bonds.sort((first, second) => numericRefOrder(first.ref, second.ref));

  const atomByRef = new Map(atoms.map((atom) => [atom.ref, atom]));
  const adjacency = new Map<string, TraversalEdge[]>(
    atoms.map((atom) => [atom.ref, []]),
  );
  for (const bond of bonds) {
    adjacency.get(bond.begin)?.push({ bond, neighbor: bond.end });
    adjacency.get(bond.end)?.push({ bond, neighbor: bond.begin });
  }

  const steps: Omit<MoleculeEditPlanStep, 'id'>[] = [];
  const visitedAtoms = new Set<string>();
  const treeBonds = new Set<string>();
  while (visitedAtoms.size < atoms.length) {
    const root = atoms
      .filter(({ ref }) => !visitedAtoms.has(ref))
      .sort(
        (first, second) =>
          (adjacency.get(first.ref)?.length ?? 0) -
            (adjacency.get(second.ref)?.length ?? 0) ||
          numericRefOrder(first.ref, second.ref),
      )[0];
    visitedAtoms.add(root.ref);
    steps.push({
      label: `Place ${root.element} anchor`,
      commands: [atomCommand(root)],
    });
    const queue = [root.ref];
    while (queue.length) {
      const current = queue.shift() as string;
      const neighbors = [...(adjacency.get(current) ?? [])].sort(
        (first, second) => numericRefOrder(first.neighbor, second.neighbor),
      );
      for (const { bond, neighbor } of neighbors) {
        if (visitedAtoms.has(neighbor)) continue;
        const atom = atomByRef.get(neighbor);
        if (!atom) throw new Error(`Atom ${neighbor} is missing from the plan`);
        visitedAtoms.add(neighbor);
        treeBonds.add(bond.ref);
        queue.push(neighbor);
        steps.push({
          label: `Extend ${atomByRef.get(current)?.element ?? 'atom'}-${
            atom.element
          }`,
          commands: [atomCommand(atom), bondCommand(bond)],
        });
      }
    }
  }
  for (const bond of bonds.filter(({ ref }) => !treeBonds.has(ref))) {
    steps.push({
      label: `Connect ${atomByRef.get(bond.begin)?.element ?? 'atom'}-${
        atomByRef.get(bond.end)?.element ?? 'atom'
      }${bond.order > 1 ? ` (order ${bond.order})` : ''}`,
      commands: [bondCommand(bond)],
    });
  }

  return {
    schema: MOLECULE_EDIT_PLAN_SCHEMA,
    atomCount: atoms.length,
    bondCount: bonds.length,
    atoms,
    bonds,
    steps: steps.map((step, index) => ({
      id: `step-${String(index + 1).padStart(3, '0')}`,
      ...step,
    })),
  };
}
