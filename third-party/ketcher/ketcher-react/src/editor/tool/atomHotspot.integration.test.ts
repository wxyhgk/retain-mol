import {
  Atom,
  Bond,
  fromBondAddition,
  ReStruct,
  Render,
  type RenderOptions,
  Struct,
  Vec2,
} from 'ketcher-core';
import type { IToolContext } from './IToolContext';
import { executeAtomHotspotCommand } from './atomHotspot';

function buildSecondaryCarbonContext() {
  const render = new Render(
    document as unknown as HTMLElement,
    {
      microModeScale: 20,
      width: 100,
      height: 100,
    } as RenderOptions,
  );
  const ctab = new ReStruct(new Struct(), render);
  const [, leftAtomId, centerAtomId] = fromBondAddition(
    ctab,
    { type: 1 },
    { label: 'C' },
    { label: 'C' },
    new Vec2(-1, 0),
    new Vec2(0, 0),
  );
  fromBondAddition(
    ctab,
    { type: 1 },
    centerAtomId,
    { label: 'C' },
    undefined,
    new Vec2(1, 0),
  );

  const update = jest.fn();
  const ctx = {
    render: { ctab },
    update,
  } as unknown as IToolContext;

  return { ctx, ctab, update, centerAtomId, leftAtomId };
}

function triangleTemplate() {
  const struct = new Struct();
  const bottom = struct.atoms.add(new Atom({ label: 'C', pp: new Vec2(0, 0) }));
  const topRight = struct.atoms.add(
    new Atom({ label: 'C', pp: new Vec2(0.5, 0.87) }),
  );
  const topLeft = struct.atoms.add(
    new Atom({ label: 'C', pp: new Vec2(-0.5, 0.87) }),
  );
  struct.bonds.add(new Bond({ begin: bottom, end: topRight, type: 1 }));
  struct.bonds.add(new Bond({ begin: topRight, end: topLeft, type: 1 }));
  struct.bonds.add(new Bond({ begin: topLeft, end: bottom, type: 1 }));
  struct.initHalfBonds();
  struct.initNeighbors();
  return struct;
}

describe('Atom hotspot real editor actions', () => {
  it('adds and atomically undoes both methyl bonds for 9', () => {
    const { ctx, ctab, update, centerAtomId } = buildSecondaryCarbonContext();
    const initialAtoms = ctab.molecule.atoms.size;
    const initialBonds = ctab.molecule.bonds.size;

    executeAtomHotspotCommand(ctx, centerAtomId, {
      command: 'gem-dimethyl',
    });

    expect(ctab.molecule.atoms.size).toBe(initialAtoms + 2);
    expect(ctab.molecule.bonds.size).toBe(initialBonds + 2);
    expect(update).toHaveBeenCalledTimes(1);

    const rollback = update.mock.calls[0][0];
    rollback.perform(ctab);
    expect(ctab.molecule.atoms.size).toBe(initialAtoms);
    expect(ctab.molecule.bonds.size).toBe(initialBonds);
  });

  it('creates the solid and hashed methyl bonds for Shift+K', () => {
    const { ctx, ctab, centerAtomId } = buildSecondaryCarbonContext();
    const existingBondIds = new Set(ctab.molecule.bonds.keys());

    executeAtomHotspotCommand(ctx, centerAtomId, {
      command: 'stereo-gem-dimethyl',
    });

    const newStereos = Array.from(ctab.molecule.bonds.entries())
      .filter(([bondId]) => !existingBondIds.has(bondId))
      .map(([, bond]) => bond.stereo)
      .sort();
    expect(newStereos).toEqual([1, 6]);
  });

  it('fuses a ring directly onto a secondary carbon', () => {
    const { ctx, ctab, centerAtomId } = buildSecondaryCarbonContext();

    executeAtomHotspotCommand(ctx, centerAtomId, {
      command: 'ring',
      struct: triangleTemplate(),
    });

    expect(ctab.molecule.atoms.size).toBe(5);
    expect(ctab.molecule.bonds.size).toBe(5);
    expect(ctab.molecule.atomGetNeighbors(centerAtomId)).toHaveLength(4);
  });
});
