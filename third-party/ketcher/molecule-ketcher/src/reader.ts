import type { Struct } from 'ketcher-core';
import {
  CANVAS_SCHEMA,
  DOCUMENT_SCHEMA,
  PROFILE,
  validateDocumentSnapshot,
  type MoleculeCanvasCapabilities,
  type MoleculeCanvasChangeReason,
  type MoleculeCanvasIssue,
  type MoleculeCanvasState,
  type MoleculeDocumentSnapshot,
  type Result,
} from 'molecule-contracts';
import { projectStructure } from './projection.js';
import type {
  MoleculeCanvasObserver,
  MoleculeCanvasReaderOptions,
  MoleculeCanvasSource,
} from './types.js';

function freeze<T>(value: T): T {
  if (value !== null && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
}

function randomNamespace(): Result<string> {
  const runtime = globalThis as {
    crypto?: { getRandomValues(bytes: Uint8Array): Uint8Array };
  };
  try {
    if (!runtime.crypto?.getRandomValues) throw new Error('Missing Web Crypto');
    const bytes = new Uint8Array(16);
    runtime.crypto.getRandomValues(bytes);
    return {
      ok: true,
      value: [...bytes].map((n) => n.toString(16).padStart(2, '0')).join(''),
    };
  } catch {
    return {
      ok: false,
      error: {
        code: 'unsupported-runtime',
        message:
          'Web Crypto getRandomValues is required for canvas identities.',
      },
    };
  }
}

export interface CanvasIdentityMap {
  atoms: ReadonlyMap<number, string>;
  bonds: ReadonlyMap<number, string>;
}

/** Internal mapping port. Never exported from the package public entrypoint. */
export interface CanvasReaderController {
  reader: MoleculeCanvasObserver;
  getIdentities(struct: Struct): CanvasIdentityMap | undefined;
  registerIdentities(struct: Struct, mapping: CanvasIdentityMap): void;
}

/** Capture only committed changes; never project the live model on reads. */
export function createCanvasReaderController(
  source: MoleculeCanvasSource,
  options: MoleculeCanvasReaderOptions = {},
): Result<CanvasReaderController> {
  const namespace = randomNamespace();
  if (!namespace.ok) return freeze(namespace);
  const namespaceId = namespace.value;
  const documentId = options.documentId ?? `canvas-${namespaceId}`;
  const identityCheck = validateDocumentSnapshot({
    schema: DOCUMENT_SCHEMA,
    profile: PROFILE,
    documentId,
    revision: 0,
    atoms: [],
    bonds: [],
  });
  if (!identityCheck.ok) return freeze(identityCheck);
  if (
    !source ||
    typeof source.getStruct !== 'function' ||
    typeof source.subscribe !== 'function'
  ) {
    return freeze({
      ok: false,
      error: {
        code: 'invalid-request',
        message:
          'A readable canvas and committed-change subscription are required.',
      },
    });
  }

  let activeSource: MoleculeCanvasSource | null = source;
  let unsubscribe: (() => void) | undefined;
  let revision = 0;
  let entitySequence = 0;
  let snapshot: MoleculeDocumentSnapshot | undefined;
  let unavailableReason: string | null = null;
  let availabilityFailed = false;
  let state: MoleculeCanvasState;
  let disposed = false;
  // CanvasLoad swaps Struct instances and undo restores the previous instance.
  // Pool IDs within one Struct are monotonic; deleted entries remain mapped so
  // reconstructed Atom/Bond instances on undo recover their original identity.
  let identities = new WeakMap<
    Struct,
    { atoms: Map<number, string>; bonds: Map<number, string> }
  >();
  const listeners = new Set<(state: MoleculeCanvasState) => void>();
  const capabilities: MoleculeCanvasCapabilities = freeze({
    profile: PROFILE,
    mode: 'micromolecules',
    readDocument: 'supported',
    subscribe: 'supported',
    edit: 'unavailable',
    chemistry: 'unavailable',
  });

  function notify() {
    // Queue reentrant notifications so one listener's edit cannot cause later
    // listeners to receive revisions in reverse order.
    notifications.push(state);
    if (notifying) return;
    notifying = true;
    try {
      while (notifications.length) {
        const next = notifications.shift()!;
        for (const listener of [...listeners]) {
          if (!listeners.has(listener)) continue;
          try {
            listener(next);
          } catch (error) {
            try {
              options.onListenerError?.(error);
            } catch {
              /* Host diagnostics cannot break editing. */
            }
          }
        }
        if (next.status === 'disposed') listeners.clear();
      }
    } finally {
      notifying = false;
    }
  }
  const notifications: MoleculeCanvasState[] = [];
  let notifying = false;

  function setState(
    status: MoleculeCanvasState['status'],
    reason: MoleculeCanvasChangeReason,
    issues: readonly MoleculeCanvasIssue[] = [],
  ) {
    state = freeze({
      schema: CANVAS_SCHEMA,
      documentId,
      revision,
      status,
      reason,
      issues,
    });
  }

  function capture(reason: MoleculeCanvasChangeReason) {
    snapshot = undefined;
    try {
      try {
        unavailableReason = activeSource?.getUnavailableReason?.() ?? null;
        availabilityFailed = false;
      } catch {
        availabilityFailed = true;
        setState('unavailable', reason, [
          {
            code: 'invalid-structure',
            message: 'Canvas availability could not be read.',
          },
        ]);
        return;
      }
      if (!activeSource || unavailableReason) {
        setState('unavailable', reason, [
          {
            code: 'unsupported-feature',
            message: unavailableReason ?? 'The canvas is unavailable.',
          },
        ]);
        return;
      }
      const additional = activeSource.getAdditionalIssues?.() ?? [];
      if (additional.length) {
        // Source issues may be host-owned. Do not freeze them in place.
        setState(
          'unsupported',
          reason,
          additional.slice(0, 100).map((issue) => ({
            ...issue,
            ...(issue.references ? { references: [...issue.references] } : {}),
          })),
        );
        return;
      }
      const struct = activeSource.getStruct();
      let mapping = identities.get(struct);
      if (!mapping) {
        mapping = { atoms: new Map(), bonds: new Map() };
        identities.set(struct, mapping);
      }
      const identify = (kind: 'atoms' | 'bonds', id: number): string => {
        const ids = mapping[kind];
        const existing = ids.get(id);
        if (existing !== undefined) return existing;
        if (
          !Number.isSafeInteger(id) ||
          id < 0 ||
          entitySequence === Number.MAX_SAFE_INTEGER
        ) {
          throw new Error('Invalid or exhausted canvas entity identity.');
        }
        const stable = `${namespaceId}:${
          kind === 'atoms' ? 'a' : 'b'
        }${++entitySequence}`;
        ids.set(id, stable);
        return stable;
      };
      const projected = projectStructure(struct, {
        documentId,
        revision,
        atomId: (id) => identify('atoms', id),
        bondId: (id) => identify('bonds', id),
      });
      if (projected.ok) {
        snapshot = freeze(projected.document);
        setState('ready', reason);
      } else setState('unsupported', reason, projected.issues);
    } catch {
      setState('unsupported', reason, [
        {
          code: 'invalid-structure',
          message: 'The committed canvas could not be read safely.',
        },
      ]);
    }
  }

  function update(reason: Exclude<MoleculeCanvasChangeReason, 'initial'>) {
    if (disposed) return;
    if (reason === 'dispose') {
      dispose();
      return;
    }
    if (revision === Number.MAX_SAFE_INTEGER) {
      snapshot = undefined;
      setState('unavailable', reason, [
        {
          code: 'limit-exceeded',
          message:
            'The canvas revision limit was reached; create a new reader.',
        },
      ]);
    } else {
      revision += 1;
      capture(reason);
    }
    notify();
  }

  // Availability can also change through external mode APIs. Checking this
  // flag is safe during a drag; ordinary reads still never sample live atoms.
  function refreshAvailability() {
    if (disposed || !activeSource) return;
    try {
      const current = activeSource.getUnavailableReason?.() ?? null;
      if (availabilityFailed || current !== unavailableReason) update('mode');
    } catch {
      if (!availabilityFailed) update('mode');
    }
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    snapshot = undefined;
    activeSource = null;
    identities = new WeakMap();
    try {
      unsubscribe?.();
    } catch (error) {
      try {
        options.onListenerError?.(error);
      } catch {
        /* Cleanup remains best effort. */
      }
    } finally {
      unsubscribe = undefined;
      if (revision < Number.MAX_SAFE_INTEGER) revision += 1;
      setState('disposed', 'dispose');
      notify();
    }
  }

  capture('initial');
  try {
    unsubscribe = source.subscribe(update);
  } catch {
    activeSource = null;
    return freeze({
      ok: false,
      error: {
        code: 'canvas-unavailable',
        message: 'Could not subscribe to committed canvas changes.',
      },
    });
  }
  if (disposed) {
    unsubscribe?.();
    unsubscribe = undefined;
  }
  const editingUnavailable = () =>
    freeze({
      ok: false as const,
      error: {
        code: disposed
          ? ('reader-disposed' as const)
          : ('editing-unavailable' as const),
        message: disposed
          ? 'This canvas reader has been disposed.'
          : 'This host does not provide atomic canvas editing.',
      },
    });
  const reader: MoleculeCanvasObserver = freeze({
    prepareEdit: editingUnavailable,
    commitEdit: editingUnavailable,
    cancelEdit: editingUnavailable,
    getCapabilities: () => capabilities,
    getState: () => {
      refreshAvailability();
      return state;
    },
    getDocument: (): Result<MoleculeDocumentSnapshot> => {
      refreshAvailability();
      if (snapshot && state.status === 'ready')
        return freeze({ ok: true, value: snapshot });
      return freeze({
        ok: false,
        error: {
          code:
            state.status === 'disposed'
              ? 'reader-disposed'
              : state.status === 'unsupported'
              ? 'unsupported-document'
              : 'canvas-unavailable',
          message:
            state.issues[0]?.message ?? 'This canvas reader has been disposed.',
          currentRevision: revision,
        },
      });
    },
    subscribe: (listener: (state: MoleculeCanvasState) => void) => {
      if (disposed) return () => {};
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    dispose,
  });
  return {
    ok: true,
    value: {
      reader,
      getIdentities: (struct) => {
        const mapping = identities.get(struct);
        return mapping
          ? { atoms: new Map(mapping.atoms), bonds: new Map(mapping.bonds) }
          : undefined;
      },
      registerIdentities: (struct, mapping) => {
        if (disposed) throw new Error('The canvas reader is disposed.');
        identities.set(struct, {
          atoms: new Map(mapping.atoms),
          bonds: new Map(mapping.bonds),
        });
      },
    },
  };
}

export function createMoleculeCanvasReader(
  source: MoleculeCanvasSource,
  options: MoleculeCanvasReaderOptions = {},
): Result<MoleculeCanvasObserver> {
  const controller = createCanvasReaderController(source, options);
  return controller.ok
    ? freeze({ ok: true, value: controller.value.reader })
    : controller;
}
