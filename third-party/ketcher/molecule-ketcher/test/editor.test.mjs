import assert from 'node:assert/strict';
import test from 'node:test';
import { EDIT_SCHEMA } from 'molecule-contracts';
import { createMoleculeCanvasEditor } from 'molecule-ketcher';
import { Struct, document, molecule, value } from './helpers.mjs';

// A real Struct with a small synchronous host transaction boundary. The host
// owns history and publishes only after installation and onCommitted succeed.
function editableHost(struct = new Struct(), options = {}) {
  const listeners = new Set();
  const model = {
    struct,
    busy: null,
    unavailable: null,
    commitFailure: null,
    commitCalls: 0,
    notifications: [],
    undo: [],
    redo: [],
    unsubscribes: 0,
  };
  const emit = (reason = 'edit') => {
    model.notifications.push(reason);
    for (const listener of [...listeners]) listener(reason);
  };
  const source = {
    getStruct: () => model.struct,
    getUnavailableReason: () => model.unavailable,
    getAdditionalIssues: () => [],
    getEditBusyReason: () => model.busy,
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        model.unsubscribes++;
        listeners.delete(listener);
      };
    },
    commit(candidate, expected, onCommitted) {
      model.commitCalls++;
      if (model.commitFailure) return { ok: false, ...model.commitFailure };
      if (model.busy) return { ok: false, reason: 'busy', message: model.busy };
      if (model.struct !== expected) {
        return {
          ok: false,
          reason: 'changed',
          message: 'The host replaced its model.',
        };
      }
      assert.ok(candidate instanceof Struct);
      assert.notEqual(
        candidate,
        model.struct,
        'the candidate must be isolated',
      );
      const entry = { before: model.struct, after: candidate };
      model.struct = candidate;
      model.undo.push(entry);
      model.redo.length = 0;
      onCommitted();
      emit('edit');
      return { ok: true };
    },
  };
  const api = value(createMoleculeCanvasEditor(source, options));
  return {
    api,
    model,
    source,
    emit,
    undo() {
      const entry = model.undo.pop();
      assert.ok(entry, 'expected a host undo entry');
      model.struct = entry.before;
      model.redo.push(entry);
      emit('undo');
    },
    redo() {
      const entry = model.redo.pop();
      assert.ok(entry, 'expected a host redo entry');
      model.struct = entry.after;
      model.undo.push(entry);
      emit('redo');
    },
  };
}

function request(api, requestId, commands) {
  const snapshot = document(api);
  return {
    schema: EDIT_SCHEMA,
    documentId: snapshot.documentId,
    baseRevision: snapshot.revision,
    requestId,
    commands,
  };
}

function prepare(host, requestId, commands = addAtom()) {
  return value(host.api.prepareEdit(request(host.api, requestId, commands)));
}

function commitRequest(prepared) {
  return { preparedId: prepared.preparedId, requestId: prepared.requestId };
}

function addAtom(ref = 'carbon', element = 'C', x = 0) {
  return [{ op: 'atom.add', ref, element, position: { x, y: 0 } }];
}

function cco() {
  return [
    ...addAtom('left', 'C', 0),
    ...addAtom('middle', 'C', 1),
    ...addAtom('terminal', 'O', 2),
    {
      op: 'bond.add',
      ref: 'cc',
      begin: { ref: 'left' },
      end: { ref: 'middle' },
      order: 'single',
    },
    {
      op: 'bond.add',
      ref: 'co',
      begin: { ref: 'middle' },
      end: { ref: 'terminal' },
      order: 'single',
    },
  ];
}

function error(result, code) {
  assert.equal(result.ok, false, JSON.stringify(result));
  assert.equal(result.error.code, code, JSON.stringify(result));
  return result.error;
}

function rawGraph(struct) {
  return {
    atoms: [...struct.atoms].map(([id, atom]) => ({
      id,
      label: atom.label,
      charge: atom.charge,
      isotope: atom.isotope,
      x: atom.pp.x,
      y: atom.pp.y,
      z: atom.pp.z,
    })),
    bonds: [...struct.bonds].map(([id, bond]) => ({
      id,
      begin: bond.begin,
      end: bond.end,
      type: bond.type,
      stereo: bond.stereo,
    })),
  };
}

