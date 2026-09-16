import { Elements } from '../../constants/elements';
import type { CalculationAtom } from '../../entities/calculation/calculationSnapshot';
import type {
  CalculationReadinessInput,
  CalculationReadinessIssue,
  CalculationReadinessResult,
} from './readiness.types';

const TWO_DIMENSIONAL_Z_TOLERANCE_ANGSTROM = 1e-8;

function atomicNumberFromElement(element: string): number | null {
  if (element === 'D' || element === 'T') {
    return 1;
  }

  return Elements.get(element)?.number ?? null;
}

function atomReference(atom: CalculationAtom): string {
  return atom.sourceAtomRef;
}

function uniqueAtomReferences(
  atoms: readonly CalculationAtom[],
): readonly string[] {
  return atoms.map(atomReference);
}

function inferFormalCharge(atoms: readonly CalculationAtom[]): number | null {
  const formalCharges = atoms.map(({ formalCharge }) => formalCharge);
  if (!formalCharges.every(Number.isFinite)) {
    return null;
  }

  const total = formalCharges.reduce((sum, charge) => sum + charge, 0);
  return Number.isInteger(total) ? total : null;
}

/**
 * Performs calculation-readiness checks without invoking a chemistry engine.
 * The checks deliberately avoid bond-order/valence inference. In particular,
 * missing hydrogen warnings are based only on explicit snapshot metadata.
 */
