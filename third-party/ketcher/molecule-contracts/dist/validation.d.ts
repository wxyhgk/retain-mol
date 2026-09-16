import type { CancelRequest, CommitRequest, HistoryRequest, MoleculeDocumentSnapshot, MoleculeEditRequest, Result } from './types.js';
/** Validate and detach JSON input. Graph integrity is the engine's responsibility. */
export declare function validateEditRequest(input: unknown): Result<MoleculeEditRequest>;
export declare function validateDocumentSnapshot(input: unknown): Result<MoleculeDocumentSnapshot>;
export declare function validateCommitRequest(input: unknown): Result<CommitRequest>;
export declare function validateCancelRequest(input: unknown): Result<CancelRequest>;
export declare function validateHistoryRequest(input: unknown): Result<HistoryRequest>;