test('preparation and cancellation leave the live Struct, revision, notifications and history untouched', () => {
  const host = editableHost();
  const initial = document(host.api);
  const original = host.model.struct;
  const before = rawGraph(original);
  const prepared = prepare(host, 'preview-only', cco());
  assert.equal(prepared.candidate.atoms.length, 3);
  assert.equal(prepared.candidate.bonds.length, 2);
  assert.equal(prepared.candidate.revision, initial.revision);
  assert.equal(document(host.api), initial);
  assert.equal(host.model.struct, original);
  assert.deepEqual(rawGraph(original), before);
  assert.equal(host.model.commitCalls, 0);
  assert.deepEqual(host.model.notifications, []);
  assert.deepEqual(host.model.undo, []);
  assert.throws(() => {
    prepared.candidate.atoms[0].element = 'N';
  }, TypeError);

  assert.deepEqual(value(host.api.cancelEdit(commitRequest(prepared))), {
    preparedId: prepared.preparedId,
  });
  assert.equal(document(host.api), initial);
  assert.equal(host.model.struct, original);
  assert.deepEqual(rawGraph(original), before);
  assert.equal(host.model.commitCalls, 0);
  assert.deepEqual(host.model.undo, []);
  assert.deepEqual(host.model.notifications, []);
  error(host.api.commitEdit(commitRequest(prepared)), 'prepared-not-found');
  host.api.dispose();
});

test('one C–C–O batch commits once with candidate IDs and a single host undo/redo unit', () => {
  const host = editableHost();
  const initial = document(host.api);
  const prepared = prepare(host, 'create-cco', cco());
  const states = [];
  host.api.subscribe((state) => states.push(state));
  const receipt = value(host.api.commitEdit(commitRequest(prepared)));
  const committed = document(host.api);
  assert.deepEqual(committed, {
    ...prepared.candidate,
    revision: initial.revision + 1,
  });
  assert.deepEqual(receipt.refs, prepared.refs);
  assert.deepEqual(receipt.changes, prepared.changes);
  assert.equal(receipt.revision, committed.revision);
  assert.equal(host.model.commitCalls, 1);
  assert.equal(host.model.undo.length, 1);
  assert.equal(host.model.struct.atoms.size, 3);
  assert.equal(host.model.struct.bonds.size, 2);
  assert.deepEqual(host.model.notifications, ['edit']);
  assert.deepEqual(
    states.map(({ revision, reason }) => [revision, reason]),
    [[1, 'edit']],
  );

  host.undo();
  assert.deepEqual(document(host.api), { ...initial, revision: 2 });
  host.redo();
  assert.deepEqual(document(host.api), { ...committed, revision: 3 });
  assert.equal(
    host.model.commitCalls,
    1,
    'host history must not create another API transaction',
  );
  host.api.dispose();
});

