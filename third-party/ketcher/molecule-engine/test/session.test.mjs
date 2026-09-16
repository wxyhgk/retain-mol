import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { createMoleculeSession } from 'molecule-engine';
import { DOCUMENT_SCHEMA, EDIT_SCHEMA, PROFILE } from 'molecule-contracts';

function value(result) {
  assert.equal(result.ok, true, JSON.stringify(result));
  return result.value;
}

function failure(result, code) {
  assert.equal(result.ok, false, JSON.stringify(result));
  assert.equal(result.error.code, code, JSON.stringify(result));
  return result.error;
}

function session(options = {}) {
  return value(
    createMoleculeSession({ documentId: 'test-document', ...options }),
  );
}

function request(editor, commands, requestId = 'build') {
  const { documentId, revision } = editor.getDocument();
  return {
    schema: EDIT_SCHEMA,
    documentId,
    baseRevision: revision,
    requestId,
    commands,
  };
}

function commit(editor, input) {
  const prepared = value(editor.prepareEdit(input));
  const receipt = value(
    editor.commitEdit({
      preparedId: prepared.preparedId,
      requestId: input.requestId,
    }),
  );
  return { prepared, receipt };
}

function historyRequest(editor, expectedCommitId) {
  const { documentId, revision } = editor.getDocument();
  return { documentId, baseRevision: revision, expectedCommitId };
}

function state(editor) {
  return JSON.stringify({
    document: editor.getDocument(),
    history: editor.getHistory(),
  });
}

const ethanol = [
  { op: 'atom.add', ref: 'c1', element: 'C' },
  { op: 'atom.add', ref: 'c2', element: 'C' },
  { op: 'atom.add', ref: 'o', element: 'O' },
  {
    op: 'bond.add',
    ref: 'cc',
    begin: { ref: 'c1' },
    end: { ref: 'c2' },
    order: 'single',
  },
  {
    op: 'bond.add',
    ref: 'co',
    begin: { ref: 'c2' },
    end: { ref: 'o' },
    order: 'single',
  },
];

test('public Node entry creates C–C–O, edits existing IDs and undoes/redoes complete batches', () => {
  assert.equal(typeof globalThis.window, 'undefined');
  assert.equal(typeof globalThis.document, 'undefined');
  const editor = session();
  const empty = state(editor);
  const input = request(editor, ethanol);
  const prepared = value(editor.prepareEdit(input));
  assert.equal(state(editor), empty);
  assert.equal(prepared.candidate.revision, 0);
  assert.deepEqual(
    prepared.candidate.atoms.map(({ element }) => element),
    ['C', 'C', 'O'],
  );
  const built = value(
    editor.commitEdit({
      preparedId: prepared.preparedId,
      requestId: input.requestId,
    }),
  );
  const { atoms, bonds } = built.refs;
  assert.deepEqual(editor.getDocument().bonds, [
    { id: bonds.cc, begin: atoms.c1, end: atoms.c2, order: 'single' },
    { id: bonds.co, begin: atoms.c2, end: atoms.o, order: 'single' },
  ]);
  const initial = editor.getDocument();
  assert.equal(initial.revision, 1);
  assert.deepEqual(built.changes.atoms.created, [atoms.c1, atoms.c2, atoms.o]);
  assert.equal(built.warnings[0].code, 'chemistry-unchecked');
  const edited = commit(
    editor,
    request(
      editor,
      [
        {
          op: 'atom.update',
          target: { id: atoms.o },
          patch: { element: 'N', charge: 1, isotope: 15 },
        },
        {
          op: 'bond.update',
          target: { id: bonds.co },
          patch: { order: 'double' },
        },
        { op: 'bond.remove', target: { id: bonds.cc } },
      ],
      'edit',
    ),
  ).receipt;
  const modified = editor.getDocument();
  assert.equal(modified.atoms.find(({ id }) => id === atoms.o).element, 'N');
  assert.deepEqual(modified.bonds, [
    { id: bonds.co, begin: atoms.c2, end: atoms.o, order: 'double' },
  ]);
  assert.deepEqual(edited.changes.atoms.updated, [atoms.o]);
  assert.deepEqual(edited.changes.bonds.updated, [bonds.co]);
  assert.deepEqual(edited.changes.bonds.removed, [bonds.cc]);
  assert.deepEqual(editor.getHistory().undo, [built.commitId, edited.commitId]);
  value(editor.undo(historyRequest(editor, edited.commitId)));
  assert.deepEqual(editor.getDocument(), { ...initial, revision: 3 });
  value(editor.redo(historyRequest(editor, edited.commitId)));
  assert.deepEqual(editor.getDocument(), { ...modified, revision: 4 });
  value(editor.undo(historyRequest(editor, edited.commitId)));
  value(editor.undo(historyRequest(editor, built.commitId)));
  assert.deepEqual(editor.getDocument().atoms, []);
  assert.deepEqual(editor.getDocument().bonds, []);
  value(editor.redo(historyRequest(editor, built.commitId)));
  assert.deepEqual(editor.getDocument(), { ...initial, revision: 7 });
});

