import {
  ReStruct,
  Render,
  type Action,
  type MoleculeEditPlanV1,
  type RenderOptions,
  Struct,
} from '../../../src';
import type { Editor } from 'application/editor/editor.types';
import {
  MoleculeEditPlanExecutor,
  validateMoleculeEditPlan,
} from 'application/editor/MoleculeEditPlanExecutor';

function trianglePlan(): MoleculeEditPlanV1 {
  return {
    schema: 'retainmol.molecule-edit-plan.v1',
    atomCount: 3,
    bondCount: 3,
    atoms: [
      { ref: 'atom-1', element: 'C', x: 0, y: 0 },
      { ref: 'atom-2', element: 'C', x: 1, y: 0 },
      { ref: 'atom-3', element: 'O', x: 0.5, y: 0.87 },
    ],
    bonds: [
      { ref: 'bond-1', begin: 'atom-1', end: 'atom-2', order: 1 },
      { ref: 'bond-2', begin: 'atom-2', end: 'atom-3', order: 1 },
      { ref: 'bond-3', begin: 'atom-3', end: 'atom-1', order: 1 },
    ],
    steps: [
      {
        id: 'step-001',
        label: 'Place C anchor',
        commands: [
          {
            type: 'addAtom',
            atom: {
              ref: 'atom-1',
              element: 'C',
              position: { x: 0, y: 0 },
            },
          },
        ],
      },
      {
        id: 'step-002',
        label: 'Extend C-C',
        commands: [
          {
            type: 'addAtom',
            atom: {
              ref: 'atom-2',
              element: 'C',
              position: { x: 1, y: 0 },
            },
          },
          {
            type: 'addBond',
            bond: { ...thisBond('bond-1', 'atom-1', 'atom-2') },
          },
        ],
      },
      {
        id: 'step-003',
        label: 'Extend C-O',
        commands: [
          {
            type: 'addAtom',
            atom: {
              ref: 'atom-3',
              element: 'O',
              position: { x: 0.5, y: 0.87 },
            },
          },
          { type: 'addBond', bond: thisBond('bond-2', 'atom-2', 'atom-3') },
        ],
      },
      {
        id: 'step-004',
        label: 'Close ring',
        commands: [
          { type: 'addBond', bond: thisBond('bond-3', 'atom-3', 'atom-1') },
        ],
      },
    ],
  };
}

function thisBond(ref: string, begin: string, end: string) {
  return { ref, begin, end, order: 1 };
}

function executionContext() {
  const render = new Render(
    document as unknown as HTMLElement,
    {
      microModeScale: 20,
      width: 100,
      height: 100,
    } as RenderOptions,
  );
  const ctab = new ReStruct(new Struct(), render);
  const update = jest.fn<void, [Action]>();
  const context = {
    render: { ctab },
    update,
  } as unknown as Pick<Editor, 'render' | 'update'>;
  return { context, ctab, update };
}

describe('MoleculeEditPlanExecutor', () => {
  it('applies each plan step as one real editor history action', () => {
    const { context, ctab, update } = executionContext();
    const executor = new MoleculeEditPlanExecutor(context, trianglePlan(), {
      x: 10,
      y: -2,
    });

    while (!executor.isComplete) executor.applyNextStep();

    expect(ctab.molecule.atoms.size).toBe(3);
    expect(ctab.molecule.bonds.size).toBe(3);
    expect(update).toHaveBeenCalledTimes(4);
    expect(executor.atomIds.size).toBe(3);
    expect(executor.bondIds.size).toBe(3);
    const anchorId = executor.atomIds.get('atom-1') as number;
    expect(ctab.molecule.atoms.get(anchorId)?.pp.x).toBe(10);
    expect(ctab.molecule.atoms.get(anchorId)?.pp.y).toBe(-2);

    for (const [rollback] of [...update.mock.calls].reverse()) {
      rollback.perform(ctab);
    }
    expect(ctab.molecule.atoms.size).toBe(0);
    expect(ctab.molecule.bonds.size).toBe(0);
  });

  it('plays remaining steps in order and exposes logical-to-runtime ids', async () => {
    const { context } = executionContext();
    const executor = new MoleculeEditPlanExecutor(context, trianglePlan());
    executor.applyNextStep();
    const applied: string[] = [];
    const waits: number[] = [];

    await executor.play({
      delayMs: 25,
      onStep: ({ step, atomIds }) => {
        applied.push(step.id);
        expect(atomIds.size).toBeGreaterThan(0);
      },
      wait: async (delay) => {
        waits.push(delay);
      },
    });

    expect(applied).toEqual(['step-002', 'step-003', 'step-004']);
    expect(waits).toEqual([25, 25]);
  });

  it('rejects a dangling bond before touching the editor', () => {
    const plan = trianglePlan();
    plan.steps[1].commands[1] = {
      type: 'addBond',
      bond: thisBond('bond-1', 'atom-1', 'missing-atom'),
    };

    expect(() => validateMoleculeEditPlan(plan)).toThrow(
      expect.objectContaining({ code: 'invalid-bond' }),
    );
  });

  it('rolls back the model and logical ids when history update fails', () => {
    const { context, ctab, update } = executionContext();
    update.mockImplementationOnce(() => {
      throw new Error('history update failed');
    });
    const executor = new MoleculeEditPlanExecutor(context, trianglePlan());

    expect(() => executor.applyNextStep()).toThrow('history update failed');
    expect(ctab.molecule.atoms.size).toBe(0);
    expect(ctab.molecule.bonds.size).toBe(0);
    expect(executor.atomIds.size).toBe(0);
    expect(executor.bondIds.size).toBe(0);
    expect(executor.nextStepIndex).toBe(0);
  });
});
