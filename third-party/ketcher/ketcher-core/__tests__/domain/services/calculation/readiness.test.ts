import type {
  CalculationAtom,
  CalculationSnapshotV1,
} from 'domain/entities/calculation/calculationSnapshot';
import { validateCalculationReadiness } from 'domain/services/calculation/readiness';

function atom(
  index: number,
  element: string,
  atomicNumber: number | null,
  coordinatesAngstrom: readonly [number, number, number],
  overrides: Partial<CalculationAtom> = {},
): CalculationAtom {
  return {
    index,
    sourceAtomId: index,
    sourceAtomRef: `atom-${index}`,
    element,
    atomicNumber,
    coordinatesAngstrom,
    formalCharge: 0,
    isotope: null,
    radical: 0,
    implicitHydrogenCount: 0,
    ...overrides,
  };
}

function snapshot(
  atoms: readonly CalculationAtom[],
  overrides: Partial<CalculationSnapshotV1> = {},
): CalculationSnapshotV1 {
  return {
    schemaVersion: '1.0',
    atoms,
    symbols: atoms.map(({ element }) => element),
    geometryAngstrom: atoms.map(
      ({ coordinatesAngstrom }) => coordinatesAngstrom,
    ),
    atomOrder: atoms.map(({ index, sourceAtomId, sourceAtomRef }) => ({
      index,
      sourceAtomId,
      sourceAtomRef,
    })),
    connectivity: [],
    totalCharge: 0,
    multiplicity: 1,
    fragments:
      atoms.length === 0
        ? []
        : [
            {
              index: 0,
              atomIndices: atoms.map(({ index }) => index),
              sourceAtomIds: atoms.map(({ sourceAtomId }) => sourceAtomId),
              totalFormalCharge: atoms.reduce(
                (sum, { formalCharge }) => sum + formalCharge,
                0,
              ),
            },
          ],
    source: {
      type: 'ketcher-struct',
      name: null,
      sourceId: null,
    },
    provenance: {
      generator: 'ketcher-core',
      operation: 'createCalculationSnapshotV1',
      coordinateScaleToAngstrom: 1,
      totalChargeOrigin: 'override',
      multiplicityOrigin: 'override',
    },
    revision: 'test-revision',
    ...overrides,
  };
}

function issueCodes(result: ReturnType<typeof validateCalculationReadiness>) {
  return result.issues.map(({ code }) => code);
}