test('late graph failure leaves graph, revision and undo/redo unchanged', () => {
  const editor = session();
  const built = commit(editor, request(editor, ethanol)).receipt;
  value(editor.undo(historyRequest(editor, built.commitId)));
  const before = state(editor);
  const error = failure(
    editor.prepareEdit(
      request(
        editor,
        [
          { op: 'atom.add', ref: 'valid-first', element: 'C' },
          {
            op: 'bond.add',
            ref: 'invalid-second',
            begin: { ref: 'valid-first' },
            end: { id: 'missing' },
            order: 'single',
          },
        ],
        'bad-batch',
      ),
    ),
    'reference-not-found',
  );
  assert.equal(error.commandIndex, 1);
  assert.equal(state(editor), before);
  value(editor.redo(historyRequest(editor, built.commitId)));
  assert.equal(editor.getDocument().atoms.length, 3);
});

test('prepared candidate and request cannot mutate the live document or confirmed edit', () => {
  const editor = session();
  const input = request(editor, [
    { op: 'atom.add', ref: 'c', element: 'C', position: { x: 1, y: 2 } },
  ]);
  const prepared = value(editor.prepareEdit(input));
  input.commands[0].element = 'O';
  input.commands[0].position.x = 999;
  assert.throws(() => {
    prepared.candidate.atoms[0].position.x = -5;
  }, TypeError);
  assert.throws(() => {
    prepared.refs.atoms.c = 'evil';
  }, TypeError);
  value(
    editor.commitEdit({ preparedId: prepared.preparedId, requestId: 'build' }),
  );
  assert.equal(editor.getDocument().atoms[0].element, 'C');
  assert.deepEqual(editor.getDocument().atoms[0].position, { x: 1, y: 2 });
  assert.throws(() => {
    editor.getDocument().atoms.pop();
  }, TypeError);
  assert.throws(() => {
    editor.getHistory().undo.pop();
  }, TypeError);
});

test('explicit cancellation releases a draft without creating a history entry', () => {
  const editor = session();
  const before = state(editor);
  const prepared = value(editor.prepareEdit(request(editor, ethanol)));
  failure(
    editor.cancelEdit({ preparedId: prepared.preparedId, requestId: 'wrong' }),
    'request-id-conflict',
  );
  value(
    editor.cancelEdit({ preparedId: prepared.preparedId, requestId: 'build' }),
  );
  assert.equal(state(editor), before);
  failure(
    editor.commitEdit({ preparedId: prepared.preparedId, requestId: 'build' }),
    'prepared-not-found',
  );
});

test('two preparations from one revision cannot both commit', () => {
  const editor = session();
  const first = value(editor.prepareEdit(request(editor, ethanol, 'first')));
  const second = value(
    editor.prepareEdit(
      request(editor, [{ op: 'atom.add', ref: 'n', element: 'N' }], 'second'),
    ),
  );
  value(
    editor.commitEdit({ preparedId: first.preparedId, requestId: 'first' }),
  );
  const before = state(editor);
  const error = failure(
    editor.commitEdit({ preparedId: second.preparedId, requestId: 'second' }),
    'revision-conflict',
  );
  assert.equal(error.currentRevision, 1);
  assert.equal(state(editor), before);
  failure(
    editor.prepareEdit({
      ...request(editor, ethanol, 'stale'),
      baseRevision: 0,
    }),
    'revision-conflict',
  );
  failure(
    editor.prepareEdit({
      ...request(editor, ethanol, 'wrong-doc'),
      documentId: 'elsewhere',
    }),
    'document-mismatch',
  );
});