test('existing stable atom and bond IDs survive updates while all six commands use the same batch boundary', () => {
  const host = editableHost(molecule());
  const before = document(host.api);
  const carbon = before.atoms[0].id;
  const oxygen = before.atoms[1].id;
  const bond = before.bonds[0].id;
  const changed = prepare(host, 'modify-existing', [
    {
      op: 'atom.update',
      target: { id: oxygen },
      patch: { element: 'N', charge: 1 },
    },
    { op: 'bond.update', target: { id: bond }, patch: { order: 'double' } },
    ...addAtom('extension', 'O', 2),
    {
      op: 'bond.add',
      ref: 'extension-bond',
      begin: { id: oxygen },
      end: { ref: 'extension' },
      order: 'single',
    },
  ]);
  value(host.api.commitEdit(commitRequest(changed)));
  let snapshot = document(host.api);
  assert.equal(snapshot.atoms.find(({ id }) => id === oxygen).element, 'N');
  assert.equal(snapshot.atoms.find(({ id }) => id === oxygen).charge, 1);
  assert.equal(snapshot.bonds.find(({ id }) => id === bond).order, 'double');
  assert.equal(snapshot.atoms.find(({ id }) => id === carbon).element, 'C');
  assert.equal(host.model.commitCalls, 1);

  const removed = prepare(host, 'remove-extension', [
    { op: 'bond.remove', target: { id: changed.refs.bonds['extension-bond'] } },
    {
      op: 'atom.remove',
      target: { id: changed.refs.atoms.extension },
      incidentBonds: 'reject',
    },
  ]);
  value(host.api.commitEdit(commitRequest(removed)));
  snapshot = document(host.api);
  assert.deepEqual(
    snapshot.atoms.map(({ id }) => id),
    [carbon, oxygen],
  );
  assert.deepEqual(
    snapshot.bonds.map(({ id }) => id),
    [bond],
  );
  assert.equal(host.model.commitCalls, 2);
  assert.equal(host.model.undo.length, 2);
  host.undo();
  assert.deepEqual(document(host.api).atoms, changed.candidate.atoms);
  host.api.dispose();
});

test('invalid and coordinate-free batches never call the source commit or write an earlier valid command', () => {
  const cases = [
    [
      'invalid-request',
      () => [...addAtom(), { op: 'atom.add', ref: 'invalid', element: '*' }],
    ],
    [
      'reference-not-found',
      () => [
        ...addAtom(),
        {
          op: 'bond.add',
          ref: 'missing',
          begin: { ref: 'carbon' },
          end: { id: 'absent' },
          order: 'single',
        },
      ],
    ],
    [
      'missing-coordinates',
      () => [{ op: 'atom.add', ref: 'unpositioned', element: 'C' }],
    ],
    [
      'missing-coordinates',
      (snapshot) => [
        {
          op: 'atom.update',
          target: { id: snapshot.atoms[0].id },
          patch: { position: null },
        },
      ],
    ],
  ];
  for (const [code, commands] of cases) {
    const host = editableHost(molecule());
    const original = host.model.struct;
    const initial = document(host.api);
    const before = rawGraph(original);
    error(
      host.api.prepareEdit(
        request(host.api, 'invalid-batch', commands(initial)),
      ),
      code,
    );
    assert.equal(document(host.api), initial);
    assert.equal(host.model.struct, original);
    assert.deepEqual(rawGraph(original), before);
    assert.equal(host.model.commitCalls, 0);
    assert.deepEqual(host.model.notifications, []);
    assert.deepEqual(host.model.undo, []);
    host.api.dispose();
  }
});

test('a committed human change rejects an older draft and an old baseRevision', () => {
  const host = editableHost(molecule());
  const staleRequest = request(
    host.api,
    'stale-human',
    addAtom('extension', 'N', 2),
  );
  const prepared = value(host.api.prepareEdit(staleRequest));
  host.model.struct.atoms.get(0).label = 'F';
  host.emit('edit');
  const human = document(host.api);
  const rejected = error(
    host.api.commitEdit(commitRequest(prepared)),
    'revision-conflict',
  );
  assert.equal(rejected.currentRevision, human.revision);
  error(
    host.api.prepareEdit({ ...staleRequest, requestId: 'another-old-request' }),
    'revision-conflict',
  );
  assert.equal(document(host.api), human);
  assert.equal(host.model.struct.atoms.get(0).label, 'F');
  assert.equal(host.model.commitCalls, 0);
  assert.deepEqual(host.model.undo, []);
  host.api.dispose();
});

test('two drafts against one canvas revision cannot both commit', () => {
  const host = editableHost();
  const first = prepare(host, 'first', addAtom('first'));
  const second = prepare(host, 'second', addAtom('second', 'O', 1));
  value(host.api.commitEdit(commitRequest(first)));
  error(host.api.commitEdit(commitRequest(second)), 'revision-conflict');
  assert.equal(document(host.api).atoms.length, 1);
  assert.equal(host.model.commitCalls, 1);
  assert.equal(host.model.undo.length, 1);
  host.api.dispose();
});

