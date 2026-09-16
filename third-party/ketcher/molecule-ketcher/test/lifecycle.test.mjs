import assert from 'node:assert/strict';
import test from 'node:test';
import { document, host, molecule } from './helpers.mjs';

test('subscriptions observe committed revisions and detach without affecting other subscribers', () => {
  const { reader, emit } = host();
  const states = [];
  const unsubscribe = reader.subscribe((state) => states.push(state));
  emit('edit');
  emit('undo');
  emit('redo');
  assert.deepEqual(
    states.map(({ revision, reason }) => [revision, reason]),
    [
      [1, 'edit'],
      [2, 'undo'],
      [3, 'redo'],
    ],
  );
  assert.throws(() => {
    states[0].revision = 500;
  }, TypeError);
  unsubscribe();
  emit('untracked');
  assert.equal(states.length, 3);
  assert.equal(reader.getState().revision, 4);
});

test('subscriber exceptions and failing diagnostics cannot break reads or later listeners', () => {
  const { reader, emit } = host(undefined, {
    onListenerError() {
      throw new Error('diagnostics failed');
    },
  });
  const seen = [];
  reader.subscribe(() => {
    throw new Error('subscriber failed');
  });
  reader.subscribe((state) => seen.push(state.revision));
  assert.doesNotThrow(() => emit());
  assert.deepEqual(seen, [1]);
  assert.equal(document(reader).revision, 1);
});

test('reentrant commits are delivered to every listener in revision order', () => {
  const { reader, emit } = host();
  const a = [],
    b = [];
  reader.subscribe((state) => {
    a.push(state.revision);
    if (state.revision === 1) emit();
  });
  reader.subscribe((state) => b.push(state.revision));
  emit();
  assert.deepEqual(a, [1, 2]);
  assert.deepEqual(b, [1, 2]);
});

test('reentrant disposal delivers the terminal state before clearing subscribers', () => {
  const { reader, model, emit } = host();
  const a = [],
    b = [];
  reader.subscribe((state) => {
    a.push(state.status);
    if (state.reason === 'edit') reader.dispose();
  });
  reader.subscribe((state) => b.push(state.status));
  emit();
  assert.deepEqual(a, ['ready', 'disposed']);
  assert.deepEqual(b, ['ready', 'disposed']);
  assert.equal(model.unsubscribes, 1);
  assert.equal(reader.getDocument().error.code, 'reader-disposed');
  reader.dispose();
  emit();
  assert.equal(model.unsubscribes, 1);
  assert.deepEqual(b, ['ready', 'disposed']);
});

test('source disposal invalidates the reader and releasing it is idempotent', () => {
  const { reader, emit, model } = host();
  emit('dispose');
  const terminal = reader.getState();
  let called = false;
  reader.subscribe(() => {
    called = true;
  });
  emit();
  reader.dispose();
  assert.equal(reader.getState(), terminal);
  assert.equal(called, false);
  assert.equal(model.unsubscribes, 1);
});

test('mode transition refuses reads until the host signals conversion has completed', () => {
  const { reader, model, emit } = host();
  model.unavailable = 'macro mode';
  emit('mode');
  assert.equal(reader.getDocument().error.code, 'canvas-unavailable');
  model.unavailable = 'conversion in progress';
  emit('mode');
  assert.equal(reader.getDocument().ok, false);
  model.struct = molecule();
  model.struct.atoms.get(0).label = 'N';
  model.unavailable = null;
  emit('mode');
  assert.equal(document(reader).atoms[0].element, 'N');
  assert.equal(reader.getState().status, 'ready');
});

test('availability failures notify and recover without requiring another graph edit', () => {
  const { reader, model } = host();
  const revisions = [];
  reader.subscribe((state) => revisions.push(state.revision));
  model.availabilityError = true;
  assert.equal(reader.getDocument().error.code, 'canvas-unavailable');
  assert.equal(reader.getState().revision, 1);
  model.availabilityError = false;
  assert.equal(document(reader).revision, 2);
  assert.deepEqual(revisions, [1, 2]);
});

test('availability checks on reads do not repeatedly notify an unchanged mode', () => {
  const { reader, model } = host();
  model.unavailable = 'wizard';
  assert.equal(reader.getState().revision, 1);
  assert.equal(reader.getState().revision, 1);
  model.unavailable = null;
  assert.equal(document(reader).revision, 2);
});

test('semantic sidecars are rejected without freezing host-owned diagnostics', () => {
  const { reader, model, emit } = host();
  model.issues = [
    {
      code: 'unsupported-feature',
      message: 'spin metadata',
      references: ['source-ref'],
    },
  ];
  emit('untracked');
  assert.equal(reader.getDocument().error.code, 'unsupported-document');
  assert.equal(Object.isFrozen(model.issues[0]), false);
  model.issues[0].references.push('host-added');
  assert.deepEqual(reader.getState().issues[0].references, ['source-ref']);
  assert.equal(reader.getCapabilities().edit, 'unavailable');
});