test('idempotent retries return the original result even after undo, property order is immaterial', () => {
  const editor = session();
  const input = request(editor, ethanol);
  const first = commit(editor, input);
  const before = state(editor);
  const reordered = Object.fromEntries(Object.entries(input).reverse());
  const replay = commit(editor, reordered);
  assert.deepEqual(replay, first);
  assert.equal(state(editor), before);
  const changed = structuredClone(input);
  changed.commands[0].element = 'N';
  failure(editor.prepareEdit(changed), 'request-id-conflict');
  value(editor.undo(historyRequest(editor, first.receipt.commitId)));
  const undone = state(editor);
  assert.deepEqual(commit(editor, input).receipt, first.receipt);
  assert.equal(state(editor), undone);
});

test('undo and redo require the current revision and expected top commit', () => {
  const editor = session();
  failure(editor.undo(historyRequest(editor, 'missing')), 'history-empty');
  const first = commit(editor, request(editor, ethanol)).receipt;
  const second = commit(
    editor,
    request(editor, [{ op: 'atom.add', ref: 'n', element: 'N' }], 'second'),
  ).receipt;
  const before = state(editor);
  failure(
    editor.undo(historyRequest(editor, first.commitId)),
    'history-conflict',
  );
  failure(
    editor.undo({
      ...historyRequest(editor, second.commitId),
      baseRevision: 1,
    }),
    'revision-conflict',
  );
  assert.equal(state(editor), before);
  value(editor.undo(historyRequest(editor, second.commitId)));
  failure(
    editor.redo(historyRequest(editor, first.commitId)),
    'history-conflict',
  );
  value(editor.redo(historyRequest(editor, second.commitId)));
});

test('undo then branch never reuses IDs and discards the old redo branch', () => {
  const editor = session();
  const first = commit(
    editor,
    request(editor, [{ op: 'atom.add', ref: 'c', element: 'C' }]),
  ).receipt;
  value(editor.undo(historyRequest(editor, first.commitId)));
  const second = commit(
    editor,
    request(editor, [{ op: 'atom.add', ref: 'c', element: 'C' }], 'branch'),
  ).receipt;
  assert.notEqual(second.refs.atoms.c, first.refs.atoms.c);
  assert.deepEqual(editor.getHistory().redo, []);
  failure(editor.redo(historyRequest(editor, first.commitId)), 'history-empty');
});

test('deletion must explicitly reject or remove incident bonds, cascade is one reversible edit', () => {
  const editor = session();
  const built = commit(editor, request(editor, ethanol)).receipt;
  const target = { id: built.refs.atoms.c2 };
  const before = state(editor);
  failure(
    editor.prepareEdit(
      request(
        editor,
        [{ op: 'atom.remove', target, incidentBonds: 'reject' }],
        'reject',
      ),
    ),
    'atom-has-bonds',
  );
  assert.equal(state(editor), before);
  const removed = commit(
    editor,
    request(
      editor,
      [{ op: 'atom.remove', target, incidentBonds: 'remove' }],
      'cascade',
    ),
  ).receipt;
  assert.deepEqual(removed.changes.atoms.removed, [target.id]);
  assert.deepEqual(
    new Set(removed.changes.bonds.removed),
    new Set(Object.values(built.refs.bonds)),
  );
  assert.equal(editor.getDocument().bonds.length, 0);
  value(editor.undo(historyRequest(editor, removed.commitId)));
  assert.deepEqual(
    editor.getDocument().bonds.map(({ id }) => id),
    Object.values(built.refs.bonds),
  );
});

