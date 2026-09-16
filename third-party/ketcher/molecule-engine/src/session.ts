import {
  DOCUMENT_SCHEMA,
  EDIT_SCHEMA,
  PROFILE,
  validateCancelRequest,
  validateCommitRequest,
  validateDocumentSnapshot,
  validateEditRequest,
  validateHistoryRequest,
  type EditReceipt,
  type HistoryReceipt,
  type MoleculeDocumentSnapshot,
  type MoleculeWarning,
  type PreparedEdit,
  type Result,
} from 'molecule-contracts';
import {
  buildDraft,
  diffGraph,
  MAX_ATOMS,
  MAX_BONDS,
  validateGraph,
} from './graph.js';
import { canonicalJson, failure, freeze, success } from './results.js';
import type {
  MoleculeCapabilities,
  MoleculeSession,
  MoleculeSessionOptions,
} from './types.js';

const DEFAULT_PREPARED_EDITS = 32;
const DEFAULT_HISTORY_ENTRIES = 100;
const DEFAULT_IDEMPOTENCY_ENTRIES = 100;
const MAX_CACHE_ENTRIES = 10_000;
const MAX_COMMANDS = 1_000;
// Combine an unpredictable namespace with a local counter. A process restart or
// JSON restoration must not recreate deleted entity IDs or old prepared tokens.
// These identifiers still do not replace host authorization.
let sessionSequence = 0;

function createNamespace(): Result<string> {
  if (sessionSequence === Number.MAX_SAFE_INTEGER) {
    return failure(
      'limit-exceeded',
      'The runtime session ID limit was reached.',
    );
  }
  // This narrow runtime port keeps Node and DOM type packages out of the engine.
  // Web Crypto is provided by Node 24+ and modern browser environments.
  const runtime = globalThis as {
    crypto?: { getRandomValues(array: Uint8Array): Uint8Array };
  };
  try {
    if (typeof runtime.crypto?.getRandomValues !== 'function') {
      return failure(
        'unsupported-runtime',
        'This runtime must provide Web Crypto getRandomValues for session IDs.',
      );
    }
    const bytes = new Uint8Array(16);
    runtime.crypto.getRandomValues(bytes);
    const random = [...bytes]
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
    return success(`session-${random}-${++sessionSequence}`);
  } catch {
    return failure(
      'unsupported-runtime',
      'The runtime could not generate a Web Crypto session ID.',
    );
  }
}

const warnings: readonly MoleculeWarning[] = freeze([
  {
    code: 'chemistry-unchecked',
    message:
      'Only basic graph integrity was validated. Valence, stereochemistry and chemical validity were not checked.',
  },
]);

interface SessionConfiguration {
  snapshot: MoleculeDocumentSnapshot;
  maxPreparedEdits: number;
  maxHistoryEntries: number;
  maxIdempotencyEntries: number;
}

interface PendingEdit {
  fingerprint: string;
  prepared: PreparedEdit;
}

interface CommittedEdit extends PendingEdit {
  receipt: EditReceipt;
}

interface HistoryEntry {
  commitId: string;
  before: MoleculeDocumentSnapshot;
  after: MoleculeDocumentSnapshot;
}

