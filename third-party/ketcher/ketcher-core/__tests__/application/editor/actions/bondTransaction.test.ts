import { Action, fromBondAddition } from 'application/editor/actions';
import {
  AtomAdd,
  AtomAttr,
  CalcImplicitH,
  FragmentAdd,
  FragmentStereoFlag,
} from 'application/editor/operations';
import { ReStruct, Render } from 'application/render';
import type { RenderOptions } from 'application/render/render.types';
import { Atom, Bond, SGroup, Struct, Vec2 } from 'domain/entities';
import * as bondStereoActions from 'application/editor/actions/bondStereo';

function buildReStruct() {
  const options = {
    microModeScale: 20,
    width: 100,
    height: 100,
  } as RenderOptions;
  const render = new Render(document as unknown as HTMLElement, options);
  return new ReStruct(new Struct(), render);
}

function buildSuperatomReStruct() {
  const struct = new Struct();
  const beginAtomId = struct.atoms.add(
    new Atom({ label: 'C', fragment: 0, pp: new Vec2(0, 0) }),
  );
  const endAtomId = struct.atoms.add(
    new Atom({ label: 'C', fragment: 0, pp: new Vec2(1, 0) }),
  );
  const sgroup = new SGroup(SGroup.TYPES.SUP);
  const sgroupId = struct.sgroups.add(sgroup);
  sgroup.id = sgroupId;
  struct.atomAddToSGroup(sgroupId, beginAtomId);
  struct.atomAddToSGroup(sgroupId, endAtomId);
  const options = {
    microModeScale: 20,
    width: 100,
    height: 100,
  } as RenderOptions;
  const render = new Render(document as unknown as HTMLElement, options);

  return {
    beginAtomId,
    endAtomId,
    reStruct: new ReStruct(struct, render),
    sgroup,
  };
}

function addAtomInOwnFragment(reStruct: ReStruct, position: Vec2) {
  const fragmentInverse = new FragmentAdd().perform(reStruct) as FragmentAdd;
  const fragmentId = fragmentInverse.frid as number;
  const atomInverse = new AtomAdd(
    { label: 'C', fragment: fragmentId },
    position,
  ).perform(reStruct) as AtomAdd;

  return {
    atomId: atomInverse.data.aid as number,
    fragmentId,
  };
}

function snapshot(reStruct: ReStruct) {
  const struct = reStruct.molecule;
  return {
    atoms: Array.from(struct.atoms, ([id, atom]) => ({
      id,
      fragment: atom.fragment,
      implicitH: atom.implicitH,
      label: atom.label,
      neighbors: [...atom.neighbors].sort((left, right) => left - right),
      position: [atom.pp.x, atom.pp.y],
      stereoLabel: atom.stereoLabel,
      stereoParity: atom.stereoParity,
    })).sort((left, right) => left.id - right.id),
    bonds: Array.from(struct.bonds, ([id, bond]) => ({
      id,
      begin: bond.begin,
      end: bond.end,
      hb1: bond.hb1,
      hb2: bond.hb2,
      stereo: bond.stereo,
      type: bond.type,
    })).sort((left, right) => left.id - right.id),
    fragments: Array.from(struct.frags, ([id, fragment]) => ({
      id,
      stereoAtoms: [...(fragment?.stereoAtoms ?? [])].sort(
        (left, right) => left - right,
      ),
    })).sort((left, right) => left.id - right.id),
    halfBonds: Array.from(struct.halfBonds, ([id, halfBond]) => ({
      id,
      begin: halfBond.begin,
      bid: halfBond.bid,
      end: halfBond.end,
    })).sort((left, right) => left.id - right.id),
    renderedAtoms: [...reStruct.atoms.keys()].sort(
      (left, right) => left - right,
    ),
    renderedBonds: [...reStruct.bonds.keys()].sort(
      (left, right) => left - right,
    ),
    renderedFragments: [...reStruct.frags.keys()].sort(
      (left, right) => left - right,
    ),
  };
}