test('request references are typed, local, ordered and safe for JavaScript property names', () => {
  const editor = session();
  const special = commit(
    editor,
    request(editor, [
      { op: 'atom.add', ref: '__proto__', element: 'C' },
      { op: 'atom.add', ref: 'constructor', element: 'O' },
      {
        op: 'bond.add',
        ref: 'toString',
        begin: { ref: '__proto__' },
        end: { ref: 'constructor' },
        order: 'single',
      },
    ]),
  ).receipt;
  assert.equal(typeof special.refs.atoms.__proto__, 'string');
  assert.equal(typeof special.refs.bonds.toString, 'string');
  assert.equal(Object.hasOwn(special.refs.atoms, '__proto__'), true);
  failure(
    editor.prepareEdit(
      request(
        editor,
        [
          {
            op: 'atom.update',
            target: { ref: '__proto__' },
            patch: { element: 'N' },
          },
        ],
        'old-ref',
      ),
    ),
    'reference-not-found',
  );
  failure(
    editor.prepareEdit(
      request(
        editor,
        [
          {
            op: 'atom.update',
            target: { id: special.refs.bonds.toString },
            patch: { element: 'N' },
          },
        ],
        'wrong-kind',
      ),
    ),
    'reference-not-found',
  );
  failure(
    editor.prepareEdit(
      request(
        editor,
        [
          {
            op: 'bond.add',
            ref: 'forward',
            begin: { ref: 'later' },
            end: { id: special.refs.atoms.constructor },
            order: 'single',
          },
          { op: 'atom.add', ref: 'later', element: 'C' },
        ],
        'forward',
      ),
    ),
    'reference-not-found',
  );
});

test('duplicate references, reversed duplicate bonds and self-bonds are rejected atomically', () => {
  const editor = session();
  const built = commit(editor, request(editor, ethanol)).receipt;
  const before = state(editor);
  failure(
    editor.prepareEdit(
      request(
        editor,
        [
          { op: 'atom.add', ref: 'same', element: 'C' },
          {
            op: 'bond.add',
            ref: 'same',
            begin: { ref: 'same' },
            end: { id: built.refs.atoms.o },
            order: 'single',
          },
        ],
        'duplicate-ref',
      ),
    ),
    'duplicate-reference',
  );
  failure(
    editor.prepareEdit(
      request(
        editor,
        [
          {
            op: 'bond.add',
            ref: 'reverse',
            begin: { id: built.refs.atoms.o },
            end: { id: built.refs.atoms.c2 },
            order: 'triple',
          },
        ],
        'duplicate-bond',
      ),
    ),
    'duplicate-bond',
  );
  failure(
    editor.prepareEdit(
      request(
        editor,
        [
          {
            op: 'bond.add',
            ref: 'self',
            begin: { id: built.refs.atoms.o },
            end: { id: built.refs.atoms.o },
            order: 'single',
          },
        ],
        'self',
      ),
    ),
    'self-bond',
  );
  assert.equal(state(editor), before);
});

test('removing a just-created atom invalidates its request reference', () => {
  const editor = session();
  failure(
    editor.prepareEdit(
      request(editor, [
        { op: 'atom.add', ref: 'gone', element: 'C' },
        { op: 'atom.remove', target: { ref: 'gone' }, incidentBonds: 'remove' },
        { op: 'atom.update', target: { ref: 'gone' }, patch: { element: 'O' } },
      ]),
    ),
    'reference-not-found',
  );
  assert.equal(editor.getDocument().revision, 0);
});

test('optional isotope and coordinates can be cleared without resetting other properties', () => {
  const editor = session();
  const built = commit(
    editor,
    request(editor, [
      {
        op: 'atom.add',
        ref: 'n',
        element: 'N',
        charge: 1,
        isotope: 15,
        position: { x: 2, y: -1 },
      },
    ]),
  ).receipt;
  commit(
    editor,
    request(
      editor,
      [
        {
          op: 'atom.update',
          target: { id: built.refs.atoms.n },
          patch: { isotope: null, position: null },
        },
      ],
      'clear',
    ),
  );
  assert.deepEqual(editor.getDocument().atoms, [
    { id: built.refs.atoms.n, element: 'N', charge: 1 },
  ]);
});

