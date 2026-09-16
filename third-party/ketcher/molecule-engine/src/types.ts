import type {
  EditReceipt,
  HistoryReceipt,
  MoleculeCommand,
  MoleculeDocumentSnapshot,
  PreparedEdit,
  Result,
} from 'molecule-contracts';

export interface MoleculeSessionOptions {
  documentId: string;
  snapshot?: unknown;
  maxPreparedEdits?: number;
  maxHistoryEntries?: number;
  maxIdempotencyEntries?: number;
}

export interface MoleculeCapabilities {
  readonly editSchema: 'retainmol.molecule-edit.v1';
  readonly documentSchema: 'retainmol.molecule-document.v1';
  readonly profile: 'basic-graph-v1';
  readonly commands: readonly MoleculeCommand['op'][];
  readonly validation: {
    readonly topology: 'supported';
    readonly chemistry: 'unavailable';
  };
  readonly features: {
    readonly stableIds: 'supported';
    readonly atomicBatches: 'supported';
    readonly prepareCommit: 'supported';
    readonly undoRedo: 'supported';
    readonly coordinates: 'supported';
    readonly valence: 'unavailable';
    readonly layout: 'unavailable';
    readonly importExport: 'unavailable';
    readonly canvasAdapter: 'unavailable';
    readonly stereochemistry: 'unsupported';
    readonly queryAtoms: 'unsupported';
    readonly sGroups: 'unsupported';
    readonly aromaticBonds: 'unsupported';
  };
  readonly limits: {
    readonly maxAtoms: number;
    readonly maxBonds: number;
    readonly maxCommands: number;
    readonly maxPreparedEdits: number;
    readonly maxHistoryEntries: number;
    readonly maxIdempotencyEntries: number;
    readonly maxJsonDepth: number;
    readonly maxJsonNodes: number;
  };
  readonly idempotency: {
    readonly scope: 'session';
    readonly eviction: 'oldest-commit';
  };
  readonly history: {
    readonly scope: 'session';
    readonly restoredSnapshotsStartEmpty: true;
  };
}

export interface MoleculeHistory {
  readonly undo: readonly string[];
  readonly redo: readonly string[];
}

export interface MoleculeSession {
  getDocument(): MoleculeDocumentSnapshot;
  getCapabilities(): MoleculeCapabilities;
  getHistory(): MoleculeHistory;
  prepareEdit(input: unknown): Result<PreparedEdit>;
  commitEdit(input: unknown): Result<EditReceipt>;
  cancelEdit(input: unknown): Result<{ readonly preparedId: string }>;
  undo(input: unknown): Result<HistoryReceipt>;
  redo(input: unknown): Result<HistoryReceipt>;
}
