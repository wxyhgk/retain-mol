import type { EditReceipt, MoleculeCommand, MoleculeDocumentSnapshot, PreparedEdit, Result } from './types.js';
export declare const CANVAS_SCHEMA = "retainmol.molecule-canvas.v1";
export interface MoleculeCanvasIssue {
    readonly code: 'unsupported-feature' | 'invalid-structure' | 'limit-exceeded';
    readonly message: string;
    readonly path?: string;
    readonly references?: readonly string[];
}
export type MoleculeCanvasChangeReason = 'initial' | 'edit' | 'undo' | 'redo' | 'replace' | 'untracked' | 'mode' | 'dispose';
export interface MoleculeCanvasState {
    readonly schema: typeof CANVAS_SCHEMA;
    readonly documentId: string;
    readonly revision: number;
    readonly status: 'ready' | 'unsupported' | 'unavailable' | 'disposed';
    readonly reason: MoleculeCanvasChangeReason;
    readonly issues: readonly MoleculeCanvasIssue[];
}
export interface MoleculeCanvasCapabilities {
    readonly profile: 'basic-graph-v1';
    readonly mode: 'micromolecules';
    readonly readDocument: 'supported';
    readonly subscribe: 'supported';
    readonly edit: 'supported' | 'unavailable';
    readonly chemistry: 'unavailable';
    readonly editing?: {
        readonly commands: readonly MoleculeCommand['op'][];
        readonly coordinates: 'required';
        readonly atomicBatches: 'supported';
        readonly history: 'canvas';
        readonly interaction: 'idle-selection-tool';
        readonly maxPreparedEdits: number;
        readonly maxIdempotencyEntries: number;
    };
}
/** Read the last committed micro canvas. Subscriptions report future changes. */
export interface MoleculeCanvasReader {
    getCapabilities(): MoleculeCanvasCapabilities;
    getState(): MoleculeCanvasState;
    getDocument(): Result<MoleculeDocumentSnapshot>;
    subscribe(listener: (state: MoleculeCanvasState) => void): () => void;
}
/** Explicit prepare/commit; preparation never writes to the live canvas. */
export interface MoleculeCanvasApi extends MoleculeCanvasReader {
    prepareEdit(request: unknown): Result<PreparedEdit>;
    commitEdit(request: unknown): Result<EditReceipt>;
    cancelEdit(request: unknown): Result<{
        readonly preparedId: string;
    }>;
}
