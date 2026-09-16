export const EDIT_SCHEMA = 'retainmol.molecule-edit.v1';
export const DOCUMENT_SCHEMA = 'retainmol.molecule-document.v1';
export const PROFILE = 'basic-graph-v1';

export type EntityReference = { id: string } | { ref: string };
export type Position = { readonly x: number; readonly y: number };
export type BondOrder = 'single' | 'double' | 'triple';

export interface AtomProperties {
  element: string;
  charge: number;
  isotope?: number;
  position?: Position;
}

export interface Atom extends AtomProperties {
  id: string;
}

export interface Bond {
  id: string;
  begin: string;
  end: string;
  order: BondOrder;
}

export type MoleculeAtom = Atom;
export type MoleculeBond = Bond;

export interface MoleculeDocumentSnapshot {
  readonly schema: typeof DOCUMENT_SCHEMA;
  readonly profile: typeof PROFILE;
  readonly documentId: string;
  readonly revision: number;
  readonly atoms: readonly Readonly<Atom>[];
  readonly bonds: readonly Readonly<Bond>[];
}

export interface AtomPatch {
  element?: string;
  charge?: number;
  isotope?: number | null;
  position?: Position | null;
}

export type MoleculeCommand =
  | ({ op: 'atom.add'; ref: string; element: string } & Partial<
      Omit<AtomProperties, 'element'>
    >)
  | { op: 'atom.update'; target: EntityReference; patch: AtomPatch }
  | {
      op: 'atom.remove';
      target: EntityReference;
      incidentBonds: 'reject' | 'remove';
    }
  | {
      op: 'bond.add';
      ref: string;
      begin: EntityReference;
      end: EntityReference;
      order: BondOrder;
    }
  | { op: 'bond.update'; target: EntityReference; patch: { order: BondOrder } }
  | { op: 'bond.remove'; target: EntityReference };

export interface MoleculeEditRequest {
  schema: typeof EDIT_SCHEMA;
  documentId: string;
  baseRevision: number;
  requestId: string;
  commands: readonly MoleculeCommand[];
}

export interface CommitRequest {
  preparedId: string;
  requestId: string;
}

export type CancelRequest = CommitRequest;

export interface HistoryRequest {
  documentId: string;
  baseRevision: number;
  expectedCommitId: string;
}

export type ErrorCode =
  | 'invalid-request'
  | 'invalid-structure'
  | 'document-mismatch'
  | 'revision-conflict'
  | 'request-id-conflict'
  | 'reference-not-found'
  | 'duplicate-reference'
  | 'self-bond'
  | 'duplicate-bond'
  | 'atom-has-bonds'
  | 'no-change'
  | 'prepared-not-found'
  | 'history-conflict'
  | 'history-empty'
  | 'unsupported-runtime'
  | 'unsupported-document'
  | 'canvas-unavailable'
  | 'editing-unavailable'
  | 'canvas-busy'
  | 'canvas-changed'
  | 'canvas-commit-failed'
  | 'canvas-rollback-failed'
  | 'missing-coordinates'
  | 'reader-disposed'
  | 'limit-exceeded';

export interface MoleculeError {
  code: ErrorCode;
  message: string;
  commandIndex?: number;
  path?: string;
  references?: readonly string[];
  currentRevision?: number;
}

export type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: MoleculeError };

export interface EntityChanges {
  readonly created: readonly string[];
  readonly updated: readonly string[];
  readonly removed: readonly string[];
}

export interface ChangeSet {
  readonly atoms: EntityChanges;
  readonly bonds: EntityChanges;
}

export interface ReferenceMap {
  readonly atoms: Readonly<Record<string, string>>;
  readonly bonds: Readonly<Record<string, string>>;
}

export interface MoleculeWarning {
  readonly code: 'chemistry-unchecked';
  readonly message: string;
}

export interface PreparedEdit {
  readonly preparedId: string;
  readonly requestId: string;
  readonly baseRevision: number;
  readonly candidate: MoleculeDocumentSnapshot;
  readonly changes: ChangeSet;
  readonly refs: ReferenceMap;
  readonly warnings: readonly MoleculeWarning[];
}

export interface EditReceipt {
  readonly documentId: string;
  readonly commitId: string;
  readonly requestId: string;
  readonly revision: number;
  readonly changes: ChangeSet;
  readonly refs: ReferenceMap;
  readonly warnings: readonly MoleculeWarning[];
}

export interface HistoryReceipt {
  readonly documentId: string;
  readonly commitId: string;
  readonly revision: number;
  readonly direction: 'undo' | 'redo';
  readonly changes: ChangeSet;
}
