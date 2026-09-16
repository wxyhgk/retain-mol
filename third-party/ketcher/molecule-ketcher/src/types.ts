import type { MoleculeCanvasCommitResult, Struct } from 'ketcher-core';
import type {
  MoleculeCanvasChangeReason,
  MoleculeCanvasIssue,
  MoleculeCanvasApi,
} from 'molecule-contracts';

/** Host-owned committed-change signals, never renderer or pointer events. */
export interface MoleculeCanvasSource {
  getStruct(): Struct;
  subscribe(
    listener: (reason: Exclude<MoleculeCanvasChangeReason, 'initial'>) => void,
  ): () => void;
  /** null means available; a message describes macro/wizard/unmounted state. */
  getUnavailableReason?(): string | null;
  /** Semantic sidecars not stored directly on Struct, such as spin settings. */
  getAdditionalIssues?(): readonly MoleculeCanvasIssue[];
}

export interface MoleculeCanvasReaderOptions {
  documentId?: string;
  onListenerError?: (error: unknown) => void;
}

export interface MoleculeCanvasObserver extends MoleculeCanvasApi {
  dispose(): void;
}

export interface MoleculeCanvasEditSource extends MoleculeCanvasSource {
  getEditBusyReason(): string | null;
  /** onCommitted runs after installation succeeds and before change publication.
   * The host must publish exactly one edit after it, and must not fail or roll
   * back after this callback. Post-commit observer errors belong to diagnostics.
   */
  commit(
    struct: Struct,
    expected: Struct,
    onCommitted: () => void,
  ): MoleculeCanvasCommitResult;
}

export interface MoleculeCanvasEditorOptions
  extends MoleculeCanvasReaderOptions {
  maxPreparedEdits?: number;
  maxIdempotencyEntries?: number;
}
