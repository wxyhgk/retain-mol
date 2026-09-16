import type { Struct } from 'ketcher-core';
import { type MoleculeCanvasIssue, type MoleculeDocumentSnapshot } from 'molecule-contracts';
export type ProjectionResult = {
    ok: true;
    document: MoleculeDocumentSnapshot;
} | {
    ok: false;
    issues: readonly MoleculeCanvasIssue[];
};
type Identity = {
    documentId: string;
    revision: number;
    atomId(runtimeId: number): string;
    bondId(runtimeId: number): string;
};
/**
 * Read the live Struct without cloning, serializing, normalizing or freezing it.
 * The caller owns document identity and must check out-of-band metadata first.
 * Highlights/selection stay in the authoritative canvas and are deliberately
 * absent from this read-only graph projection.
 */
export declare function projectStructure(struct: Struct, identity: Identity): ProjectionResult;
export {};
