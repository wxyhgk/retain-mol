import { getItemsToFuse } from 'application/editor/actions/closelyFusing';
import { Atom, Bond, Struct, Vec2 } from 'domain/entities';

function addAtom(struct: Struct, x: number, y: number): number {
  return struct.atoms.add(new Atom({ label: 'C', pp: new Vec2(x, y) }));
}

function addBond(struct: Struct, begin: number, end: number): number {
  return struct.bonds.add(
    new Bond({ begin, end, type: Bond.PATTERN.TYPE.SINGLE }),
  );
}

function buildOverlappingBonds(sourceEndX = 1) {
  const struct = new Struct();
  const destinationBegin = addAtom(struct, 0, 0);
  const destinationEnd = addAtom(struct, 1, 0);
  const sourceBegin = addAtom(struct, 0, 0);
  const sourceEnd = addAtom(struct, sourceEndX, 0);
  const destinationBond = addBond(struct, destinationBegin, destinationEnd);
  const sourceBond = addBond(struct, sourceBegin, sourceEnd);

  return {
    struct,
    destinationBegin,
    destinationEnd,
    sourceBegin,
    sourceEnd,
    destinationBond,
    sourceBond,
  };
}

describe('getItemsToFuse', () => {
  it('returns null when the caller supplies no merge candidates', () => {
    const result = getItemsToFuse(new Struct(), {
      atoms: new Map(),
      bonds: new Map(),
      atomToFunctionalGroup: new Map(),
    });

    expect(result).toBeNull();
  });

  it('keeps a geometrically compatible bond and removes its endpoint atom merges', () => {
    const {
      struct,
      destinationBegin,
      destinationEnd,
      sourceBegin,
      sourceEnd,
      destinationBond,
      sourceBond,
    } = buildOverlappingBonds();
    const atomCandidates = new Map([
      [sourceBegin, destinationBegin],
      [sourceEnd, destinationEnd],
    ]);
    const bondCandidates = new Map([[sourceBond, destinationBond]]);

    const result = getItemsToFuse(struct, {
      atoms: atomCandidates,
      bonds: bondCandidates,
      atomToFunctionalGroup: new Map(),
    });

    expect(result).toEqual({
      atoms: new Map(),
      bonds: bondCandidates,
      atomToFunctionalGroup: new Map(),
    });
    expect(atomCandidates.size).toBe(2);
  });

  it('rejects an incompatible bond without discarding independent atom candidates', () => {
    const {
      struct,
      destinationBegin,
      destinationEnd,
      sourceBegin,
      sourceEnd,
      destinationBond,
      sourceBond,
    } = buildOverlappingBonds(2);
    const atomCandidates = new Map([
      [sourceBegin, destinationBegin],
      [sourceEnd, destinationEnd],
    ]);

    const result = getItemsToFuse(struct, {
      atoms: atomCandidates,
      bonds: new Map([[sourceBond, destinationBond]]),
      atomToFunctionalGroup: new Map(),
    });

    expect(result).toEqual({
      atoms: atomCandidates,
      bonds: new Map(),
      atomToFunctionalGroup: new Map(),
    });
  });

  it('drops stale bond ids while preserving functional-group candidates', () => {
    const struct = new Struct();
    const functionalGroupCandidates = new Map([[3, 7]]);

    const result = getItemsToFuse(struct, {
      atoms: new Map(),
      bonds: new Map([[11, 12]]),
      atomToFunctionalGroup: functionalGroupCandidates,
    });

    expect(result).toEqual({
      atoms: new Map(),
      bonds: new Map(),
      atomToFunctionalGroup: functionalGroupCandidates,
    });
  });
});