function configure(
  options: MoleculeSessionOptions,
): Result<SessionConfiguration> {
  try {
    if (
      options === null ||
      typeof options !== 'object' ||
      (Object.getPrototypeOf(options) !== Object.prototype &&
        Object.getPrototypeOf(options) !== null)
    ) {
      return failure(
        'invalid-request',
        'Session options must be a plain object.',
      );
    }
    const allowed = new Set([
      'documentId',
      'snapshot',
      'maxPreparedEdits',
      'maxHistoryEntries',
      'maxIdempotencyEntries',
    ]);
    for (const key of Reflect.ownKeys(options)) {
      const descriptor = Object.getOwnPropertyDescriptor(options, key);
      if (
        typeof key !== 'string' ||
        !allowed.has(key) ||
        !descriptor ||
        !('value' in descriptor) ||
        !descriptor.enumerable
      ) {
        return failure(
          'invalid-request',
          'Session options contain an unknown field or a non-data property.',
        );
      }
    }
    // Use the published document validator for document identity and revision
    // constraints even when the session begins with an empty graph.
    const empty = validateDocumentSnapshot({
      schema: DOCUMENT_SCHEMA,
      profile: PROFILE,
      documentId: options.documentId,
      revision: 0,
      atoms: [],
      bonds: [],
    });
    if (!empty.ok) return freeze(empty);
    const restored =
      options.snapshot === undefined
        ? empty
        : validateDocumentSnapshot(options.snapshot);
    if (!restored.ok) return freeze(restored);
    if (restored.value.documentId !== options.documentId) {
      return failure(
        'document-mismatch',
        'The initial snapshot belongs to a different document.',
      );
    }
    const graph = validateGraph(restored.value);
    if (!graph.ok) return graph;
    const limits = {
      maxPreparedEdits:
        options.maxPreparedEdits === undefined
          ? DEFAULT_PREPARED_EDITS
          : options.maxPreparedEdits,
      maxHistoryEntries:
        options.maxHistoryEntries === undefined
          ? DEFAULT_HISTORY_ENTRIES
          : options.maxHistoryEntries,
      maxIdempotencyEntries:
        options.maxIdempotencyEntries === undefined
          ? DEFAULT_IDEMPOTENCY_ENTRIES
          : options.maxIdempotencyEntries,
    };
    for (const [name, limit] of Object.entries(limits)) {
      if (
        !Number.isSafeInteger(limit) ||
        limit < 1 ||
        limit > MAX_CACHE_ENTRIES
      ) {
        return failure(
          'invalid-request',
          `${name} must be an integer between 1 and ${MAX_CACHE_ENTRIES}.`,
          { path: `/${name}` },
        );
      }
    }
    return success({ snapshot: graph.value, ...limits });
  } catch {
    return failure('invalid-request', 'Could not read session options.');
  }
}

/**
 * Own one basic-graph document in memory. All methods are synchronous, so the
 * revision check and state replacement share one JavaScript critical section.
 * Hosts must provide their own authorization and persistence.
 */
