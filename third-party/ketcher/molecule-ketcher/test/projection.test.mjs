import assert from 'node:assert/strict';
import test from 'node:test';
import core from 'ketcher-core';
import { validateDocumentSnapshot } from 'molecule-contracts';
import { projectStructure } from '../dist/projection.js';

const {
  Atom,
  Bond,
  EnhancedFlagMove,
  Fragment,
  KetSerializer,
  MolSerializer,
  Struct,
  Vec2,
} = core;
const identity = {
  documentId: 'canvas-document',
  revision: 7,
  atomId: (slot) => `opaque-atom-${slot + 100}`,
  bondId: (slot) => `opaque-bond-${slot + 200}`,
};

function ethanol() {
  return new KetSerializer().deserialize(
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
}

function projected(struct, ids = identity) {
  const result = projectStructure(struct, ids);
  assert.equal(result.ok, true, JSON.stringify(result));
  assert.equal(validateDocumentSnapshot(result.document).ok, true);
  return result.document;
}

function rejected(struct, path, code = 'unsupported-feature') {
  const result = projectStructure(struct, identity);
  assert.equal(result.ok, false);
  assert.equal(
    'document' in result,
    false,
    'must not expose a partial document',
  );
  assert.ok(
    result.issues.some((issue) => issue.path === path && issue.code === code),
    JSON.stringify(result),
  );
  return result;
}

test('projects a real KET molecule, including ordinary fragments and derived caches', () => {
  const struct = ethanol();
  assert.equal(struct.frags.size, 1);
  assert.equal(struct.atoms.get(0).implicitH, 3);
  const snapshot = projected(struct);
  assert.equal(snapshot.documentId, identity.documentId);
  assert.equal(snapshot.revision, 7);
  assert.deepEqual(
    snapshot.atoms.map(({ element, charge }) => ({ element, charge })),
    [
      { element: 'C', charge: 0 },
      { element: 'C', charge: 0 },
      { element: 'O', charge: 0 },
    ],
  );
  assert.deepEqual(snapshot.bonds[0], {
    id: identity.bondId(0),
    begin: identity.atomId(0),
    end: identity.atomId(1),
    order: 'single',
  });
});

test('reads real MOL V2000 bonds with blank and zero reserved columns', () => {
  const serialized = new MolSerializer().serialize(ethanol());
  const blank = new MolSerializer().deserialize(serialized);
  assert.equal(blank.bonds.get(0).xxx, '   ');
  assert.equal(projected(blank).bonds.length, 2);
  const zeroLines = serialized
    .split('\n')
    .map((line) =>
      /^  [12]  [23]  1  0/.test(line)
        ? line.slice(0, 12) + '  0' + line.slice(15)
        : line,
    );
  const zero = new MolSerializer().deserialize(zeroLines.join('\n'));
  assert.equal(zero.bonds.get(0).xxx, '  0');
  assert.equal(projected(zero).bonds.length, 2);
});

test('supports empty structures and all three basic bond orders', () => {
  assert.deepEqual(projected(new Struct()).atoms, []);
  const struct = ethanol();
  struct.bonds.set(0, new Bond({ begin: 0, end: 1, type: 2 }));
  struct.bonds.set(1, new Bond({ begin: 1, end: 2, type: 3 }));
  assert.deepEqual(
    projected(struct).bonds.map(({ order }) => order),
    ['double', 'triple'],
  );
});

test('maps ID zero and sparse IDs without cloning or renumbering the live graph', () => {
  const struct = new Struct();
  struct.atoms.set(
    0,
    new Atom({ label: 'N', charge: -1, isotope: 15, pp: { x: 1, y: 2 } }),
  );
  struct.atoms.set(42, new Atom({ label: 'C', isotope: 0 }));
  struct.bonds.set(81, new Bond({ begin: 42, end: 0, type: 1 }));
  const visitedAtoms = [];
  const visitedBonds = [];
  const snapshot = projected(struct, {
    ...identity,
    atomId: (slot) => {
      visitedAtoms.push(slot);
      return identity.atomId(slot);
    },
    bondId: (slot) => {
      visitedBonds.push(slot);
      return identity.bondId(slot);
    },
  });
  assert.deepEqual(visitedAtoms, [0, 42]);
  assert.deepEqual(visitedBonds, [81]);
  assert.deepEqual([...struct.atoms.keys()], [0, 42]);
  assert.deepEqual(snapshot.atoms[0], {
    id: identity.atomId(0),
    element: 'N',
    charge: -1,
    isotope: 15,
    position: { x: 1, y: 2 },
  });
  assert.equal('isotope' in snapshot.atoms[1], false);
  assert.deepEqual(snapshot.bonds[0], {
    id: identity.bondId(81),
    begin: identity.atomId(42),
    end: identity.atomId(0),
    order: 'single',
  });
});

test('projection owns its JSON and never modifies or freezes live model objects', () => {
  const struct = ethanol();
  struct.highlights.set(0, { atoms: [0], bonds: [0], color: '#ff0000' });
  struct.atoms.get(0).initiallySelected = true;
  const before = new KetSerializer().serialize(struct);
  const atoms = [...struct.atoms.values()];
  const bonds = [...struct.bonds.values()];
  const snapshot = projected(struct);
  assert.equal(new KetSerializer().serialize(struct), before);
  assert.deepEqual([...struct.atoms.values()], atoms);
  assert.deepEqual([...struct.bonds.values()], bonds);
  for (const value of [struct, struct.atoms, atoms[0], atoms[0].pp, bonds[0]]) {
    assert.equal(Object.isFrozen(value), false);
  }
  snapshot.atoms[0].position.x = 999;
  snapshot.atoms[0].element = 'N';
  assert.equal(atoms[0].pp.x, 0);
  assert.equal(atoms[0].label, 'C');
  atoms[0].charge = 1;
  assert.equal(snapshot.atoms[0].charge, 0);
});

test('rejects nested query values including zero and unknown future query properties', () => {
  for (const [field, value] of Object.entries({
    aromaticity: 'aromatic',
    ringMembership: 0,
    ringSize: 0,
    connectivity: 0,
    chirality: 'clockwise',
    customQuery: '',
    futureQuery: null,
  })) {
    const struct = ethanol();
    struct.atoms.get(0).queryProperties[field] = value;
    rejected(struct, `/atoms/0/queryProperties/${field}`);
  }
});

test('rejects unsupported atom semantics, including explicit zero values', () => {
  for (const [field, value] of Object.entries({
    explicitValence: 0,
    implicitHCount: 0,
    alias: 'Me',
    cip: 'R',
    radical: 1,
    rglabel: 0,
    attachmentPoints: 1,
    aam: 1,
    invRet: 1,
    exactChangeFlag: 1,
    rxnFragmentType: 0,
    stereoLabel: 'abs',
    stereoParity: 1,
    hCount: 1,
    ringBondCount: -1,
    substitutionCount: -1,
    unsaturatedAtom: 1,
    atomList: { ids: [6, 7], notList: false },
    isPreview: true,
  })) {
    const struct = ethanol();
    struct.atoms.get(0)[field] = value;
    const result = rejected(struct, `/atoms/0/${field}`);
    assert.deepEqual(
      result.issues.find(({ path }) => path === `/atoms/0/${field}`).references,
      [identity.atomId(0)],
    );
  }
  const struct = ethanol();
  struct.atoms.get(0).sgs.add(0);
  rejected(struct, '/atoms/0/sgs');
});

test('rejects non-element labels and nonzero z without changing the source', () => {
  for (const label of ['R#', 'A', 'D', 'Me', '*']) {
    const struct = ethanol();
    struct.atoms.get(0).label = label;
    rejected(struct, '/atoms/0/label');
    assert.equal(struct.atoms.get(0).label, label);
  }
  const struct = ethanol();
  struct.atoms.get(0).pp.z = 2.5;
  rejected(struct, '/atoms/0/pp/z');
  assert.equal(struct.atoms.get(0).pp.z, 2.5);
});

test('rejects unsupported bond semantics, including attachment point zero', () => {
  for (const [field, value] of Object.entries({
    type: 4,
    stereo: 1,
    topology: 1,
    reactingCenterStatus: -1,
    customQuery: 'single',
    cip: 'E',
    beginSuperatomAttachmentPointNumber: 0,
    endSuperatomAttachmentPointNumber: 0,
    beginSgroup: {},
    endSgroup: {},
    xxx: '  1',
    isPreview: true,
  })) {
    const struct = ethanol();
    struct.bonds.get(0)[field] = value;
    rejected(struct, `/bonds/0/${field}`);
  }
});

test('rejects reaction, annotation, S-group, R-group and monomer canvas objects', () => {
  for (const field of [
    'sgroups',
    'rgroups',
    'rgroupAttachmentPoints',
    'rxnArrows',
    'rxnPluses',
    'multitailArrows',
    'simpleObjects',
    'texts',
    'images',
    'functionalGroups',
  ]) {
    const struct = ethanol();
    struct[field].set(0, { isMonomer: true });
    rejected(struct, `/${field}`);
  }
  for (const [field, value] of [
    ['isReaction', true],
    ['name', 'ethanol'],
    ['abbreviation', 'EtOH'],
  ]) {
    const struct = ethanol();
    struct[field] = value;
    rejected(struct, `/${field}`);
  }
});

test('permits empty fragments and rejects fragment metadata or enhanced stereo', () => {
  const plain = ethanol();
  plain.frags.set(19, null);
  plain.frags.set(22, new Fragment([], null, []));
  assert.equal(projected(plain).atoms.length, 3);
  const withProperties = ethanol();
  withProperties.frags.set(
    0,
    new Fragment([], null, [{ key: 'source', value: 'custom' }]),
  );
  rejected(withProperties, '/frags/0/properties');
  const withStereo = ethanol();
  withStereo.frags.set(0, new Fragment([0]));
  rejected(withStereo, '/frags/0/enhancedStereo');
  withStereo.atoms.get(0).stereoLabel = '&1';
  withStereo.frags.get(0).stereoFlagPosition = new Vec2(1, 2);
  withStereo.frags.get(0).updateStereoFlag(withStereo);
  assert.equal(withStereo.frags.get(0).enhancedStereoFlag, 'AND');
  rejected(withStereo, '/frags/0/enhancedStereo');
});

test('allows a plain fragment position created by the real centering operation', () => {
  const struct = ethanol();
  const before = projected(struct);
  const fragment = struct.frags.get(0);
  assert.equal(fragment.stereoFlagPosition, undefined);
  // centerStruct selects every ReStruct enhancedFlags entry, including plain
  // fragments, and fromMultipleMove runs this operation for each entry.
  const invalidated = [];
  new EnhancedFlagMove(0, new Vec2(5, 6)).execute({
    molecule: struct,
    markItem: (...args) => invalidated.push(args),
  });
  assert.deepEqual(invalidated, [['enhancedFlags', 0, 1]]);
  assert.ok(fragment.stereoFlagPosition);
  assert.deepEqual(fragment.stereoAtoms, []);
  assert.equal(fragment.enhancedStereoFlag, undefined);
  const position = fragment.stereoFlagPosition;
  assert.deepEqual(projected(struct), before);
  assert.equal(fragment.stereoFlagPosition, position);
  assert.equal(Object.isFrozen(position), false);
});

test('fails closed for new fields at each semantic boundary', () => {
  for (const [target, path] of [
    [(s) => s, '/future'],
    [(s) => s.atoms.get(0), '/atoms/0/future'],
    [(s) => s.bonds.get(0), '/bonds/0/future'],
    [(s) => s.atoms.get(0).pp, '/atoms/0/pp/future'],
    [(s) => s.frags.get(0), '/frags/0/future'],
  ]) {
    const struct = ethanol();
    target(struct).future = null;
    rejected(struct, path);
  }
});

test('rejects dangling endpoints, self bonds and duplicate unordered edges', () => {
  for (const replacement of [
    { begin: 0, end: 42, type: 1 },
    { begin: 0, end: 0, type: 1 },
    { begin: 1, end: 0, type: 2 },
  ]) {
    const struct = ethanol();
    struct.bonds.set(1, new Bond(replacement));
    rejected(struct, '/bonds/1', 'invalid-structure');
  }
});

test('validates malformed numeric properties against the public document schema', () => {
  for (const mutate of [
    (s) => {
      s.atoms.get(0).charge = 0.5;
    },
    (s) => {
      s.atoms.get(0).charge = 9;
    },
    (s) => {
      s.atoms.get(0).isotope = -1;
    },
    (s) => {
      s.atoms.get(0).pp.x = Infinity;
    },
    (s) => {
      s.atoms.get(0).pp.y = NaN;
    },
  ]) {
    const struct = ethanol();
    mutate(struct);
    const result = projectStructure(struct, identity);
    assert.equal(result.ok, false);
    assert.ok(result.issues.some(({ code }) => code === 'invalid-structure'));
  }
});

test('rejects identity collisions and invalid document identifiers', () => {
  const struct = ethanol();
  for (const ids of [
    { ...identity, atomId: () => 'same' },
    { ...identity, bondId: () => 'same' },
    { ...identity, bondId: () => identity.atomId(0) },
    { ...identity, documentId: '' },
    { ...identity, revision: -1 },
  ]) {
    const result = projectStructure(struct, ids);
    assert.equal(result.ok, false);
    assert.ok(result.issues.some(({ code }) => code === 'invalid-structure'));
  }
});

test('bounds issue output and rejects the entire graph when diagnostics are truncated', () => {
  const struct = new Struct();
  for (let i = 0; i < 150; i++) struct.atoms.add(new Atom({ label: '*' }));
  const result = projectStructure(struct, identity);
  assert.equal(result.ok, false);
  assert.equal(result.issues.length, 100);
  assert.equal(result.issues.at(-1).code, 'limit-exceeded');
  assert.match(result.issues.at(-1).message, /omitted/);
});

test('rejects graph size limits before resolving IDs or copying model data', () => {
  for (const [field, count, entity] of [
    ['atoms', 10_001, new Atom({ label: 'C' })],
    ['bonds', 20_001, new Bond({ begin: 0, end: 1, type: 1 })],
  ]) {
    const struct = new Struct();
    for (let i = 0; i < count; i++) struct[field].set(i, entity);
    let resolved = false;
    const resolve = () => {
      resolved = true;
      return 'never';
    };
    const result = projectStructure(struct, {
      ...identity,
      atomId: resolve,
      bondId: resolve,
    });
    assert.equal(result.ok, false);
    assert.equal(result.issues[0].code, 'limit-exceeded');
    assert.equal(resolved, false);
    assert.equal(struct[field].size, count);
  }
});