describe('fromBondAddition transaction', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('rolls back fragment, atoms and bond when implicit-H calculation fails', () => {
    const reStruct = buildReStruct();
    const before = snapshot(reStruct);
    jest
      .spyOn(CalcImplicitH.prototype, 'perform')
      .mockImplementationOnce(() => {
        throw new Error('implicit H failed');
      });

    expect(() =>
      fromBondAddition(
        reStruct,
        { type: Bond.PATTERN.TYPE.SINGLE },
        { label: 'C' },
        { label: 'O' },
        new Vec2(0, 0),
        new Vec2(1, 0),
      ),
    ).toThrow('implicit H failed');

    expect(snapshot(reStruct)).toEqual(before);
  });

  it('rolls back the priority-sensitive bond action when stereo update fails', () => {
    const reStruct = buildReStruct();
    const before = snapshot(reStruct);
    jest
      .spyOn(bondStereoActions, 'fromBondStereoUpdate')
      .mockImplementationOnce(() => {
        throw new Error('stereo update failed');
      });

    expect(() =>
      fromBondAddition(
        reStruct,
        { type: Bond.PATTERN.TYPE.SINGLE },
        { label: 'C' },
        { label: 'O' },
        new Vec2(0, 0),
        new Vec2(1, 0),
      ),
    ).toThrow('stereo update failed');

    expect(snapshot(reStruct)).toEqual(before);
  });

  it('rolls back an already executed stereo child action when a later step fails', () => {
    const reStruct = buildReStruct();
    const before = snapshot(reStruct);
    jest
      .spyOn(bondStereoActions, 'fromBondStereoUpdate')
      .mockImplementationOnce((currentReStruct, currentBond) => {
        const inverse = new AtomAttr(currentBond.begin, 'label', 'N').perform(
          currentReStruct,
        );
        return new Action([inverse]);
      });
    jest
      .spyOn(FragmentStereoFlag.prototype, 'perform')
      .mockImplementationOnce(() => {
        throw new Error('stereo flag failed');
      });

    expect(() =>
      fromBondAddition(
        reStruct,
        { type: Bond.PATTERN.TYPE.SINGLE },
        { label: 'C' },
        { label: 'O' },
        new Vec2(0, 0),
        new Vec2(1, 0),
      ),
    ).toThrow('stereo flag failed');

    expect(snapshot(reStruct)).toEqual(before);
  });

  it('removes a directly-added superatom attachment point on failure', () => {
    const { beginAtomId, endAtomId, reStruct, sgroup } =
      buildSuperatomReStruct();
    jest
      .spyOn(CalcImplicitH.prototype, 'perform')
      .mockImplementationOnce(() => {
        throw new Error('implicit H failed');
      });

    expect(() =>
      fromBondAddition(
        reStruct,
        { type: Bond.PATTERN.TYPE.SINGLE },
        beginAtomId,
        endAtomId,
      ),
    ).toThrow('implicit H failed');

    expect(sgroup.getAttachmentPoints()).toHaveLength(0);
    expect(reStruct.molecule.bonds.size).toBe(0);
  });

  it('rolls back an already executed fragment merge when the final stereo flag fails', () => {
    const reStruct = buildReStruct();
    const begin = addAtomInOwnFragment(reStruct, new Vec2(0, 0));
    const end = addAtomInOwnFragment(reStruct, new Vec2(1, 0));
    reStruct.molecule.setImplicitHydrogen([begin.atomId, end.atomId]);
    const before = snapshot(reStruct);
    jest
      .spyOn(FragmentStereoFlag.prototype, 'perform')
      .mockImplementationOnce(() => {
        throw new Error('stereo flag failed');
      });

    expect(() =>
      fromBondAddition(
        reStruct,
        { type: Bond.PATTERN.TYPE.SINGLE },
        begin.atomId,
        end.atomId,
      ),
    ).toThrow('stereo flag failed');

    expect(snapshot(reStruct)).toEqual(before);
    expect(reStruct.molecule.atoms.get(begin.atomId)?.fragment).toBe(
      begin.fragmentId,
    );
    expect(reStruct.molecule.atoms.get(end.atomId)?.fragment).toBe(
      end.fragmentId,
    );
  });

  it('preserves the tuple and inverse Action undo/redo contract on success', () => {
    const reStruct = buildReStruct();
    const before = snapshot(reStruct);

    const [inverse, beginAtomId, endAtomId, bondId] = fromBondAddition(
      reStruct,
      { type: Bond.PATTERN.TYPE.DOUBLE },
      { label: 'C' },
      { label: 'O' },
      new Vec2(0, 0),
      new Vec2(1, 0),
    );
    const after = snapshot(reStruct);

    expect(reStruct.molecule.atoms.has(beginAtomId)).toBe(true);
    expect(reStruct.molecule.atoms.has(endAtomId)).toBe(true);
    expect(reStruct.molecule.bonds.get(bondId)).toMatchObject({
      begin: beginAtomId,
      end: endAtomId,
      type: Bond.PATTERN.TYPE.DOUBLE,
    });

    const redo = inverse.perform(reStruct);
    expect(snapshot(reStruct)).toEqual(before);

    redo.perform(reStruct);
    expect(snapshot(reStruct)).toEqual(after);
  });
});
