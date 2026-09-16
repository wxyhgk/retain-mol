import type { Struct } from '../../domain/entities/struct';
export declare const RECOGNIZED_MOLECULE_SCHEMA_VERSION: "recognized-molecule.v1";
export type RecognitionIssueCode = 'empty-structure' | 'invalid-atom-label' | 'invalid-atom-coordinate' | 'dangling-bond' | 'self-bond' | 'invalid-bond-order';
export type RecognitionIssue = {
    severity: 'error' | 'warning';
    code: RecognitionIssueCode;
    message: string;
    atomId?: number;
    bondId?: number;
};
export type RecognizeImageInput = {
    image: Blob;
    version?: string;
};
export type RecognizedMoleculeV1 = {
    schemaVersion: typeof RECOGNIZED_MOLECULE_SCHEMA_VERSION;
    provider: string;
    structure: Struct;
    issues: RecognitionIssue[];
    confidence?: number;
};
/**
 * Provider-neutral boundary for image-to-structure recognition. Imago and a
 * future AI/OCSR provider must return the same validated contract.
 */
export interface MoleculeRecognitionAdapter {
    readonly provider: string;
    recognize(input: RecognizeImageInput): Promise<RecognizedMoleculeV1>;
}
