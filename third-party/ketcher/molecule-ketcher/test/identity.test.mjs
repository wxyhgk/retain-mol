import assert from 'node:assert/strict';
import test from 'node:test';
import { Atom, Struct, Vec2, document, host, molecule } from './helpers.mjs';

test('initial committed snapshot is detached, frozen and cached independently of live drawing state', () => {
  const { reader, model } = host();
  const first = document(reader);
  assert.equal(first.revision, 0);
  assert.deepEqual(
    first.atoms.map(({ element }) => element),
    ['C', 'O'],
  );
  assert.throws(() => {
    first.atoms[0].position.x = 7;
  }, TypeError);
  assert.equal(Object.isFrozen(model.struct), false);
  assert.equal(Object.isFrozen(model.struct.atoms.get(0)), false);
  for (let i = 0; i < 5; i++) assert.equal(document(reader), first);
  assert.equal(model.reads, 1);
});

test('drag previews and cancellation cannot leak into the committed snapshot', () => {
  const { reader, model, emit } = host();
  const before = document(reader);
  model.struct.atoms.get(0).pp = new Vec2(100, 200);
  assert.equal(document(reader), before);
  assert.equal(reader.getState().revision, 0);
  model.struct.atoms.get(0).pp = new Vec2(0, 0);
  assert.equal(document(reader), before);
  model.struct.atoms.get(0).pp = new Vec2(3, 4);
  emit('edit');
  assert.deepEqual(document(reader).atoms[0].position, { x: 3, y: 4 });
  assert.equal(document(reader).atoms[0].id, before.atoms[0].id);
  assert.equal(document(reader).revision, 1);
});

test('ID 0 and sparse slots keep identity through property edits and reconstructed undo objects', () => {
  const { reader, model, emit } = host();
  const before = document(reader);
  const atom0 = before.atoms[0].id;
  const atom1 = before.atoms[1].id;
  const bond0 = before.bonds[0].id;
  model.struct.bonds.delete(0);
  model.struct.atoms.delete(1);
  emit();
  assert.equal(document(reader).atoms[0].id, atom0);
  model.struct.atoms.set(1, new Atom({ label: 'O', pp: new Vec2(1, 0) }));
  const restoredBond = molecule().bonds.get(0);
  model.struct.bonds.set(0, restoredBond);
  emit('undo');
  assert.equal(
    document(reader).atoms.find(({ element }) => element === 'O').id,
    atom1,
  );
  assert.equal(document(reader).bonds[0].id, bond0);
  model.struct.atoms.set(72, new Atom({ label: 'N', pp: new Vec2(2, 0) }));
  emit();
  const added = document(reader).atoms.find(
    ({ element }) => element === 'N',
  ).id;
  assert.ok(![atom0, atom1, bond0].includes(added));
});

test('replacement gives imported slots new IDs, whole-canvas undo restores previous IDs', () => {
  const { reader, model, emit } = host();
  const originalStruct = model.struct;
  const original = document(reader);
  const replacement = molecule();
  model.struct = replacement;
  emit('replace');
  const replaced = document(reader);
  assert.notEqual(replaced.atoms[0].id, original.atoms[0].id);
  assert.equal(replaced.documentId, original.documentId);
  model.struct = originalStruct;
  emit('undo');
  assert.deepEqual(document(reader), { ...original, revision: 2 });
  model.struct = replacement;
  emit('redo');
  assert.deepEqual(document(reader), { ...replaced, revision: 3 });
});

test('edit then undo invalidates the old revision even when the graph returns to identical content', () => {
  const { reader, model, emit } = host();
  const original = document(reader);
  model.struct.atoms.get(0).label = 'N';
  emit('edit');
  model.struct.atoms.get(0).label = 'C';
  emit('undo');
  assert.deepEqual(document(reader).atoms, original.atoms);
  assert.equal(document(reader).revision, original.revision + 2);
});

test('unsupported changes advance revision and never return a simplified molecule', () => {
  const { reader, model, emit } = host();
  const original = document(reader);
  model.struct.bonds.get(0).stereo = 1;
  emit();
  assert.equal(reader.getDocument().error.code, 'unsupported-document');
  assert.equal(reader.getState().revision, 1);
  model.struct.bonds.get(0).stereo = 6;
  emit();
  assert.equal(reader.getState().revision, 2);
  assert.equal(reader.getDocument().ok, false);
  model.struct.bonds.get(0).stereo = 0;
  emit('undo');
  assert.deepEqual(document(reader).atoms, original.atoms);
  assert.equal(document(reader).revision, 3);
});

test('clear is an empty committed document and undo recovers original identities', () => {
  const { reader, model, emit } = host();
  const originalStruct = model.struct;
  const before = document(reader);
  model.struct = new Struct();
  emit('replace');
  assert.equal(document(reader).atoms.length, 0);
  model.struct = originalStruct;
  emit('undo');
  assert.deepEqual(document(reader), { ...before, revision: 2 });
});