export function validateCalculationReadiness(
  snapshot: CalculationReadinessInput,
): CalculationReadinessResult {
  const issues: CalculationReadinessIssue[] = [];
  const atoms = snapshot.atoms ?? [];

  if (atoms.length === 0) {
    issues.push({
      code: 'EMPTY_STRUCTURE',
      severity: 'error',
      message: 'The calculation snapshot contains no atoms.',
      atomRefs: [],
    });
  }

  const missingCoordinateAtoms: CalculationAtom[] = [];
  const nonFiniteCoordinateAtoms: CalculationAtom[] = [];
  const finiteCoordinates: Array<readonly [number, number, number]> = [];

  atoms.forEach((atom) => {
    const coordinates = atom.coordinatesAngstrom as
      | readonly [number, number, number]
      | null
      | undefined;

    if (
      !coordinates ||
      coordinates.length < 3 ||
      coordinates.some(
        (coordinate) => coordinate === null || coordinate === undefined,
      )
    ) {
      missingCoordinateAtoms.push(atom);
      return;
    }

    if (!coordinates.every(Number.isFinite)) {
      nonFiniteCoordinateAtoms.push(atom);
      return;
    }

    finiteCoordinates.push(coordinates);
  });

  if (missingCoordinateAtoms.length > 0) {
    issues.push({
      code: 'MISSING_COORDINATES',
      severity: 'error',
      message: 'Some atoms do not have complete x, y, and z coordinates.',
      atomRefs: uniqueAtomReferences(missingCoordinateAtoms),
    });
  }

  if (nonFiniteCoordinateAtoms.length > 0) {
    issues.push({
      code: 'NON_FINITE_COORDINATES',
      severity: 'error',
      message: 'Some atom coordinates contain NaN or an infinite value.',
      atomRefs: uniqueAtomReferences(nonFiniteCoordinateAtoms),
    });
  }

  if (
    atoms.length > 0 &&
    finiteCoordinates.length === atoms.length &&
    finiteCoordinates.every(
      ([, , z]) =>
        Math.abs(z - finiteCoordinates[0][2]) <=
        TWO_DIMENSIONAL_Z_TOLERANCE_ANGSTROM,
    )
  ) {
    issues.push({
      code: 'GEOMETRY_APPEARS_TWO_DIMENSIONAL',
      severity: 'warning',
      message:
        'All atoms lie in one z-plane; confirm that the geometry is intentionally three-dimensional before calculation.',
      atomRefs: uniqueAtomReferences(atoms),
    });
  }

  const unknownAtomicNumberAtoms: CalculationAtom[] = [];
  const mismatchedAtomicNumberAtoms: CalculationAtom[] = [];
  const atomicNumbers: number[] = [];

  atoms.forEach((atom) => {
    const tableAtomicNumber = atomicNumberFromElement(atom.element);
    const suppliedAtomicNumber = atom.atomicNumber;

    if (suppliedAtomicNumber === null) {
      if (tableAtomicNumber === null) {
        unknownAtomicNumberAtoms.push(atom);
      } else {
        atomicNumbers.push(tableAtomicNumber);
      }
      return;
    }

    if (
      !Number.isInteger(suppliedAtomicNumber) ||
      suppliedAtomicNumber <= 0 ||
      Elements.get(suppliedAtomicNumber) === undefined
    ) {
      unknownAtomicNumberAtoms.push(atom);
      return;
    }

    atomicNumbers.push(suppliedAtomicNumber);
    if (
      tableAtomicNumber !== null &&
      tableAtomicNumber !== suppliedAtomicNumber
    ) {
      mismatchedAtomicNumberAtoms.push(atom);
    }
  });

  if (unknownAtomicNumberAtoms.length > 0) {
    issues.push({
      code: 'UNKNOWN_ATOMIC_NUMBER',
      severity: 'error',
      message:
        'The atomic number could not be determined for one or more atoms.',
      atomRefs: uniqueAtomReferences(unknownAtomicNumberAtoms),
    });
  }

  if (mismatchedAtomicNumberAtoms.length > 0) {
    issues.push({
      code: 'ATOMIC_NUMBER_MISMATCH',
      severity: 'error',
      message:
        'The supplied atomic number does not match the element label for one or more atoms.',
      atomRefs: uniqueAtomReferences(mismatchedAtomicNumberAtoms),
    });
  }

  const declaredTotalCharge = snapshot.totalCharge as number | null | undefined;
  let effectiveTotalCharge: number | null = declaredTotalCharge ?? null;

  if (declaredTotalCharge === null || declaredTotalCharge === undefined) {
    effectiveTotalCharge = inferFormalCharge(atoms);
  }

  if (
    declaredTotalCharge === null ||
    declaredTotalCharge === undefined ||
    snapshot.provenance?.totalChargeOrigin === 'formal-charges'
  ) {
    issues.push({
      code: 'TOTAL_CHARGE_INFERRED',
      severity: 'warning',
      message:
        effectiveTotalCharge === null
          ? 'Total charge is unspecified and could not be inferred from atom formal charges.'
          : `Total charge is unspecified; ${effectiveTotalCharge} was inferred from atom formal charges.`,
      atomRefs: uniqueAtomReferences(atoms),
    });
  }

  if (
    effectiveTotalCharge === null ||
    !Number.isFinite(effectiveTotalCharge) ||
    !Number.isInteger(effectiveTotalCharge)
  ) {
    issues.push({
      code: 'INVALID_TOTAL_CHARGE',
      severity: 'error',
      message: 'Total charge must be a finite integer.',
      atomRefs: uniqueAtomReferences(atoms),
    });
    effectiveTotalCharge = null;
  }

  const suppliedMultiplicity = snapshot.multiplicity;
  let effectiveMultiplicity: number | null = suppliedMultiplicity;
  if (suppliedMultiplicity === null || suppliedMultiplicity === undefined) {
    effectiveMultiplicity = 1;
    issues.push({
      code: 'MULTIPLICITY_UNSPECIFIED',
      severity: 'warning',
      message:
        'Spin multiplicity is unspecified; singlet multiplicity is assumed for readiness checks.',
      atomRefs: uniqueAtomReferences(atoms),
    });
  } else if (snapshot.provenance?.multiplicityOrigin === 'unspecified') {
    issues.push({
      code: 'MULTIPLICITY_UNSPECIFIED',
      severity: 'warning',
      message:
        'Spin multiplicity was not explicitly set; the supplied singlet value is being treated as a default.',
      atomRefs: uniqueAtomReferences(atoms),
    });
  } else if (
    !Number.isFinite(suppliedMultiplicity) ||
    !Number.isInteger(suppliedMultiplicity) ||
    suppliedMultiplicity < 1
  ) {
    issues.push({
      code: 'INVALID_MULTIPLICITY',
      severity: 'error',
      message: 'Spin multiplicity must be a positive integer.',
      atomRefs: uniqueAtomReferences(atoms),
    });
    effectiveMultiplicity = null;
  }

  let electronCount: number | null = null;
  if (
    atoms.length > 0 &&
    atomicNumbers.length === atoms.length &&
    effectiveTotalCharge !== null
  ) {
    electronCount =
      atomicNumbers.reduce((sum, atomicNumber) => sum + atomicNumber, 0) -
      effectiveTotalCharge;

    if (!Number.isInteger(electronCount) || electronCount < 0) {
      issues.push({
        code: 'INVALID_ELECTRON_COUNT',
        severity: 'error',
        message:
          'The atom list and total charge produce an invalid electron count.',
        atomRefs: uniqueAtomReferences(atoms),
      });
      electronCount = null;
    }
  }

  if (
    electronCount !== null &&
    effectiveMultiplicity !== null &&
    electronCount % 2 === effectiveMultiplicity % 2
  ) {
    issues.push({
      code: 'ELECTRON_MULTIPLICITY_MISMATCH',
      severity: 'error',
      message: `Electron count ${electronCount} is incompatible with spin multiplicity ${effectiveMultiplicity}.`,
      atomRefs: uniqueAtomReferences(atoms),
    });
  }

  if ((snapshot.fragments?.length ?? 0) > 1) {
    issues.push({
      code: 'MULTIPLE_FRAGMENTS',
      severity: 'warning',
      message: `The structure contains ${snapshot.fragments.length} disconnected fragments; confirm fragment charges and the intended calculation model.`,
      atomRefs: uniqueAtomReferences(atoms),
    });
  }

  const atomsWithImplicitHydrogens = atoms.filter(
    ({ implicitHydrogenCount }) =>
      implicitHydrogenCount !== null && implicitHydrogenCount > 0,
  );
  if (atomsWithImplicitHydrogens.length > 0) {
    issues.push({
      code: 'IMPLICIT_HYDROGENS_PRESENT',
      severity: 'warning',
      message:
        'Implicit hydrogens are present in the snapshot metadata but are not explicit calculation atoms.',
      atomRefs: uniqueAtomReferences(atomsWithImplicitHydrogens),
    });
  }

  return {
    ready: !issues.some(({ severity }) => severity === 'error'),
    issues,
    electronCount,
    effectiveTotalCharge,
    effectiveMultiplicity,
  };
}
