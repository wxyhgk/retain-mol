import type { Struct } from '../../domain/entities/struct';
import { type RecognitionIssue, type RecognizedMoleculeV1 } from './recognition.types';
export declare class MoleculeRecognitionError extends Error {
    readonly issues: RecognitionIssue[];
    constructor(issues: RecognitionIssue[]);
}
export declare function validateRecognizedStructure(structure: Struct): RecognitionIssue[];
export declare function createRecognizedMolecule(provider: string, structure: Struct, options?: {
    confidence?: number;
}): RecognizedMoleculeV1;