test('unchanged patches and batches with no net change do not create history', () => {
  const editor = session();
  const built = commit(editor, request(editor, ethanol)).receipt;
  const before = state(editor);
  failure(
    editor.prepareEdit(
      request(
        editor,
        [
          {
            op: 'atom.update',
            target: { id: built.refs.atoms.o },
            patch: { element: 'O' },
          },
        ],
        'noop',
      ),
    ),
    'no-change',
  );
  failure(
    editor.prepareEdit(
      request(
        editor,
        [
          { op: 'atom.add', ref: 'temporary', element: 'C' },
          {
            op: 'atom.remove',
            target: { ref: 'temporary' },
            incidentBonds: 'remove',
          },
        ],
        'net-noop',
      ),
    ),
    'no-change',
  );
  assert.equal(state(editor), before);
});

test('JSON snapshot roundtrip preserves IDs and supports editing an existing graph', () => {
  const original = session();
  const built = commit(original, request(original, ethanol)).receipt;
  const snapshot = JSON.parse(JSON.stringify(original.getDocument()));
  const restored = session({ snapshot });
  assert.deepEqual(restored.getDocument(), snapshot);
  assert.deepEqual(restored.getHistory(), { undo: [], redo: [] });
  snapshot.atoms[0].element = 'N';
  assert.equal(restored.getDocument().atoms[0].element, 'C');
  commit(
    restored,
    request(
      restored,
      [
        {
          op: 'bond.update',
          target: { id: built.refs.bonds.co },
          patch: { order: 'double' },
        },
      ],
      'carbonyl',
    ),
  );
  assert.equal(
    restored.getDocument().bonds.find(({ id }) => id === built.refs.bonds.co)
      .order,
    'double',
  );
  assert.equal(
    original.getDocument().bonds.find(({ id }) => id === built.refs.bonds.co)
      .order,
    'single',
  );
});

test('session initialization rejects unsupported features and broken snapshot graphs', () => {
  const empty = {
    schema: DOCUMENT_SCHEMA,
    profile: PROFILE,
    documentId: 'test-document',
    revision: 0,
    atoms: [],
    bonds: [],
  };
  failure(
    createMoleculeSession({
      documentId: 'test-document',
      snapshot: { ...empty, sgroups: [] },
    }),
    'invalid-request',
  );
  failure(
    createMoleculeSession({
      documentId: 'test-document',
      snapshot: { ...empty, profile: 'full-ket' },
    }),
    'invalid-request',
  );
  failure(
    createMoleculeSession({ documentId: 'elsewhere', snapshot: empty }),
    'document-mismatch',
  );
  const atom = { id: 'a', element: 'C', charge: 0 };
  const invalidGraphs = [
    { ...empty, atoms: [atom, atom] },
    {
      ...empty,
      atoms: [atom],
      bonds: [{ id: 'b', begin: 'a', end: 'missing', order: 'single' }],
    },
    {
      ...empty,
      atoms: [atom],
      bonds: [{ id: 'b', begin: 'a', end: 'a', order: 'single' }],
    },
    {
      ...empty,
      atoms: [atom, { ...atom, id: 'other' }],
      bonds: [
        { id: 'b1', begin: 'a', end: 'other', order: 'single' },
        { id: 'b2', begin: 'other', end: 'a', order: 'double' },
      ],
    },
  ];
  for (const snapshot of invalidGraphs)
    assert.equal(
      createMoleculeSession({ documentId: 'test-document', snapshot }).ok,
      false,
    );
});

test('draft tokens cannot be used in another same-document session', () => {
  const first = session();
  const second = session();
  const a = value(first.prepareEdit(request(first, ethanol)));
  const b = value(second.prepareEdit(request(second, ethanol)));
  assert.notEqual(a.preparedId, b.preparedId);
  failure(
    second.commitEdit({ preparedId: a.preparedId, requestId: 'build' }),
    'prepared-not-found',
  );
  assert.equal(second.getDocument().revision, 0);
});

test('bounded drafts can be cancelled, while committed receipts do not occupy pending capacity', () => {
  const editor = session({ maxPreparedEdits: 1 });
  const first = value(editor.prepareEdit(request(editor, ethanol)));
  failure(
    editor.prepareEdit(
      request(editor, [{ op: 'atom.add', ref: 'n', element: 'N' }], 'second'),
    ),
    'limit-exceeded',
  );
  value(
    editor.cancelEdit({ preparedId: first.preparedId, requestId: 'build' }),
  );
  commit(editor, request(editor, ethanol, 'second'));
  commit(
    editor,
    request(editor, [{ op: 'atom.add', ref: 'n', element: 'N' }], 'third'),
  );
  assert.equal(editor.getDocument().atoms.length, 4);
});

