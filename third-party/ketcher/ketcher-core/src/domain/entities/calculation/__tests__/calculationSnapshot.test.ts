import { Atom } from 'domain/entities/atom';
import { Bond } from 'domain/entities/bond';
import {
  createCalculationSnapshotV1,
  type CalculationSnapshotV1,
} from 'domain/entities/calculation/calculationSnapshot';
import { Struct } from 'domain/entities/struct';
import { Vec2 } from 'domain/entities/vec2';

function addAtom(
  struct: Struct,
  sourceAtomId: number,
  attributes: ConstructorParameters<typeof Atom>[0],
): void {
  struct.atoms.set(sourceAtomId, new Atom(attributes));
}

function getAtom(struct: Struct, sourceAtomId: number): Atom {
  const atom = struct.atoms.get(sourceAtomId);
  if (!atom) throw new Error(`Missing test atom ${sourceAtomId}`);
  return atom;
}

describe('createCalculationSnapshotV1', () => {
  it('creates atom-centric, ordered computation data without mutating Struct', () => {
    const struct = new Struct();
    struct.name = 'carbon monoxide';
    addAtom(struct, 8, {
      label: 'O',
      charge: 1,
      pp: new Vec2(1.2, -0.5, 0.25),
    });
    addAtom(struct, 3, {
      label: 'C',
      charge: -1,
      implicitH: 0,
      pp: new Vec2(0, 0, 0),
    });
    struct.bonds.set(
      5,
      new Bond({ begin: 3, end: 8, type: Bond.PATTERN.TYPE.TRIPLE }),
    );

    const snapshot = createCalculationSnapshotV1(struct, {
      coordinateScaleToAngstrom: 2,
      sourceId: 'document:42',
    });

    expect(snapshot).toMatchObject({
      schemaVersion: '1.0',
      symbols: ['C', 'O'],
      geometryAngstrom: [
        [0, 0, 0],
        [2.4, -1, 0.5],
      ],
      totalCharge: 0,
      multiplicity: null,
      source: {
        type: 'ketcher-struct',
        name: 'carbon monoxide',
        sourceId: 'document:42',
      },
    });
    expect(snapshot.atoms[0]).toMatchObject({
      index: 0,
      sourceAtomId: 3,
      sourceAtomRef: 'atom:3',
      element: 'C',
      atomicNumber: 6,
      formalCharge: -1,
    });
    expect(snapshot.connectivity).toEqual([
      {
        sourceBondId: 5,
        sourceBondRef: 'bond:5',
        atomIndices: [0, 1],
        order: 3,
        ketcherBondType: Bond.PATTERN.TYPE.TRIPLE,
      },
    ]);
    expect(snapshot.atomOrder.map((atom) => atom.sourceAtomId)).toEqual([3, 8]);
    expect(struct.halfBonds.size).toBe(0);
    expect(struct.atoms.get(3)?.neighbors).toEqual([]);
  });

  it('derives connected fragments without relying on existing fragment ids', () => {
    const struct = new Struct();
    addAtom(struct, 0, { label: 'Na', charge: 1 });
    addAtom(struct, 1, { label: 'Cl', charge: -1 });
    addAtom(struct, 2, { label: 'C', charge: -1 });
    addAtom(struct, 3, { label: 'O' });
    struct.bonds.add(
      new Bond({ begin: 2, end: 3, type: Bond.PATTERN.TYPE.AROMATIC }),
    );

    const snapshot = createCalculationSnapshotV1(struct);

    expect(snapshot.connectivity[0].order).toBe(1.5);
    expect(snapshot.fragments).toEqual([
      {
        index: 0,
        atomIndices: [0],
        sourceAtomIds: [0],
        totalFormalCharge: 1,
      },
      {
        index: 1,
        atomIndices: [1],
        sourceAtomIds: [1],
        totalFormalCharge: -1,
      },
      {
        index: 2,
        atomIndices: [2, 3],
        sourceAtomIds: [2, 3],
        totalFormalCharge: -1,
      },
    ]);
  });

  it('only records an explicitly supplied multiplicity', () => {
    const struct = new Struct();
    addAtom(struct, 0, {
      label: 'C',
      radical: Atom.PATTERN.RADICAL.DOUPLET,
    });
    addAtom(struct, 1, {
      label: 'C',
      radical: Atom.PATTERN.RADICAL.DOUPLET,
    });

    expect(createCalculationSnapshotV1(struct).multiplicity).toBeNull();
    expect(
      createCalculationSnapshotV1(struct, { multiplicity: null }).provenance
        .multiplicityOrigin,
    ).toBe('unspecified');
    const triplet = createCalculationSnapshotV1(struct, { multiplicity: 3 });
    expect(triplet.multiplicity).toBe(3);
    expect(triplet.provenance.multiplicityOrigin).toBe('override');
  });

  it('returns a deeply frozen snapshot with a deterministic content revision', () => {
    const struct = new Struct();
    addAtom(struct, 0, { label: 'He', pp: new Vec2(0, 0, 0) });

    const first = createCalculationSnapshotV1(struct);
    const second = createCalculationSnapshotV1(struct);

    expect(first.revision).toBe(second.revision);
    expect(Object.isFrozen(first)).toBe(true);
    expect(Object.isFrozen(first.atoms)).toBe(true);
    expect(Object.isFrozen(first.atoms[0].coordinatesAngstrom)).toBe(true);

    getAtom(struct, 0).pp.x = 1;
    expect(createCalculationSnapshotV1(struct).revision).not.toBe(
      first.revision,
    );
  });

  it('rejects invalid coordinates and dangling bonds at the boundary', () => {
    const invalidCoordinate = new Struct();
    addAtom(invalidCoordinate, 0, {
      label: 'C',
      pp: new Vec2(0, 0, 0),
    });
    getAtom(invalidCoordinate, 0).pp.x = Number.NaN;
    expect(() => createCalculationSnapshotV1(invalidCoordinate)).toThrow(
      'coordinate 0 must be a finite number',
    );

    const danglingBond = new Struct();
    addAtom(danglingBond, 0, { label: 'C' });
    danglingBond.bonds.add(
      new Bond({ begin: 0, end: 99, type: Bond.PATTERN.TYPE.SINGLE }),
    );
    expect(() => createCalculationSnapshotV1(danglingBond)).toThrow(
      'references an atom outside the source Struct',
    );
  });

  it('exposes immutable fields at the type boundary', () => {
    const consumeSnapshot = (snapshot: CalculationSnapshotV1) => snapshot;
    const struct = new Struct();
    addAtom(struct, 0, { label: 'H' });
    expect(
      consumeSnapshot(createCalculationSnapshotV1(struct)).atoms,
    ).toHaveLength(1);
  });
});
