import { fromTemplateOnBondAction } from 'application/editor/actions/template';
import { CalcImplicitH } from 'application/editor/operations';
import { ReStruct, Render } from 'application/render';
import type { RenderOptions } from 'application/render/render.types';
import { Atom, Bond, Fragment, Struct, Vec2 } from 'domain/entities';

type BondTemplate = {
  molecule: Struct;
  bid: number;
};

function addAtom(struct: Struct, x: number, y: number): number {
  return struct.atoms.add(
    new Atom({ label: 'C', fragment: 0, pp: new Vec2(x, y) }),
  );
}

function addBond(struct: Struct, begin: number, end: number): number {
  return struct.bonds.add(
    new Bond({ begin, end, type: Bond.PATTERN.TYPE.SINGLE }),
  );
}

function buildCyclohexaneTemplate(): BondTemplate {
  const molecule = new Struct();
  const height = Math.sqrt(3) / 2;
  const atomIds = [
    addAtom(molecule, 0, 0),
    addAtom(molecule, 1, 0),
    addAtom(molecule, 1.5, height),
    addAtom(molecule, 1, 2 * height),
    addAtom(molecule, 0, 2 * height),
    addAtom(molecule, -0.5, height),
  ];

  atomIds.forEach((atomId, index) => {
    addBond(molecule, atomId, atomIds[(index + 1) % atomIds.length]);
  });
  molecule.name = 'Cyclohexane';
  molecule.prepareLoopStructure();

  return { molecule, bid: 0 };
}

function buildTarget(targetBondId: 0 | 1): ReStruct {
  const molecule = new Struct();
  molecule.frags.add(new Fragment());

  if (targetBondId === 1) {
    const fillerBegin = addAtom(molecule, -5, 0);
    const fillerEnd = addAtom(molecule, -4, 0);
    addBond(molecule, fillerBegin, fillerEnd);
  }

  const targetBegin = addAtom(molecule, 0, 0);
  const targetEnd = addAtom(molecule, 1, 0);
  expect(addBond(molecule, targetBegin, targetEnd)).toBe(targetBondId);
  molecule.prepareLoopStructure();

  const render = new Render(
    document as unknown as HTMLElement,
    {
      scale: 40,
      width: 100,
      height: 100,
    } as unknown as RenderOptions,
  );
  const restruct = new ReStruct(molecule, render);
  restruct.assignConnectedComponents();
  return restruct;
}

function getStructureSnapshot(struct: Struct) {
  return {
    atoms: Array.from(struct.atoms, ([id, atom]) => ({
      id,
      label: atom.label,
      fragment: atom.fragment,
      x: atom.pp.x,
      y: atom.pp.y,
    })),
    bonds: Array.from(struct.bonds, ([id, bond]) => ({
      id,
      begin: bond.begin,
      end: bond.end,
      type: bond.type,
    })),
  };
}

function getChemicalSnapshot(struct: Struct) {
  const atomKey = (atomId: number) => {
    const atom = struct.atoms.get(atomId) as Atom;
    return `${atom.label}:${atom.pp.x}:${atom.pp.y}`;
  };

  return {
    atoms: Array.from(
      struct.atoms,
      ([, atom]) => `${atom.label}:${atom.fragment}:${atom.pp.x}:${atom.pp.y}`,
    ).sort(),
    bonds: Array.from(struct.bonds, ([, bond]) => ({
      atoms: [atomKey(bond.begin), atomKey(bond.end)].sort(),
      type: bond.type,
    })).sort((left, right) =>
      JSON.stringify(left).localeCompare(JSON.stringify(right)),
    ),
  };
}

