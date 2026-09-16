import {
  validateCancelRequest,
  validateCommitRequest,
  validateEditRequest,
  type EditReceipt,
  type ErrorCode,
  type MoleculeCanvasCapabilities,
  type MoleculeDocumentSnapshot,
  type PreparedEdit,
  type Result,
} from 'molecule-contracts';
import { createMoleculeSession } from 'molecule-engine';
import { buildCanvasCandidate } from './candidate.js';
import { createCanvasReaderController } from './reader.js';
import type {
  MoleculeCanvasEditSource,
  MoleculeCanvasEditorOptions,
  MoleculeCanvasObserver,
} from './types.js';

function freeze<T>(value: T): T {
  if (value !== null && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
}
function success<T>(value: T): Result<T> {
  return freeze({ ok: true, value });
}
function failure(
  code: ErrorCode,
  message: string,
  currentRevision?: number,
): Result<never> {
  return freeze({
    ok: false,
    error: {
      code,
      message,
      ...(currentRevision === undefined ? {} : { currentRevision }),
    },
  });
}
// Only used after the plain-JSON request validator has copied the input.
function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value !== null && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}
interface Pending {
  base: MoleculeDocumentSnapshot;
  prepared: PreparedEdit;
  fingerprint: string;
}
interface Committed extends Pending {
  receipt: EditReceipt;
}