test('bounded history retains only the configured most recent batches', () => {
  const editor = session({ maxHistoryEntries: 1 });
  commit(editor, request(editor, ethanol));
  const second = commit(
    editor,
    request(editor, [{ op: 'atom.add', ref: 'n', element: 'N' }], 'second'),
  ).receipt;
  assert.deepEqual(editor.getHistory().undo, [second.commitId]);
  value(editor.undo(historyRequest(editor, second.commitId)));
  assert.equal(editor.getDocument().atoms.length, 3);
  failure(editor.undo(historyRequest(editor, 'first')), 'history-empty');
});

test('revision overflow is refused without committing a draft', () => {
  const snapshot = {
    schema: DOCUMENT_SCHEMA,
    profile: PROFILE,
    documentId: 'test-document',
    revision: Number.MAX_SAFE_INTEGER,
    atoms: [],
    bonds: [],
  };
  const editor = session({ snapshot });
  const before = state(editor);
  const prepared = editor.prepareEdit(request(editor, ethanol));
  if (prepared.ok)
    failure(
      editor.commitEdit({
        preparedId: prepared.value.preparedId,
        requestId: 'build',
      }),
      'limit-exceeded',
    );
  else failure(prepared, 'limit-exceeded');
  assert.equal(state(editor), before);
});

test('all mutation entrypoints handle malformed JSON with structured failures', () => {
  const editor = session();
  const before = state(editor);
  const cycle = {};
  cycle.self = cycle;
  for (const input of [
    null,
    false,
    [],
    7,
    'bad',
    undefined,
    { value: Infinity },
    cycle,
  ]) {
    for (const method of [
      'prepareEdit',
      'commitEdit',
      'cancelEdit',
      'undo',
      'redo',
    ]) {
      failure(editor[method](input), 'invalid-request');
    }
  }
  assert.equal(state(editor), before);
});

test('capabilities distinguish graph validation from absent chemistry and canvas services', () => {
  const editor = session();
  const capabilities = editor.getCapabilities();
  assert.equal(capabilities.validation.topology, 'supported');
  assert.equal(capabilities.validation.chemistry, 'unavailable');
  assert.equal(capabilities.features.canvasAdapter, 'unavailable');
  assert.equal(capabilities.features.layout, 'unavailable');
  assert.equal(capabilities.features.stereochemistry, 'unsupported');
  assert.equal(capabilities.idempotency.scope, 'session');
  assert.equal(capabilities.limits.maxCommands, 1000);
  assert.equal(capabilities.limits.maxAtoms, 10000);
  assert.throws(() => {
    capabilities.features.canvasAdapter = 'supported';
  }, TypeError);
});

test('invalid session configuration fails without silently defaulting explicit null limits', () => {
  for (const input of [
    null,
    undefined,
    [],
    {},
    { documentId: '' },
    { documentId: 'doc', unsupported: true },
  ]) {
    failure(createMoleculeSession(input), 'invalid-request');
  }
  for (const option of [
    'maxPreparedEdits',
    'maxHistoryEntries',
    'maxIdempotencyEntries',
  ]) {
    for (const invalid of [null, 0, -1, 0.5, Infinity, '1', 10001]) {
      failure(
        createMoleculeSession({ documentId: 'doc', [option]: invalid }),
        'invalid-request',
      );
    }
  }
});

test('idempotency eviction removes both lookups; old revisions remain invalid', () => {
  const editor = session({ maxIdempotencyEntries: 1 });
  const firstInput = request(editor, ethanol, 'first');
  const first = commit(editor, firstInput);
  const secondInput = request(
    editor,
    [{ op: 'atom.add', ref: 'n', element: 'N' }],
    'second',
  );
  const second = commit(editor, secondInput);
  const before = state(editor);
  failure(
    editor.commitEdit({
      preparedId: first.prepared.preparedId,
      requestId: 'first',
    }),
    'prepared-not-found',
  );
  failure(editor.prepareEdit(firstInput), 'revision-conflict');
  assert.deepEqual(commit(editor, secondInput), second);
  assert.equal(state(editor), before);
  // Reuse is only permitted after eviction and with the newly read revision.
  const reused = commit(
    editor,
    request(editor, [{ op: 'atom.add', ref: 'c1', element: 'C' }], 'first'),
  );
  assert.notEqual(reused.receipt.refs.atoms.c1, first.receipt.refs.atoms.c1);
});