test('busy gestures allow isolated preparation from committed state while blocking live commits', () => {
  const host = editableHost(molecule());
  const prepared = prepare(host, 'after-gesture', addAtom('after', 'N', 2));
  const initial = document(host.api);
  const live = host.model.struct;
  const atom = live.atoms.get(0);
  const beforeGesture = { label: atom.label, x: atom.pp.x };
  host.model.busy = 'A pointer gesture is active.';
  atom.label = 'F';
  atom.pp.x = 77;
  const transient = rawGraph(live);

  const during = prepare(host, 'during-gesture', addAtom('during', 'O', 3));
  assert.deepEqual(
    during.candidate.atoms.filter(({ id }) =>
      initial.atoms.some((existing) => existing.id === id),
    ),
    initial.atoms,
  );
  assert.equal(during.candidate.atoms.length, initial.atoms.length + 1);
  assert.deepEqual(during.candidate.bonds, initial.bonds);
  assert.deepEqual(
    during.candidate.atoms.find(({ id }) => id === during.refs.atoms.during),
    {
      id: during.refs.atoms.during,
      element: 'O',
      charge: 0,
      position: { x: 3, y: 0 },
    },
  );
  value(host.api.cancelEdit(commitRequest(during)));
  assert.equal(host.model.struct, live);
  assert.deepEqual(rawGraph(live), transient);
  error(host.api.commitEdit(commitRequest(prepared)), 'canvas-busy');
  assert.equal(document(host.api), initial);
  assert.equal(host.model.commitCalls, 0);
  assert.deepEqual(host.model.undo, []);
  assert.deepEqual(host.model.notifications, []);

  atom.label = beforeGesture.label;
  atom.pp.x = beforeGesture.x;
  host.model.busy = null;
  value(host.api.commitEdit(commitRequest(prepared)));
  assert.equal(host.model.commitCalls, 1);
  assert.deepEqual(document(host.api), {
    ...prepared.candidate,
    revision: initial.revision + 1,
  });
  host.api.dispose();
});

test('an unpublished in-place graph mutation rejects the draft without overwriting the live model', () => {
  const host = editableHost(molecule());
  const prepared = prepare(host, 'unpublished', addAtom('extension', 'N', 2));
  const committed = document(host.api);
  const original = host.model.struct;
  original.atoms.get(0).pp.x = 77;
  error(host.api.commitEdit(commitRequest(prepared)), 'canvas-changed');
  assert.equal(host.model.struct, original);
  assert.equal(original.atoms.get(0).pp.x, 77);
  assert.equal(host.model.commitCalls, 0);
  assert.deepEqual(host.model.undo, []);
  assert.equal(
    document(host.api),
    committed,
    'a failed API commit must not publish an unrelated transient graph',
  );
  host.api.dispose();
});

test('an unpublished Struct replacement rejects an otherwise matching draft', () => {
  const host = editableHost(molecule());
  const prepared = prepare(
    host,
    'silent-replace',
    addAtom('extension', 'N', 2),
  );
  const replacement = molecule();
  host.model.struct = replacement;
  error(host.api.commitEdit(commitRequest(prepared)), 'canvas-changed');
  assert.equal(host.model.struct, replacement);
  assert.equal(host.model.commitCalls, 0);
  assert.deepEqual(host.model.undo, []);
  host.api.dispose();
});

test('host commit failures return their structured reason without a receipt or history entry', () => {
  for (const [reason, code] of [
    ['busy', 'canvas-busy'],
    ['changed', 'canvas-changed'],
    ['render', 'canvas-commit-failed'],
    ['rollback', 'canvas-rollback-failed'],
  ]) {
    const host = editableHost();
    const prepared = prepare(host, `failed-${reason}`);
    const initial = document(host.api);
    const original = host.model.struct;
    host.model.commitFailure = { reason, message: `Host ${reason} failure.` };
    error(host.api.commitEdit(commitRequest(prepared)), code);
    assert.equal(host.model.struct, original);
    assert.equal(document(host.api), initial);
    assert.equal(host.model.commitCalls, 1);
    assert.deepEqual(host.model.undo, []);
    assert.deepEqual(host.model.notifications, []);
    host.api.dispose();
  }
});

