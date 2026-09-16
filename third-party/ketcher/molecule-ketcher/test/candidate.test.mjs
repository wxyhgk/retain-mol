import assert from 'node:assert/strict';
import test from 'node:test';
import core from 'ketcher-core';
import { EDIT_SCHEMA } from 'molecule-contracts';
import { createMoleculeSession } from 'molecule-engine';
import { buildCanvasCandidate } from '../dist/candidate.js';
import { projectStructure } from '../dist/projection.js';

const {
  Atom,
  Bond,
  Fragment,
  Highlight,
  KetSerializer,
  MolSerializer,
  Struct,
  Vec2,
} = core;

function fixture() {
  const source = new KetSerializer().deserialize(
    JSON.stringify({
      root: { nodes: [{ $ref: 'mol0' }] },
      mol0: {
        type: 'molecule',
        atoms: [
          { label: 'C', location: [0, 0, 0] },
          { label: 'C', location: [1.5, 0, 0] },
          { label: 'O', location: [3, 0, 0] },
        ],
        bonds: [
          { type: 1, atoms: [0, 1] },
          { type: 1, atoms: [1, 2] },
        ],
      },
    }),
  );
  const identities = {
    atoms: new Map([
      [0, 'carbon-a'],
      [1, 'carbon-b'],
      [2, 'oxygen'],
    ]),
    bonds: new Map([
      [0, 'carbon-carbon'],
      [1, 'carbon-oxygen'],
    ]),
  };
  return { source, identities, base: snapshot(source, identities) };
}

function snapshot(source, identities) {
  const result = projectStructure(source, {
    documentId: 'canvas',
    revision: 12,
    atomId: (id) => identities.atoms.get(id),
    bondId: (id) => identities.bonds.get(id),
  });
  assert.equal(result.ok, true, JSON.stringify(result));
  return result.document;
}

function prepare(base, commands) {
  const opened = createMoleculeSession({
    documentId: base.documentId,
    snapshot: base,
  });
  assert.equal(opened.ok, true, JSON.stringify(opened));
  const result = opened.value.prepareEdit({
    schema: EDIT_SCHEMA,
    documentId: base.documentId,
    baseRevision: base.revision,
    requestId: 'candidate-test',
    commands,
  });
  assert.equal(result.ok, true, JSON.stringify(result));
  assert.equal(Object.isFrozen(result.value.candidate), true);
  return result.value;
}

function build(source, base, candidate, identities) {
  const result = buildCanvasCandidate(source, base, candidate, identities);
  assert.equal(result.ok, true, JSON.stringify(result));
  assert.notEqual(result.value.struct, source);
  return result.value;
}

function sourceState(source) {
  return {
    data: structuredClone(source),
    atomNext: source.atoms.clone().newId(),
    bondNext: source.bonds.clone().newId(),
    fragmentNext: source.frags.clone().newId(),
    highlightNext: source.highlights.clone().newId(),
  };
}