test('history revision overflow does not consume the undo entry', () => {
  const snapshot = {
    schema: DOCUMENT_SCHEMA,
    profile: PROFILE,
    documentId: 'test-document',
    revision: Number.MAX_SAFE_INTEGER - 1,
    atoms: [],
    bonds: [],
  };
  const editor = session({ snapshot });
  const built = commit(editor, request(editor, ethanol)).receipt;
  const before = state(editor);
  failure(
    editor.undo(historyRequest(editor, built.commitId)),
    'limit-exceeded',
  );
  assert.equal(state(editor), before);
});

test('a batch result omits references to entities removed before commit', () => {
  const editor = session();
  const result = commit(
    editor,
    request(editor, [
      { op: 'atom.add', ref: 'temporary', element: 'O' },
      { op: 'atom.add', ref: 'retained', element: 'C' },
      {
        op: 'bond.add',
        ref: 'temporary-bond',
        begin: { ref: 'temporary' },
        end: { ref: 'retained' },
        order: 'single',
      },
      {
        op: 'atom.remove',
        target: { ref: 'temporary' },
        incidentBonds: 'remove',
      },
    ]),
  ).receipt;
  assert.equal(Object.hasOwn(result.refs.atoms, 'temporary'), false);
  assert.equal(Object.hasOwn(result.refs.bonds, 'temporary-bond'), false);
  assert.deepEqual(result.changes.atoms.created, [result.refs.atoms.retained]);
  assert.deepEqual(result.changes.bonds.created, []);
});

test('separate Node processes cannot reuse deleted IDs or commit each other’s prepared edits', () => {
  const program = `
    import { readFileSync } from 'node:fs';
    import { createMoleculeSession } from 'molecule-engine';
    import { EDIT_SCHEMA } from 'molecule-contracts';
    const input = JSON.parse(readFileSync(0, 'utf8'));
    const unwrap = result => { if (!result.ok) throw new Error(JSON.stringify(result)); return result.value; };
    const session = unwrap(createMoleculeSession({ documentId: 'restart', ...(input.snapshot ? { snapshot: input.snapshot } : {}) }));
    const prepare = (requestId, commands) => unwrap(session.prepareEdit({ schema: EDIT_SCHEMA, documentId: 'restart', baseRevision: session.getDocument().revision, requestId, commands }));
    const draft = prepare('build', [{ op: 'atom.add', ref: 'atom', element: input.snapshot ? 'O' : 'C' }]);
    const foreignCommit = input.oldToken ? session.commitEdit({ preparedId: input.oldToken, requestId: 'build' }) : null;
    const built = unwrap(session.commitEdit({ preparedId: draft.preparedId, requestId: 'build' }));
    if (!input.snapshot) {
      const deletion = prepare('delete', [{ op: 'atom.remove', target: { id: built.refs.atoms.atom }, incidentBonds: 'remove' }]);
      unwrap(session.commitEdit({ preparedId: deletion.preparedId, requestId: 'delete' }));
    }
    console.log(JSON.stringify({ snapshot: session.getDocument(), oldId: built.refs.atoms.atom, oldToken: draft.preparedId, foreignCommit }));
  `;
  function run(input) {
    const result = spawnSync(
      process.execPath,
      ['--input-type=module', '-e', program],
      { input: JSON.stringify(input), encoding: 'utf8' },
    );
    assert.equal(result.status, 0, result.stderr);
    return JSON.parse(result.stdout);
  }
  const original = run({});
  assert.equal(original.snapshot.atoms.length, 0);
  const restored = run(original);
  failure(restored.foreignCommit, 'prepared-not-found');
  assert.notEqual(restored.oldToken, original.oldToken);
  assert.notEqual(restored.oldId, original.oldId);
  assert.equal(restored.snapshot.atoms[0].element, 'O');
  assert.equal(restored.snapshot.revision, 3);
});