test('commit retries return the original receipt after host undo without reapplying an edit', () => {
  const host = editableHost();
  const requestObject = request(host.api, 'idempotent', cco());
  const prepared = value(host.api.prepareEdit(requestObject));
  const input = commitRequest(prepared);
  const receipt = value(host.api.commitEdit(input));
  assert.deepEqual(value(host.api.commitEdit(input)), receipt);
  assert.deepEqual(value(host.api.prepareEdit({ ...requestObject })), prepared);
  assert.equal(host.model.commitCalls, 1);

  host.undo();
  const afterUndo = document(host.api);
  assert.deepEqual(value(host.api.commitEdit(input)), receipt);
  assert.equal(document(host.api), afterUndo);
  assert.equal(afterUndo.atoms.length, 0);
  assert.ok(afterUndo.revision > receipt.revision);
  assert.equal(host.model.commitCalls, 1);
  assert.equal(host.model.redo.length, 1);
  host.api.dispose();
});

test('source publication can reenter commitEdit and receive the receipt without a second transaction', () => {
  const host = editableHost();
  const prepared = prepare(host, 'reentrant-retry', cco());
  const input = commitRequest(prepared);
  let retried;
  let captured;
  host.api.subscribe((state) => {
    if (state.reason === 'edit') {
      captured = document(host.api);
      retried = host.api.commitEdit(input);
    }
  });
  const receipt = value(host.api.commitEdit(input));
  assert.deepEqual(value(retried), receipt);
  assert.deepEqual(captured, {
    ...prepared.candidate,
    revision: receipt.revision,
  });
  assert.equal(host.model.commitCalls, 1);
  assert.equal(host.model.undo.length, 1);
  assert.deepEqual(host.model.notifications, ['edit']);
  host.api.dispose();
});

test('draft tokens are scoped to their reader and invalid tokens never call the host', () => {
  const host = editableHost(undefined, { documentId: 'same-document' });
  const other = editableHost(undefined, { documentId: 'same-document' });
  const prepared = prepare(host, 'owned-draft');
  error(other.api.commitEdit(commitRequest(prepared)), 'prepared-not-found');
  error(
    host.api.commitEdit({
      preparedId: 'unknown',
      requestId: prepared.requestId,
    }),
    'prepared-not-found',
  );
  error(
    host.api.cancelEdit({
      preparedId: 'unknown',
      requestId: prepared.requestId,
    }),
    'prepared-not-found',
  );
  assert.equal(host.model.commitCalls, 0);
  assert.equal(other.model.commitCalls, 0);
  value(host.api.cancelEdit(commitRequest(prepared)));
  error(host.api.cancelEdit(commitRequest(prepared)), 'prepared-not-found');
  error(host.api.commitEdit(commitRequest(prepared)), 'prepared-not-found');
  host.api.dispose();
  other.api.dispose();
});

test('a request ID binds content and a prepared token binds its request ID', () => {
  const host = editableHost();
  const input = request(host.api, 'bound-request', addAtom());
  const prepared = value(host.api.prepareEdit(input));
  assert.deepEqual(value(host.api.prepareEdit(input)), prepared);
  error(
    host.api.prepareEdit({ ...input, commands: addAtom('different', 'N', 1) }),
    'request-id-conflict',
  );
  const mismatch = {
    preparedId: prepared.preparedId,
    requestId: 'another-request',
  };
  error(host.api.commitEdit(mismatch), 'request-id-conflict');
  error(host.api.cancelEdit(mismatch), 'request-id-conflict');
  value(host.api.commitEdit(commitRequest(prepared)));
  error(host.api.commitEdit(mismatch), 'request-id-conflict');
  error(
    host.api.prepareEdit({ ...input, commands: addAtom('different', 'N', 1) }),
    'request-id-conflict',
  );
  assert.equal(host.model.commitCalls, 1);
  host.api.dispose();
});