describe('fromTemplateOnBondAction', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it.each([0, 1] as const)(
    'fuses a cyclohexane template onto target bond id %s and returns a reversible action',
    async (targetBondId) => {
      const restruct = buildTarget(targetBondId);
      const template = buildCyclohexaneTemplate();
      const before = getStructureSnapshot(restruct.molecule);

      const result =
        targetBondId === 0
          ? await fromTemplateOnBondAction(
              restruct,
              template,
              targetBondId,
              null,
              false,
              true,
            )
          : fromTemplateOnBondAction(
              restruct,
              template,
              targetBondId,
              null,
              false,
              false,
            );
      const [undoAction, pasteItems] = result;

      expect(pasteItems.atoms).toHaveLength(4);
      expect(pasteItems.bonds).toHaveLength(5);
      expect(
        pasteItems.atoms.map(
          (atomId) => restruct.molecule.atoms.get(atomId)?.fragment,
        ),
      ).toEqual([0, 0, 0, 0]);
      expect(restruct.molecule.atoms.size).toBe(before.atoms.length + 4);
      expect(restruct.molecule.bonds.size).toBe(before.bonds.length + 5);

      const fused = getChemicalSnapshot(restruct.molecule);
      const redoAction = undoAction.perform(restruct);
      expect(getStructureSnapshot(restruct.molecule)).toEqual(before);

      redoAction.perform(restruct);
      expect(getChemicalSnapshot(restruct.molecule)).toEqual(fused);
    },
  );

  it('throws explicit errors before mutating the structure for invalid bonds', () => {
    const restruct = buildTarget(0);
    const template = buildCyclohexaneTemplate();
    const before = getStructureSnapshot(restruct.molecule);

    expect(() =>
      fromTemplateOnBondAction(restruct, template, 99, null, false, false),
    ).toThrow('Cannot attach template: target bond 99 not found');
    expect(getStructureSnapshot(restruct.molecule)).toEqual(before);

    expect(() =>
      fromTemplateOnBondAction(
        restruct,
        { ...template, bid: 99 },
        0,
        null,
        false,
        false,
      ),
    ).toThrow('Cannot attach template: template bond 99 not found');
    expect(getStructureSnapshot(restruct.molecule)).toEqual(before);
  });

  it('throws before mutating when merge parameters cannot be calculated', () => {
    const restruct = buildTarget(0);
    const template = buildCyclohexaneTemplate();
    const targetBond = restruct.molecule.bonds.get(0) as Bond;
    Object.defineProperty(targetBond, 'end', { value: 999 });
    const before = getStructureSnapshot(restruct.molecule);

    expect(() =>
      fromTemplateOnBondAction(restruct, template, 0, null, false, false),
    ).toThrow(
      'Cannot attach template: target or template bond references a missing atom',
    );
    expect(getStructureSnapshot(restruct.molecule)).toEqual(before);
  });

  it('returns a rejected Promise instead of throwing synchronously in force mode', async () => {
    const restruct = buildTarget(0);
    const template = buildCyclohexaneTemplate();
    const before = getStructureSnapshot(restruct.molecule);

    const result = fromTemplateOnBondAction(
      restruct,
      template,
      99,
      null,
      false,
      true,
    );

    await expect(result).rejects.toThrow(
      'Cannot attach template: target bond 99 not found',
    );
    expect(getStructureSnapshot(restruct.molecule)).toEqual(before);
  });

  it('rolls back placed template atoms and bonds when post-processing fails', () => {
    const restruct = buildTarget(0);
    const template = buildCyclohexaneTemplate();
    const before = getStructureSnapshot(restruct.molecule);
    const originalPerform = CalcImplicitH.prototype.perform;
    let implicitHydrogenCall = 0;

    jest
      .spyOn(CalcImplicitH.prototype, 'perform')
      .mockImplementation(function (this: CalcImplicitH, currentReStruct) {
        implicitHydrogenCall += 1;
        if (implicitHydrogenCall === 3) {
          throw new Error('template post-processing failed');
        }
        return originalPerform.call(this, currentReStruct);
      });

    expect(() =>
      fromTemplateOnBondAction(restruct, template, 0, null, false, false),
    ).toThrow('template post-processing failed');
    // Rollback replays the inverse implicit-H operations after the third call
    // triggers the failure, so the final count is expected to be higher.
    expect(implicitHydrogenCall).toBeGreaterThanOrEqual(3);
    expect(getStructureSnapshot(restruct.molecule)).toEqual(before);
  });
});