/** Prepare in an isolated engine; the host remains the only canvas authority. */
export function createMoleculeCanvasEditor(
  source: MoleculeCanvasEditSource,
  options: MoleculeCanvasEditorOptions = {},
): Result<MoleculeCanvasObserver> {
  if (
    !source ||
    typeof source.getEditBusyReason !== 'function' ||
    typeof source.commit !== 'function'
  ) {
    return failure(
      'invalid-request',
      'Atomic canvas editing requires busy and commit ports.',
    );
  }
  const maxPreparedEdits = options.maxPreparedEdits ?? 32;
  const maxIdempotencyEntries = options.maxIdempotencyEntries ?? 100;
  for (const limit of [maxPreparedEdits, maxIdempotencyEntries]) {
    if (!Number.isSafeInteger(limit) || limit < 1 || limit > 10_000) {
      return failure(
        'invalid-request',
        'Canvas cache limits must be integers between 1 and 10000.',
      );
    }
  }
  const result = createCanvasReaderController(source, options);
  if (!result.ok) return result;
  const controller = result.value;
  const { reader } = controller;
  let activeSource: MoleculeCanvasEditSource | null = source;
  let committing = false;
  const pendingById = new Map<string, Pending>();
  const pendingByRequest = new Map<string, Pending>();
  const committedById = new Map<string, Committed>();
  const committedByRequest = new Map<string, Committed>();
  const release = () => {
    activeSource = null;
    pendingById.clear();
    pendingByRequest.clear();
    committedById.clear();
    committedByRequest.clear();
  };
  reader.subscribe((state) => {
    if (state.status === 'disposed') release();
  });
  // A source may terminate synchronously while subscribe() is being installed.
  if (reader.getState().status === 'disposed') release();
  const capabilities: MoleculeCanvasCapabilities = freeze({
    ...reader.getCapabilities(),
    edit: 'supported',
    editing: {
      commands: [
        'atom.add',
        'atom.update',
        'atom.remove',
        'bond.add',
        'bond.update',
        'bond.remove',
      ],
      coordinates: 'required',
      atomicBatches: 'supported',
      history: 'canvas',
      interaction: 'idle-selection-tool',
      maxPreparedEdits,
      maxIdempotencyEntries,
    },
  });

  function checkVersion(
    base: MoleculeDocumentSnapshot,
  ): Result<MoleculeDocumentSnapshot> {
    const current = reader.getDocument();
    if (!current.ok) return current;
    if (base.documentId !== current.value.documentId)
      return failure(
        'document-mismatch',
        'The edit belongs to a different canvas.',
      );
    if (base.revision !== current.value.revision)
      return failure(
        'revision-conflict',
        'The canvas changed after preparation. Prepare a new edit.',
        current.value.revision,
      );
    if (current.value.revision === Number.MAX_SAFE_INTEGER)
      return failure(
        'limit-exceeded',
        'The canvas revision limit was reached.',
      );
    return current;
  }
  function disposed(): Result<never> {
    return failure('reader-disposed', 'This canvas API has been disposed.');
  }
  function prepareEdit(input: unknown): Result<PreparedEdit> {
    if (!activeSource) return disposed();
    if (committing)
      return failure('canvas-busy', 'An atomic canvas commit is in progress.');
    const validated = validateEditRequest(input);
    if (!validated.ok) return freeze(validated);
    const request = validated.value;
    const fingerprint = canonicalJson(request);
    const existing =
      pendingByRequest.get(request.requestId) ??
      committedByRequest.get(request.requestId);
    if (existing)
      return existing.fingerprint === fingerprint
        ? success(existing.prepared)
        : failure(
            'request-id-conflict',
            'The request ID is already bound to different edit content.',
          );
    const current = reader.getDocument();
    if (!current.ok) return current;
    if (request.documentId !== current.value.documentId)
      return failure(
        'document-mismatch',
        'The edit belongs to a different canvas.',
      );
    if (request.baseRevision !== current.value.revision)
      return failure(
        'revision-conflict',
        'The edit base revision is stale.',
        current.value.revision,
      );
    if (pendingById.size >= maxPreparedEdits)
      return failure(
        'limit-exceeded',
        'Commit or cancel a pending edit before preparing another.',
      );
    const session = createMoleculeSession({
      documentId: current.value.documentId,
      snapshot: current.value,
    });
    if (!session.ok) return session;
    const prepared = session.value.prepareEdit(request);
    if (!prepared.ok) return prepared;
    if (prepared.value.candidate.atoms.some((atom) => !atom.position)) {
      return failure(
        'missing-coordinates',
        'Every canvas atom requires an explicit position; automatic layout is unavailable.',
      );
    }
    const entry = {
      base: current.value,
      prepared: prepared.value,
      fingerprint,
    };
    pendingById.set(entry.prepared.preparedId, entry);
    pendingByRequest.set(request.requestId, entry);
    return prepared;
  }

  function commitEdit(input: unknown): Result<EditReceipt> {
    if (!activeSource) return disposed();
    const validated = validateCommitRequest(input);
    if (!validated.ok) return freeze(validated);
    const request = validated.value;
    const completed = committedById.get(request.preparedId);
    if (completed)
      return completed.prepared.requestId === request.requestId
        ? success(completed.receipt)
        : failure(
            'request-id-conflict',
            'The prepared edit belongs to a different request ID.',
          );
    if (committing)
      return failure('canvas-busy', 'An atomic canvas commit is in progress.');
    const pending = pendingById.get(request.preparedId);
    if (!pending)
      return failure(
        'prepared-not-found',
        'The prepared edit is absent, cancelled, evicted or from another canvas.',
      );
    if (pending.prepared.requestId !== request.requestId)
      return failure(
        'request-id-conflict',
        'The prepared edit belongs to a different request ID.',
      );
    const version = checkVersion(pending.base);
    if (!version.ok) return version;
    const host = activeSource;
    let published: EditReceipt | undefined;
    committing = true;
    try {
      const busy = host.getEditBusyReason();
      if (busy) return failure('canvas-busy', busy);
      const live = host.getStruct();
      const identities = controller.getIdentities(live);
      if (!identities)
        return failure(
          'canvas-changed',
          'The live canvas differs from the committed snapshot.',
        );
      const built = buildCanvasCandidate(
        live,
        pending.base,
        pending.prepared.candidate,
        identities,
      );
      if (!built.ok) return freeze(built);
      const latest = checkVersion(pending.base);
      if (!latest.ok) return latest;
      controller.registerIdentities(built.value.struct, built.value.identities);
      const receipt: EditReceipt = freeze({
        documentId: pending.base.documentId,
        commitId: `${pending.prepared.preparedId}:commit`,
        requestId: request.requestId,
        revision: pending.base.revision + 1,
        changes: pending.prepared.changes,
        refs: pending.prepared.refs,
        warnings: pending.prepared.warnings,
      });
      const committed = host.commit(built.value.struct, live, () => {
        // Cache BEFORE the host publishes. Listener retries must never write twice.
        if (published) return;
        published = receipt;
        pendingById.delete(request.preparedId);
        pendingByRequest.delete(request.requestId);
        const entry = { ...pending, receipt };
        committedById.set(request.preparedId, entry);
        committedByRequest.set(request.requestId, entry);
        if (committedByRequest.size > maxIdempotencyEntries) {
          const oldest = committedByRequest.values().next().value!;
          committedByRequest.delete(oldest.prepared.requestId);
          committedById.delete(oldest.prepared.preparedId);
        }
      });
      if (published) return success(published);
      if (committed.ok)
        return failure(
          'canvas-commit-failed',
          'The host did not acknowledge the atomic commit.',
        );
      const codes = {
        busy: 'canvas-busy',
        changed: 'canvas-changed',
        render: 'canvas-commit-failed',
        rollback: 'canvas-rollback-failed',
      } as const;
      return failure(codes[committed.reason], committed.message);
    } catch {
      // Once published, observer failures cannot turn success into a retryable write.
      return published
        ? success(published)
        : failure('canvas-commit-failed', 'The atomic canvas commit failed.');
    } finally {
      committing = false;
    }
  }

  function cancelEdit(input: unknown): Result<{ preparedId: string }> {
    if (!activeSource) return disposed();
    if (committing)
      return failure('canvas-busy', 'An atomic canvas commit is in progress.');
    const validated = validateCancelRequest(input);
    if (!validated.ok) return freeze(validated);
    const request = validated.value;
    const pending = pendingById.get(request.preparedId);
    if (!pending)
      return failure(
        'prepared-not-found',
        'There is no pending edit to cancel.',
      );
    if (pending.prepared.requestId !== request.requestId)
      return failure(
        'request-id-conflict',
        'The prepared edit belongs to a different request ID.',
      );
    pendingById.delete(request.preparedId);
    pendingByRequest.delete(request.requestId);
    return success({ preparedId: request.preparedId });
  }

  return success({
    ...reader,
    getCapabilities: () => capabilities,
    prepareEdit,
    commitEdit,
    cancelEdit,
    dispose: () => {
      release();
      reader.dispose();
    },
  });
}