test('pending capacity is bounded and cancellation releases the slot', () => {
  const host = editableHost(undefined, { maxPreparedEdits: 1 });
  const first = prepare(host, 'one-slot');
  error(
    host.api.prepareEdit(
      request(host.api, 'over-limit', addAtom('second', 'N')),
    ),
    'limit-exceeded',
  );
  value(host.api.cancelEdit(commitRequest(first)));
  const second = prepare(host, 'released-slot', addAtom('second', 'N'));
  value(host.api.commitEdit(commitRequest(second)));
  const third = prepare(host, 'commit-released-slot', addAtom('third', 'O', 1));
  value(host.api.cancelEdit(commitRequest(third)));
  assert.equal(host.model.commitCalls, 1);
  assert.equal(document(host.api).atoms.length, 1);
  host.api.dispose();
});

test('receipt eviction removes token and request lookups while old revisions remain invalid', () => {
  const host = editableHost(undefined, { maxIdempotencyEntries: 1 });
  const firstRequest = request(host.api, 'evicted', addAtom('first'));
  const first = value(host.api.prepareEdit(firstRequest));
  value(host.api.commitEdit(commitRequest(first)));
  const second = prepare(host, 'retained', addAtom('second', 'O', 1));
  const receipt = value(host.api.commitEdit(commitRequest(second)));
  error(host.api.commitEdit(commitRequest(first)), 'prepared-not-found');
  error(host.api.prepareEdit(firstRequest), 'revision-conflict');
  assert.deepEqual(value(host.api.commitEdit(commitRequest(second))), receipt);
  assert.equal(host.model.commitCalls, 2);
  assert.equal(host.model.undo.length, 2);
  assert.equal(document(host.api).atoms.length, 2);
  host.api.dispose();
});

test('disposal releases pending edits and all write methods reject without touching the host', () => {
  const host = editableHost();
  const input = request(host.api, 'dispose-pending', addAtom());
  const prepared = value(host.api.prepareEdit(input));
  const states = [];
  host.api.subscribe((state) => states.push(state.status));
  host.api.dispose();
  const disposed = host.api.getState();
  error(host.api.getDocument(), 'reader-disposed');
  error(host.api.prepareEdit(input), 'reader-disposed');
  error(host.api.commitEdit(commitRequest(prepared)), 'reader-disposed');
  error(host.api.cancelEdit(commitRequest(prepared)), 'reader-disposed');
  host.api.dispose();
  host.emit('edit');
  assert.equal(host.api.getState(), disposed);
  assert.deepEqual(states, ['disposed']);
  assert.equal(host.model.unsubscribes, 1);
  assert.equal(host.model.commitCalls, 0);
  assert.deepEqual(host.model.undo, []);
});

test('source disposal clears writer caches before terminal subscribers retry writes', () => {
  const host = editableHost();
  const committedInput = request(host.api, 'committed', addAtom());
  const committed = value(host.api.prepareEdit(committedInput));
  value(host.api.commitEdit(commitRequest(committed)));
  const pendingInput = request(host.api, 'pending', addAtom());
  const pending = value(host.api.prepareEdit(pendingInput));
  const terminalResults = [];
  host.api.subscribe((state) => {
    if (state.status !== 'disposed') return;
    terminalResults.push(
      host.api.prepareEdit(committedInput),
      host.api.prepareEdit(pendingInput),
      host.api.commitEdit(commitRequest(committed)),
      host.api.cancelEdit(commitRequest(pending)),
    );
  });
  host.emit('dispose');
  assert.equal(terminalResults.length, 4);
  for (const result of terminalResults) error(result, 'reader-disposed');
  error(host.api.commitEdit(commitRequest(committed)), 'reader-disposed');
  assert.equal(host.api.getState().status, 'disposed');
  assert.equal(host.model.unsubscribes, 1);
  assert.equal(host.model.commitCalls, 1);
});