function freeze(value) {
  if (value && typeof value === 'object') {
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
}

test('materializes real engine C-C-O commands from an empty canvas without writing it', () => {
  const source = new Struct();
  const identities = { atoms: new Map(), bonds: new Map() };
  const base = freeze(snapshot(source, identities));
  const prepared = prepare(base, [
    { op: 'atom.add', ref: 'a', element: 'C', position: { x: 0, y: 0 } },
    { op: 'atom.add', ref: 'b', element: 'C', position: { x: 1.5, y: 0 } },
    { op: 'atom.add', ref: 'o', element: 'O', position: { x: 3, y: 0 } },
    {
      op: 'bond.add',
      ref: 'ab',
      begin: { ref: 'a' },
      end: { ref: 'b' },
      order: 'single',
    },
    {
      op: 'bond.add',
      ref: 'bo',
      begin: { ref: 'b' },
      end: { ref: 'o' },
      order: 'single',
    },
  ]);
  const before = sourceState(source);
  const result = build(source, base, prepared.candidate, identities);
  assert.deepEqual(sourceState(source), before);
  assert.deepEqual(
    snapshot(result.struct, result.identities),
    prepared.candidate,
  );
  assert.deepEqual(
    [...result.struct.atoms.values()].map((atom) => atom.implicitH),
    [3, 2, 1],
  );
  assert.equal(result.struct.frags.size, 1);
  assert.equal(result.struct.halfBonds.size, 4);
  assert.equal(result.identities.atoms.get(0), prepared.refs.atoms.a);
  assert.equal(identities.atoms.size, 0);
});

test('keeps ID zero and sparse slots, allocating above current and retired IDs', () => {
  const source = new Struct();
  source.atoms.set(0, new Atom({ label: 'C' }));
  source.atoms.set(42, new Atom({ label: 'O', pp: { x: 1.5, y: 0 } }));
  source.bonds.set(9, new Bond({ begin: 0, end: 42, type: 1 }));
  const identities = {
    atoms: new Map([
      [0, 'c'],
      [42, 'o'],
      [300, 'retired-atom'],
    ]),
    bonds: new Map([
      [9, 'co'],
      [800, 'retired-bond'],
    ]),
  };
  const base = snapshot(source, identities);
  const prepared = prepare(base, [
    { op: 'atom.add', ref: 'n', element: 'N', position: { x: 3, y: 0 } },
    {
      op: 'bond.add',
      ref: 'on',
      begin: { id: 'o' },
      end: { ref: 'n' },
      order: 'single',
    },
  ]);
  const before = sourceState(source);
  const result = build(source, base, prepared.candidate, identities);
  assert.deepEqual([...result.struct.atoms.keys()], [0, 42, 301]);
  assert.deepEqual([...result.struct.bonds.keys()], [9, 801]);
  assert.equal(result.identities.atoms.get(0), 'c');
  assert.equal(result.identities.atoms.get(42), 'o');
  assert.equal(result.identities.atoms.get(301), prepared.refs.atoms.n);
  assert.equal(result.struct.atoms.add(new Atom({ label: 'He' })), 302);
  assert.equal(
    result.struct.bonds.add(new Bond({ begin: 301, end: 302, type: 1 })),
    802,
  );
  assert.equal(result.struct.atoms.get(42).label, 'O');
  assert.deepEqual(sourceState(source), before);
});

test('respects allocator high water after removed slots are absent from identity maps', () => {
  const { source, identities, base } = fixture();
  for (let i = 0; i < 30; i++) source.atoms.newId();
  for (let i = 0; i < 40; i++) source.bonds.newId();
  const prepared = prepare(base, [
    { op: 'atom.add', ref: 'he', element: 'He', position: { x: 5, y: 0 } },
  ]);
  const before = sourceState(source);
  const result = build(source, base, prepared.candidate, identities);
  assert.equal(result.struct.atoms.has(before.atomNext), true);
  assert.equal(result.struct.bonds.newId(), before.bondNext);
  assert.deepEqual(sourceState(source), before);
});

test('preserves unchanged nullable values, atom display flags and MOL reserved bond columns', () => {
  const initial = fixture();
  const source = new MolSerializer().deserialize(
    new MolSerializer().serialize(initial.source),
  );
  source.atoms.get(0).charge = null;
  source.atoms.get(0).isotope = null;
  source.atoms.get(0).attachmentPoints = 0;
  source.atoms.get(0).initiallySelected = true;
  source.atoms.get(0).hasImplicitH = false;
  source.atoms.get(1).charge = 0;
  source.atoms.get(1).isotope = 0;
  source.bonds.get(0).initiallySelected = 'invalid';
  const base = snapshot(source, initial.identities);
  const prepared = prepare(base, [
    { op: 'atom.update', target: { id: 'oxygen' }, patch: { element: 'N' } },
    {
      op: 'bond.update',
      target: { id: 'carbon-carbon' },
      patch: { order: 'double' },
    },
  ]);
  const before = sourceState(source);
  const { struct } = build(
    source,
    base,
    prepared.candidate,
    initial.identities,
  );
  for (const [slot, charge, isotope] of [
    [0, null, null],
    [1, 0, 0],
  ]) {
    assert.equal(struct.atoms.get(slot).charge, charge);
    assert.equal(struct.atoms.get(slot).isotope, isotope);
  }
  assert.equal(struct.atoms.get(0).attachmentPoints, 0);
  assert.equal(struct.atoms.get(0).initiallySelected, true);
  assert.equal(struct.atoms.get(0).hasImplicitH, false);
  assert.equal(struct.bonds.get(0).xxx, '   ');
  assert.equal(struct.bonds.get(0).initiallySelected, 'invalid');
  assert.equal(struct.bonds.get(0).type, 2);
  assert.deepEqual(sourceState(source), before);
});

test('applies explicit charge and isotope changes without altering unchanged representations', () => {
  const { source, identities } = fixture();
  source.atoms.get(0).isotope = 13;
  const base = snapshot(source, identities);
  const prepared = prepare(base, [
    {
      op: 'atom.update',
      target: { id: 'carbon-a' },
      patch: { isotope: null, charge: 1 },
    },
    { op: 'atom.update', target: { id: 'carbon-b' }, patch: { isotope: 13 } },
  ]);
  const { struct } = build(source, base, prepared.candidate, identities);
  assert.equal(struct.atoms.get(0).isotope, null);
  assert.equal(struct.atoms.get(0).charge, 1);
  assert.equal(struct.atoms.get(1).isotope, 13);
  assert.equal(struct.atoms.get(1).charge, null);
  assert.equal(source.atoms.get(0).isotope, 13);
  assert.equal(source.atoms.get(0).charge, null);
});

test('bond removal retains all atoms and recalculates hydrogens and components', () => {
  const { source, base, identities } = fixture();
  const prepared = prepare(base, [
    { op: 'bond.remove', target: { id: 'carbon-oxygen' } },
  ]);
  const { struct } = build(source, base, prepared.candidate, identities);
  assert.deepEqual([...struct.atoms.keys()], [0, 1, 2]);
  assert.deepEqual([...struct.bonds.keys()], [0]);
  assert.deepEqual(
    [...struct.atoms.values()].map((atom) => atom.implicitH),
    [3, 3, 2],
  );
  assert.equal(struct.frags.size, 2);
  assert.equal(struct.halfBonds.size, 2);
  assert.deepEqual(struct.atoms.get(2).neighbors, []);
  assert.equal(source.atoms.get(2).implicitH, 1);
  assert.equal(source.frags.size, 1);
});

test('copies the current highlights and filters removed atom/bond slots while preserving the source for undo', () => {
  const { source, base, identities } = fixture();
  const prepared = prepare(base, [
    { op: 'atom.remove', target: { id: 'oxygen' }, incidentBonds: 'remove' },
  ]);
  // This drawing change occurs after prepare; materialization must read it now.
  const highlight = new Highlight({
    atoms: [0, 2],
    bonds: [0, 1],
    rgroupAttachmentPoints: [],
    color: '#abcdef',
    outline: true,
  });
  highlight.note = { tags: ['current'] };
  source.highlights.set(23, highlight);
  const before = sourceState(source);
  const { struct } = build(source, base, prepared.candidate, identities);
  assert.deepEqual(struct.highlights.get(23).atoms, [0]);
  assert.deepEqual(struct.highlights.get(23).bonds, [0]);
  assert.equal(struct.highlights.get(23).outline, true);
  assert.equal(struct.highlights.get(23).color, '#abcdef');
  assert.ok(struct.highlights.get(23) instanceof Highlight);
  assert.notEqual(struct.highlights.get(23), highlight);
  assert.notEqual(struct.highlights.get(23).note, highlight.note);
  struct.highlights.get(23).note.tags.push('isolated');
  struct.highlights.get(23).atoms.push(1);
  assert.equal(
    struct.highlights.add(
      new Highlight({
        atoms: [],
        bonds: [],
        rgroupAttachmentPoints: [],
        color: '#000',
      }),
    ),
    24,
  );
  assert.deepEqual(sourceState(source), before);
  assert.deepEqual(highlight.atoms, [0, 2]);
  assert.equal(source.atoms.has(2), true);
  assert.equal(source.bonds.has(1), true);
});

test('splits and merges components while preserving a separate unchanged component display position', () => {
  const { source, identities } = fixture();
  source.frags.get(0).stereoFlagPosition = new Vec2(5, 6);
  source.atoms.set(
    42,
    new Atom({ label: 'He', pp: { x: 10, y: 0 }, fragment: 7 }),
  );
  source.frags.set(7, new Fragment([], { x: 11, y: 2 }));
  identities.atoms.set(42, 'helium');
  const base = snapshot(source, identities);
  const split = prepare(base, [
    { op: 'bond.remove', target: { id: 'carbon-oxygen' } },
  ]);
  const separated = build(source, base, split.candidate, identities);
  assert.equal(separated.struct.frags.size, 3);
  assert.equal(separated.struct.atoms.get(42).fragment, 7);
  assert.deepEqual(
    separated.struct.frags.get(7).stereoFlagPosition,
    new Vec2(11, 2),
  );
  assert.notEqual(
    separated.struct.frags.get(7).stereoFlagPosition,
    source.frags.get(7).stereoFlagPosition,
  );
  assert.notEqual(
    separated.struct.atoms.get(0).fragment,
    separated.struct.atoms.get(2).fragment,
  );
  const nextBase = snapshot(separated.struct, separated.identities);
  const merge = prepare(nextBase, [
    {
      op: 'bond.add',
      ref: 'rejoin',
      begin: { id: 'carbon-b' },
      end: { id: 'oxygen' },
      order: 'single',
    },
  ]);
  const joined = build(
    separated.struct,
    nextBase,
    merge.candidate,
    separated.identities,
  );
  assert.equal(joined.struct.frags.size, 2);
  assert.equal(
    joined.struct.atoms.get(0).fragment,
    joined.struct.atoms.get(2).fragment,
  );
  assert.deepEqual(
    joined.struct.frags.get(7).stereoFlagPosition,
    new Vec2(11, 2),
  );
});

test('retains ordinary fragment display cache when geometry is unchanged and resets it after movement', () => {
  const { source, identities } = fixture();
  source.frags.get(0).stereoFlagPosition = new Vec2(5, 6);
  source.frags.get(0).properties = [];
  const base = snapshot(source, identities);
  const change = prepare(base, [
    { op: 'atom.update', target: { id: 'oxygen' }, patch: { element: 'N' } },
  ]);
  const { struct } = build(source, base, change.candidate, identities);
  assert.equal(struct.atoms.get(0).fragment, 0);
  assert.deepEqual(struct.frags.get(0).stereoFlagPosition, new Vec2(5, 6));
  assert.notEqual(
    struct.frags.get(0).properties,
    source.frags.get(0).properties,
  );
  const moved = prepare(base, [
    {
      op: 'atom.update',
      target: { id: 'oxygen' },
      patch: { position: { x: 3.5, y: 1 } },
    },
  ]);
  const result = build(source, base, moved.candidate, identities);
  assert.equal(result.struct.frags.get(0).stereoFlagPosition, undefined);
  assert.deepEqual(source.frags.get(0).stereoFlagPosition, new Vec2(5, 6));
});

test('rebuilds bond-order-dependent hydrogen counts and ring caches', () => {
  const { source, identities, base } = fixture();
  const carbonyl = prepare(base, [
    {
      op: 'bond.update',
      target: { id: 'carbon-oxygen' },
      patch: { order: 'double' },
    },
  ]);
  const { struct } = build(source, base, carbonyl.candidate, identities);
  assert.equal(struct.atoms.get(1).implicitH, 1);
  assert.equal(struct.atoms.get(2).implicitH, 0);
  assert.equal(struct.halfBonds.get(2).bid, 1);
  const ring = prepare(base, [
    {
      op: 'atom.update',
      target: { id: 'oxygen' },
      patch: { element: 'C', position: { x: 0.75, y: 1.3 } },
    },
    {
      op: 'bond.add',
      ref: 'ring',
      begin: { id: 'oxygen' },
      end: { id: 'carbon-a' },
      order: 'single',
    },
  ]);
  const closed = build(source, base, ring.candidate, identities);
  assert.equal(closed.struct.loops.size, 1);
  assert.equal(closed.struct.halfBonds.size, 6);
  assert.deepEqual(
    [...closed.struct.atoms.values()].map((atom) => atom.implicitH),
    [2, 2, 2],
  );
  assert.equal(source.loops.size, 0);
});

test('accepts frozen inputs and array-order differences with exact coordinates unchanged', () => {
  const { source, identities, base } = fixture();
  const prepared = prepare(base, [
    { op: 'atom.update', target: { id: 'oxygen' }, patch: { element: 'N' } },
  ]);
  const reversedBase = freeze({
    ...base,
    atoms: [...base.atoms].reverse(),
    bonds: [...base.bonds].reverse(),
  });
  const reversedCandidate = freeze({
    ...prepared.candidate,
    atoms: [...prepared.candidate.atoms].reverse(),
    bonds: [...prepared.candidate.bonds].reverse(),
  });
  const expectedBase = JSON.stringify(reversedBase);
  const expectedCandidate = JSON.stringify(reversedCandidate);
  const before = sourceState(source);
  const { struct } = build(source, reversedBase, reversedCandidate, identities);
  struct.atoms.get(0).pp.x = 999;
  struct.atoms.get(0).queryProperties.customQuery = 'isolated';
  assert.deepEqual(sourceState(source), before);
  assert.equal(JSON.stringify(reversedBase), expectedBase);
  assert.equal(JSON.stringify(reversedCandidate), expectedCandidate);
});

test('rejects a changed live graph, unknown semantics and transient previews at materialization', () => {
  for (const mutate of [
    (s) => {
      s.atoms.get(0).pp.x += 0.00000001;
    },
    (s) => {
      s.atoms.get(0).label = 'N';
    },
    (s) => {
      s.atoms.get(0).queryProperties.connectivity = 0;
    },
    (s) => {
      s.atoms.get(0).isPreview = true;
    },
    (s) => {
      s.futureSemanticField = null;
    },
  ]) {
    const { source, identities, base } = fixture();
    const prepared = prepare(base, [
      { op: 'atom.update', target: { id: 'oxygen' }, patch: { element: 'N' } },
    ]);
    mutate(source);
    const before = sourceState(source);
    const result = buildCanvasCandidate(
      source,
      base,
      prepared.candidate,
      identities,
    );
    assert.equal(result.ok, false);
    assert.equal(result.error.code, 'canvas-changed');
    assert.deepEqual(sourceState(source), before);
  }
});

test('rejects missing coordinates for added atoms and position removal on existing atoms', () => {
  for (const commands of [
    [{ op: 'atom.add', ref: 'n', element: 'N' }],
    [
      {
        op: 'atom.update',
        target: { id: 'oxygen' },
        patch: { position: null },
      },
    ],
  ]) {
    const { source, identities, base } = fixture();
    const prepared = prepare(base, commands);
    const before = sourceState(source);
    const result = buildCanvasCandidate(
      source,
      base,
      prepared.candidate,
      identities,
    );
    assert.equal(result.ok, false);
    assert.equal(result.error.code, 'missing-coordinates');
    assert.equal(result.error.references.length, 1);
    assert.deepEqual(sourceState(source), before);
  }
});

test('rejects malformed candidate graphs and reused retired identities before exposing a Struct', () => {
  const { source, identities, base } = fixture();
  identities.atoms.set(99, 'retired');
  for (const mutate of [
    (s) => {
      s.bonds[0].end = 'missing';
    },
    (s) => {
      s.bonds[0].end = s.bonds[0].begin;
    },
    (s) => {
      s.bonds.push({
        id: 'duplicate',
        begin: 'carbon-b',
        end: 'carbon-a',
        order: 'single',
      });
    },
    (s) => {
      s.atoms[0].id = s.atoms[1].id;
    },
    (s) => {
      s.atoms.push({
        id: 'retired',
        element: 'C',
        charge: 0,
        position: { x: 4, y: 1 },
      });
    },
    (s) => {
      s.documentId = 'other';
    },
    (s) => {
      s.revision++;
    },
  ]) {
    const candidate = structuredClone(base);
    mutate(candidate);
    const before = sourceState(source);
    const result = buildCanvasCandidate(source, base, candidate, identities);
    assert.equal(result.ok, false);
    assert.equal(result.error.code, 'invalid-structure');
    assert.equal('value' in result, false);
    assert.deepEqual(sourceState(source), before);
  }
});

test('fails safely on unsupported display metadata instead of retaining live aliases', () => {
  const { source, identities, base } = fixture();
  const prepared = prepare(base, [
    { op: 'atom.update', target: { id: 'oxygen' }, patch: { element: 'N' } },
  ]);
  source.highlights.set(
    0,
    new Highlight({
      atoms: [0],
      bonds: [],
      rgroupAttachmentPoints: [],
      color: '#fff',
    }),
  );
  source.highlights.get(0).futureDisplay = new Date(0);
  const before = sourceState(source);
  const result = buildCanvasCandidate(
    source,
    base,
    prepared.candidate,
    identities,
  );
  assert.equal(result.ok, false);
  assert.equal(result.error.code, 'invalid-structure');
  assert.deepEqual(sourceState(source), before);
});

test('reports exhausted atom slots without overflow or source changes', () => {
  const source = new Struct();
  const slot = Number.MAX_SAFE_INTEGER - 1;
  source.atoms.set(slot, new Atom({ label: 'C' }));
  const identities = {
    atoms: new Map([[slot, 'last-atom']]),
    bonds: new Map(),
  };
  const base = snapshot(source, identities);
  const prepared = prepare(base, [
    { op: 'atom.add', ref: 'n', element: 'N', position: { x: 1, y: 1 } },
  ]);
  const before = sourceState(source);
  const result = buildCanvasCandidate(
    source,
    base,
    prepared.candidate,
    identities,
  );
  assert.equal(result.ok, false);
  assert.equal(result.error.code, 'limit-exceeded');
  assert.deepEqual(sourceState(source), before);
});
