export const MOLECULE_EDIT_PLAN_SCHEMA =
  'retainmol.molecule-edit-plan.v1' as const;

export type MoleculeEditPlanPosition = {
  x: number;
  y: number;
};

export type MoleculeEditPlanAtom = {
  ref: string;
  element: string;
  x: number;
  y: number;
  charge?: number;
  isotope?: number;
};

export type MoleculeEditPlanBond = {
  ref: string;
  begin: string;
  end: string;
  order: number;
  stereo?: number;
};

export type MoleculeEditPlanAddAtomCommand = {
  type: 'addAtom';
  atom: {
    ref: string;
    element: string;
    position: MoleculeEditPlanPosition;
    charge?: number;
    isotope?: number;
  };
};

export type MoleculeEditPlanAddBondCommand = {
  type: 'addBond';
  bond: MoleculeEditPlanBond;
};

export type MoleculeEditPlanCommand =
  | MoleculeEditPlanAddAtomCommand
  | MoleculeEditPlanAddBondCommand;

export type MoleculeEditPlanStep = {
  id: string;
  label: string;
  commands: MoleculeEditPlanCommand[];
};

export type MoleculeEditPlanV1 = {
  schema: typeof MOLECULE_EDIT_PLAN_SCHEMA;
  source?: {
    smiles?: string;
    canonicalSmiles?: string;
  };
  atomCount: number;
  bondCount: number;
  atoms: MoleculeEditPlanAtom[];
  bonds: MoleculeEditPlanBond[];
  steps: MoleculeEditPlanStep[];
};