describe('validateCalculationReadiness', () => {
  it('accepts a finite 3D closed-shell molecule', () => {
    const atoms = [
      atom(0, 'C', 6, [0, 0, 0]),
      atom(1, 'H', 1, [1, 1, 1]),
      atom(2, 'H', 1, [-1, -1, 1]),
      atom(3, 'H', 1, [1, -1, -1]),
      atom(4, 'H', 1, [-1, 1, -1]),
    ];

    const result = validateCalculationReadiness(snapshot(atoms));

    expect(result.ready).toBe(true);
    expect(result.electronCount).toBe(10);
    expect(result.issues).toEqual([]);
  });

  it('rejects an empty structure', () => {
    const result = validateCalculationReadiness(snapshot([]));

    expect(result.ready).toBe(false);
    expect(issueCodes(result)).toContain('EMPTY_STRUCTURE');
  });

  it('reports missing and non-finite coordinates with affected atom refs', () => {
    const missing = atom(0, 'H', 1, [0, 0, 0]);
    const nonFinite = atom(1, 'H', 1, [0, 0, Number.NaN]);
    Object.assign(missing, { coordinatesAngstrom: [0, 0] });

    const result = validateCalculationReadiness(
      snapshot([missing, nonFinite], { multiplicity: 1 }),
    );

    expect(result.ready).toBe(false);
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'MISSING_COORDINATES',
          atomRefs: [missing.sourceAtomRef],
        }),
        expect.objectContaining({
          code: 'NON_FINITE_COORDINATES',
          atomRefs: [nonFinite.sourceAtomRef],
        }),
      ]),
    );
  });

  it('warns when all coordinates lie in one z-plane', () => {
    const result = validateCalculationReadiness(
      snapshot([
        atom(0, 'O', 8, [0, 0, 0]),
        atom(1, 'H', 1, [1, 0, 0]),
        atom(2, 'H', 1, [-1, 0, 0]),
      ]),
    );

    expect(result.ready).toBe(true);
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        code: 'GEOMETRY_APPEARS_TWO_DIMENSIONAL',
        severity: 'warning',
      }),
    );
  });

  it('uses periodic-table data when the atomic number is absent', () => {
    const result = validateCalculationReadiness(
      snapshot([atom(0, 'He', null, [0, 0, 0])]),
    );

    expect(result.electronCount).toBe(2);
    expect(issueCodes(result)).not.toContain('UNKNOWN_ATOMIC_NUMBER');
  });

  it('rejects atoms whose atomic number cannot be determined', () => {
    const unknown = atom(0, 'R#', null, [0, 0, 0]);
    const result = validateCalculationReadiness(snapshot([unknown]));

    expect(result.ready).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        code: 'UNKNOWN_ATOMIC_NUMBER',
        atomRefs: [unknown.sourceAtomRef],
      }),
    );
  });

  it('rejects a supplied atomic number that conflicts with its element', () => {
    const mismatched = atom(0, 'C', 8, [0, 0, 0]);
    const result = validateCalculationReadiness(snapshot([mismatched]));

    expect(result.ready).toBe(false);
    expect(issueCodes(result)).toContain('ATOMIC_NUMBER_MISMATCH');
  });

  it('warns about an inferred charge without blocking a valid molecule', () => {
    const neutralHelium = atom(0, 'He', 2, [0, 0, 0]);
    const result = validateCalculationReadiness(
      snapshot([neutralHelium], {
        totalCharge: undefined as unknown as number,
      }),
    );

    expect(result.ready).toBe(true);
    expect(result.effectiveTotalCharge).toBe(0);
    expect(issueCodes(result)).toContain('TOTAL_CHARGE_INFERRED');
  });

  it('reports provenance-based charge and multiplicity defaults as warnings', () => {
    const helium = atom(0, 'He', 2, [0, 0, 0]);
    const result = validateCalculationReadiness(
      snapshot([helium], {
        provenance: {
          generator: 'ketcher-core',
          operation: 'createCalculationSnapshotV1',
          coordinateScaleToAngstrom: 1,
          totalChargeOrigin: 'formal-charges',
          multiplicityOrigin: 'unspecified',
        },
      }),
    );

    expect(result.ready).toBe(true);
    expect(issueCodes(result)).toEqual(
      expect.arrayContaining([
        'TOTAL_CHARGE_INFERRED',
        'MULTIPLICITY_UNSPECIFIED',
      ]),
    );
  });

  it('assumes singlet for an unspecified multiplicity and rejects odd electron parity', () => {
    const hydrogen = atom(0, 'H', 1, [0, 0, 0]);
    const result = validateCalculationReadiness(
      snapshot([hydrogen], { multiplicity: null }),
    );

    expect(result.ready).toBe(false);
    expect(result.effectiveMultiplicity).toBe(1);
    expect(issueCodes(result)).toEqual(
      expect.arrayContaining([
        'MULTIPLICITY_UNSPECIFIED',
        'ELECTRON_MULTIPLICITY_MISMATCH',
      ]),
    );
  });

  it('accepts odd electron parity with an explicit doublet multiplicity', () => {
    const result = validateCalculationReadiness(
      snapshot([atom(0, 'H', 1, [0, 0, 0])], { multiplicity: 2 }),
    );

    expect(result.ready).toBe(true);
    expect(issueCodes(result)).not.toContain('ELECTRON_MULTIPLICITY_MISMATCH');
  });

  it('warns for multiple fragments and explicit implicit-hydrogen metadata', () => {
    const carbon = atom(0, 'C', 6, [0, 0, 0], {
      implicitHydrogenCount: 4,
    });
    const helium = atom(1, 'He', 2, [2, 0, 1]);
    const result = validateCalculationReadiness(
      snapshot([carbon, helium], {
        fragments: [
          {
            index: 0,
            atomIndices: [0],
            sourceAtomIds: [carbon.sourceAtomId],
            totalFormalCharge: 0,
          },
          {
            index: 1,
            atomIndices: [1],
            sourceAtomIds: [helium.sourceAtomId],
            totalFormalCharge: 0,
          },
        ],
      }),
    );

    expect(result.ready).toBe(true);
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'MULTIPLE_FRAGMENTS',
          severity: 'warning',
        }),
        expect.objectContaining({
          code: 'IMPLICIT_HYDROGENS_PRESENT',
          severity: 'warning',
          atomRefs: [carbon.sourceAtomRef],
        }),
      ]),
    );
  });
});
