import type { Struct } from 'domain/entities/struct';
import {
  RECOGNIZED_MOLECULE_SCHEMA_VERSION,
  type RecognitionIssue,
  type RecognizedMoleculeV1,
} from './recognition.types';

export class MoleculeRecognitionError extends Error {
  readonly issues: RecognitionIssue[];

  constructor(issues: RecognitionIssue[]) {
    super(issues.map(({ message }) => message).join('; '));
    this.name = 'MoleculeRecognitionError';
    this.issues = issues;
  }
}

export function validateRecognizedStructure(
  structure: Struct,
): RecognitionIssue[] {
  const issues: RecognitionIssue[] = [];

  if (structure.atoms.size === 0) {
    issues.push({
      severity: 'error',
      code: 'empty-structure',
      message: 'No atoms were recognized in the image',
    });
  }

  structure.atoms.forEach((atom, atomId) => {
    if (!atom.label?.trim()) {
      issues.push({
        severity: 'error',
        code: 'invalid-atom-label',
        message: `Recognized atom ${atomId} has no label`,
        atomId,
      });
    }
    if (!Number.isFinite(atom.pp.x) || !Number.isFinite(atom.pp.y)) {
      issues.push({
        severity: 'error',
        code: 'invalid-atom-coordinate',
        message: `Recognized atom ${atomId} has invalid coordinates`,
        atomId,
      });
    }
  });

  structure.bonds.forEach((bond, bondId) => {
    if (!structure.atoms.has(bond.begin) || !structure.atoms.has(bond.end)) {
      issues.push({
        severity: 'error',
        code: 'dangling-bond',
        message: `Recognized bond ${bondId} references a missing atom`,
        bondId,
      });
    }
    if (bond.begin === bond.end) {
      issues.push({
        severity: 'error',
        code: 'self-bond',
        message: `Recognized bond ${bondId} connects an atom to itself`,
        bondId,
      });
    }
    if (!Number.isFinite(bond.type) || bond.type <= 0) {
      issues.push({
        severity: 'error',
        code: 'invalid-bond-order',
        message: `Recognized bond ${bondId} has an invalid type`,
        bondId,
      });
    }
  });

  return issues;
}

export function createRecognizedMolecule(
  provider: string,
  structure: Struct,
  options: { confidence?: number } = {},
): RecognizedMoleculeV1 {
  const issues = validateRecognizedStructure(structure);
  const errors = issues.filter(({ severity }) => severity === 'error');
  if (errors.length) {
    throw new MoleculeRecognitionError(errors);
  }

  const recognizedMolecule: RecognizedMoleculeV1 = {
    schemaVersion: RECOGNIZED_MOLECULE_SCHEMA_VERSION,
    provider,
    structure,
    issues,
  };
  if (
    options.confidence !== undefined &&
    Number.isFinite(options.confidence) &&
    options.confidence >= 0 &&
    options.confidence <= 1
  ) {
    recognizedMolecule.confidence = options.confidence;
  }
  return recognizedMolecule;
}