export function createMoleculeSession(
  options: MoleculeSessionOptions,
): Result<MoleculeSession> {
  const configuration = configure(options);
  if (!configuration.ok) return configuration;
  const identity = createNamespace();
  if (!identity.ok) return identity;
  const namespace = identity.value;
  const { maxPreparedEdits, maxHistoryEntries, maxIdempotencyEntries } =
    configuration.value;
  let document = configuration.value.snapshot;
  let preparedSequence = 0;
  let commitSequence = 0;
  const pendingById = new Map<string, PendingEdit>();
  const pendingByRequest = new Map<string, PendingEdit>();
  const committedById = new Map<string, CommittedEdit>();
  const committedByRequest = new Map<string, CommittedEdit>();
  const undoStack: HistoryEntry[] = [];
  const redoStack: HistoryEntry[] = [];
  // Only imported IDs need tombstones: IDs created here contain a unique
  // preparation sequence and cannot be allocated by a later preparation.
  const importedIds = new Set([
    ...document.atoms.map(({ id }) => id),
    ...document.bonds.map(({ id }) => id),
  ]);
  const capabilities: MoleculeCapabilities = freeze({
    editSchema: EDIT_SCHEMA,
    documentSchema: DOCUMENT_SCHEMA,
    profile: PROFILE,
    commands: [
      'atom.add',
      'atom.update',
      'atom.remove',
      'bond.add',
      'bond.update',
      'bond.remove',
    ],
    validation: { topology: 'supported', chemistry: 'unavailable' },
    features: {
      stableIds: 'supported',
      atomicBatches: 'supported',
      prepareCommit: 'supported',
      undoRedo: 'supported',
      coordinates: 'supported',
      valence: 'unavailable',
      layout: 'unavailable',
      importExport: 'unavailable',
      canvasAdapter: 'unavailable',
      stereochemistry: 'unsupported',
      queryAtoms: 'unsupported',
      sGroups: 'unsupported',
      aromaticBonds: 'unsupported',
    },
    limits: {
      maxAtoms: MAX_ATOMS,
      maxBonds: MAX_BONDS,
      maxCommands: MAX_COMMANDS,
      maxPreparedEdits,
      maxHistoryEntries,
      maxIdempotencyEntries,
      maxJsonDepth: 32,
      maxJsonNodes: 250_000,
    },
    idempotency: { scope: 'session', eviction: 'oldest-commit' },
    history: { scope: 'session', restoredSnapshotsStartEmpty: true },
  });

  const checkVersion = (
    documentId: string,
    baseRevision: number,
  ): Result<true> => {
    if (documentId !== document.documentId) {
      return failure(
        'document-mismatch',
        'This session owns another document.',
      );
    }
    if (baseRevision !== document.revision) {
      return failure(
        'revision-conflict',
        'Read the current document and prepare an edit against its revision.',
        { currentRevision: document.revision },
      );
    }
    return success(true);
  };

  const canAdvanceRevision = (): Result<true> =>
    document.revision === Number.MAX_SAFE_INTEGER
      ? failure('limit-exceeded', 'The document revision limit was reached.', {
          currentRevision: document.revision,
        })
      : success(true);

  function prepareEdit(input: unknown): Result<PreparedEdit> {
    const validated = validateEditRequest(input);
    if (!validated.ok) return freeze(validated);
    const request = validated.value;
    const fingerprint = canonicalJson(request);
    const existing =
      pendingByRequest.get(request.requestId) ??
      committedByRequest.get(request.requestId);
    if (existing) {
      return existing.fingerprint === fingerprint
        ? success(existing.prepared)
        : failure(
            'request-id-conflict',
            'The request ID is already bound to different edit content.',
          );
    }
    const version = checkVersion(request.documentId, request.baseRevision);
    if (!version.ok) return version;
    const revision = canAdvanceRevision();
    if (!revision.ok) return revision;
    if (pendingById.size >= maxPreparedEdits) {
      return failure(
        'limit-exceeded',
        'The pending draft limit was reached; commit or cancel a draft first.',
      );
    }
    if (preparedSequence === Number.MAX_SAFE_INTEGER) {
      return failure('limit-exceeded', 'The preparation ID limit was reached.');
    }
    const preparedId = `${namespace}:p${preparedSequence + 1}`;
    const draft = buildDraft(document, request, preparedId, importedIds);
    if (!draft.ok) return draft;
    const prepared: PreparedEdit = freeze({
      preparedId,
      requestId: request.requestId,
      baseRevision: request.baseRevision,
      candidate: draft.value.candidate,
      changes: draft.value.changes,
      refs: draft.value.refs,
      warnings,
    });
    const pending = { fingerprint, prepared };
    preparedSequence += 1;
    pendingById.set(preparedId, pending);
    pendingByRequest.set(request.requestId, pending);
    return success(prepared);
  }

  function commitEdit(input: unknown): Result<EditReceipt> {
    const validated = validateCommitRequest(input);
    if (!validated.ok) return freeze(validated);
    const request = validated.value;
    const committed = committedById.get(request.preparedId);
    if (committed) {
      return committed.prepared.requestId === request.requestId
        ? success(committed.receipt)
        : failure(
            'request-id-conflict',
            'The prepared edit belongs to a different request ID.',
          );
    }
    const pending = pendingById.get(request.preparedId);
    if (!pending) {
      return failure(
        'prepared-not-found',
        'The prepared edit is absent, cancelled, evicted or from another session.',
      );
    }
    const { prepared } = pending;
    if (prepared.requestId !== request.requestId) {
      return failure(
        'request-id-conflict',
        'The prepared edit belongs to a different request ID.',
      );
    }
    const version = checkVersion(
      prepared.candidate.documentId,
      prepared.baseRevision,
    );
    if (!version.ok) return version;
    const revision = canAdvanceRevision();
    if (!revision.ok) return revision;
    if (commitSequence === Number.MAX_SAFE_INTEGER) {
      return failure('limit-exceeded', 'The commit ID limit was reached.');
    }

    const commitId = `${namespace}:c${commitSequence + 1}`;
    const after = freeze({
      ...prepared.candidate,
      revision: document.revision + 1,
    });
    const receipt: EditReceipt = freeze({
      documentId: document.documentId,
      commitId,
      requestId: request.requestId,
      revision: after.revision,
      changes: prepared.changes,
      refs: prepared.refs,
      warnings,
    });
    const entry = { commitId, before: document, after };
    const completed: CommittedEdit = { ...pending, receipt };

    document = after;
    commitSequence += 1;
    undoStack.push(entry);
    if (undoStack.length > maxHistoryEntries) undoStack.shift();
    redoStack.length = 0;
    pendingById.delete(request.preparedId);
    pendingByRequest.delete(request.requestId);
    committedById.set(request.preparedId, completed);
    committedByRequest.set(request.requestId, completed);
    if (committedByRequest.size > maxIdempotencyEntries) {
      const oldest = committedByRequest.values().next().value!;
      committedByRequest.delete(oldest.prepared.requestId);
      committedById.delete(oldest.prepared.preparedId);
    }
    return success(receipt);
  }

  function cancelEdit(input: unknown): Result<{ preparedId: string }> {
    const validated = validateCancelRequest(input);
    if (!validated.ok) return freeze(validated);
    const request = validated.value;
    const pending = pendingById.get(request.preparedId);
    if (!pending) {
      return failure(
        'prepared-not-found',
        'There is no pending edit to cancel.',
      );
    }
    if (pending.prepared.requestId !== request.requestId) {
      return failure(
        'request-id-conflict',
        'The prepared edit belongs to a different request ID.',
      );
    }
    pendingById.delete(request.preparedId);
    pendingByRequest.delete(request.requestId);
    return success({ preparedId: request.preparedId });
  }

  function moveHistory(
    input: unknown,
    direction: 'undo' | 'redo',
  ): Result<HistoryReceipt> {
    const validated = validateHistoryRequest(input);
    if (!validated.ok) return freeze(validated);
    const request = validated.value;
    const version = checkVersion(request.documentId, request.baseRevision);
    if (!version.ok) return version;
    const source = direction === 'undo' ? undoStack : redoStack;
    const destination = direction === 'undo' ? redoStack : undoStack;
    const entry = source.at(-1);
    if (!entry) {
      return failure('history-empty', `There is no edit to ${direction}.`);
    }
    if (entry.commitId !== request.expectedCommitId) {
      return failure(
        'history-conflict',
        `The most recent edit available to ${direction} is different.`,
        { references: [entry.commitId], currentRevision: document.revision },
      );
    }
    const revision = canAdvanceRevision();
    if (!revision.ok) return revision;
    const after = freeze({
      ...(direction === 'undo' ? entry.before : entry.after),
      revision: document.revision + 1,
    });
    const receipt: HistoryReceipt = freeze({
      documentId: document.documentId,
      commitId: entry.commitId,
      revision: after.revision,
      direction,
      changes: diffGraph(document, after),
    });
    document = after;
    source.pop();
    destination.push(entry);
    return success(receipt);
  }

  return success({
    getDocument: () => document,
    getCapabilities: () => capabilities,
    getHistory: () =>
      freeze({
        undo: undoStack.map(({ commitId }) => commitId),
        redo: redoStack.map(({ commitId }) => commitId),
      }),
    prepareEdit,
    commitEdit,
    cancelEdit,
    undo: (input) => moveHistory(input, 'undo'),
    redo: (input) => moveHistory(input, 'redo'),
  });
}
