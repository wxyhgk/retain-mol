import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { Validator } from 'jsonschema';
import {
  DOCUMENT_SCHEMA,
  EDIT_SCHEMA,
  ELEMENT_SYMBOLS,
  PROFILE,
  moleculeCommitRequestSchema,
  moleculeDocumentSchema,
  moleculeEditRequestSchema,
  moleculeHistoryRequestSchema,
  validateCancelRequest,
  validateCommitRequest,
  validateDocumentSnapshot,
  validateEditRequest,
  validateHistoryRequest,
} from '../dist/index.js';

const atom = () => ({ op: 'atom.add', ref: 'carbon', element: 'C' });
const request = (commands = [atom()]) => ({
  schema: EDIT_SCHEMA,
  documentId: 'document-1',
  baseRevision: 0,
  requestId: 'request-1',
  commands,
});
const snapshot = () => ({
  schema: DOCUMENT_SCHEMA,
  profile: PROFILE,
  documentId: 'document-1',
  revision: 0,
  atoms: [{ id: 'atom-1', element: 'C', charge: 0 }],
  bonds: [],
});

function invalid(input, validate = validateEditRequest) {
  const result = validate(input);
  assert.equal(result.ok, false);
  assert.equal(result.error.code, 'invalid-request');
  assert.equal(typeof result.error.message, 'string');
  return result.error;
}

test('the public ESM entry works in Node without browser globals', () => {
  assert.equal(typeof window, 'undefined');
  assert.equal(typeof document, 'undefined');
  assert.equal(validateEditRequest(request()).ok, true);
});

test('all six commands accept the specified JSON vocabulary', () => {
  const input = request([
    { ...atom(), charge: -1, isotope: 13, position: { x: 1.5, y: -2 } },
    {
      op: 'atom.update',
      target: { id: 'existing-atom' },
      patch: { isotope: null, position: null },
    },
    { op: 'atom.remove', target: { ref: 'carbon' }, incidentBonds: 'remove' },
    {
      op: 'bond.add',
      ref: 'new-bond',
      begin: { id: 'a' },
      end: { ref: 'b' },
      order: 'double',
    },
    {
      op: 'bond.update',
      target: { id: 'existing-bond' },
      patch: { order: 'triple' },
    },
    { op: 'bond.remove', target: { ref: 'new-bond' } },
  ]);
  assert.deepEqual(validateEditRequest(input), { ok: true, value: input });
});

test('validation detaches nested data without changing the input', () => {
  const input = request([{ ...atom(), position: { x: 1, y: 2 } }]);
  const result = validateEditRequest(input);
  assert.equal(result.ok, true);
  result.value.commands[0].position.x = 99;
  assert.equal(input.commands[0].position.x, 1);
  input.commands[0].element = 'O';
  assert.equal(result.value.commands[0].element, 'C');
});

test('edit request rejects wrong versions, unknown fields and missing fields', () => {
  invalid({ ...request(), schema: 'retainmol.molecule-edit.v2' });
  invalid({ ...request(), unknown: true });
  const missing = request();
  delete missing.documentId;
  invalid(missing);
  invalid(request([{ ...atom(), stereo: 'up' }]));
  invalid(request([{ ...atom(), position: { x: 1, y: 2, z: 3 } }]));
  invalid(
    request([
      { op: 'atom.update', target: { id: 'a' }, patch: { query: true } },
    ]),
  );
});

test('identifiers are opaque nonempty bounded strings and revisions are safe integers', () => {
  for (const value of ['', 'x'.repeat(129), 12, null])
    invalid({ ...request(), documentId: value });
  for (const value of [-1, 0.5, Number.MAX_SAFE_INTEGER + 1, '0'])
    invalid({ ...request(), baseRevision: value });
  assert.equal(
    validateEditRequest({
      ...request(),
      baseRevision: Number.MAX_SAFE_INTEGER,
      documentId: '0',
    }).ok,
    true,
  );
  assert.equal(
    validateEditRequest(request([{ ...atom(), ref: '__proto__' }])).ok,
    true,
  );
});

test('requests and patches cannot be empty or exceed the command limit', () => {
  invalid(request([]));
  invalid(request(Array.from({ length: 1001 }, atom)));
  invalid(request([{ op: 'atom.update', target: { id: 'a' }, patch: {} }]));
  invalid(request([{ op: 'bond.update', target: { id: 'b' }, patch: {} }]));
});

test('only the 118 real element symbols are accepted', () => {
  assert.equal(ELEMENT_SYMBOLS.length, 118);
  assert.equal(new Set(ELEMENT_SYMBOLS).size, 118);
  for (const element of ELEMENT_SYMBOLS)
    assert.equal(
      validateEditRequest(request([{ ...atom(), element }])).ok,
      true,
    );
  for (const element of ['Xx', '*', 'R', 'D', 'T', 'cl', ' C', 'C '])
    invalid(request([{ ...atom(), element }]));
});

test('charge, isotope and coordinates use finite bounded numeric fields', () => {
  for (const charge of [-9, 9, 0.5, '1'])
    invalid(request([{ ...atom(), charge }]));
  for (const isotope of [0, 401, 1.5, '13', null])
    invalid(request([{ ...atom(), isotope }]));
  for (const x of [1_000_001, -1_000_001, '1'])
    invalid(request([{ ...atom(), position: { x, y: 0 } }]));
  assert.equal(
    validateEditRequest(
      request([
        {
          ...atom(),
          charge: -8,
          isotope: 400,
          position: { x: 1_000_000, y: -1_000_000 },
        },
      ]),
    ).ok,
    true,
  );
});

test('reference selectors are exclusive and atom deletion policy is explicit', () => {
  for (const target of [{}, { id: 'a', ref: 'b' }, { index: 0 }, { id: '' }]) {
    invalid(request([{ op: 'bond.remove', target }]));
  }
  invalid(request([{ op: 'atom.remove', target: { id: 'a' } }]));
  invalid(
    request([
      { op: 'atom.remove', target: { id: 'a' }, incidentBonds: 'cascade' },
    ]),
  );
});

test('aromatic/stereo bond data is rejected instead of being discarded', () => {
  const bond = {
    op: 'bond.add',
    ref: 'b',
    begin: { id: 'a' },
    end: { id: 'c' },
    order: 'single',
  };
  for (const order of ['aromatic', 1, 'quadruple'])
    invalid(request([{ ...bond, order }]));
  invalid(request([{ ...bond, stereo: 'up' }]));
  invalid(
    request([
      {
        op: 'bond.update',
        target: { id: 'b' },
        patch: { order: 'single', begin: { id: 'a' } },
      },
    ]),
  );
});

test('errors identify the command and failing field using a JSON Pointer', () => {
  const error = invalid(
    request([atom(), { ...atom(), ref: 'second', charge: 9 }]),
  );
  assert.equal(error.commandIndex, 1);
  assert.equal(error.path, '/commands/1/charge');
  assert.match(error.message, /8/);
  const isotope = invalid(
    request([
      { op: 'atom.update', target: { id: 'a' }, patch: { isotope: 0 } },
    ]),
  );
  assert.equal(isotope.path, '/commands/0/patch/isotope');
  assert.match(isotope.message, /1 to 400, or null/);
  const target = invalid(
    request([{ op: 'bond.remove', target: { id: 'a', ref: 'b' } }]),
  );
  assert.equal(target.path, '/commands/0/target');
  assert.match(target.message, /exactly one reference/);
  for (const command of [null, false, 1, 'atom.add', {}, { op: 'unknown' }]) {
    const error = invalid(request([command]));
    assert.equal(error.commandIndex, 0);
    assert.match(error.message, /atom.add/);
  }
});

test('non-JSON scalar values, hidden data and custom object instances are rejected', () => {
  for (const value of [
    NaN,
    Infinity,
    -Infinity,
    undefined,
    1n,
    () => {},
    Symbol('x'),
  ]) {
    invalid(request([{ ...atom(), charge: value }]));
  }
  for (const value of [
    new Date(),
    new Number(0),
    /x/,
    new Map(),
    new (class {})(),
  ])
    invalid(value);
  const hidden = request();
  Object.defineProperty(hidden, 'hidden', { value: true });
  invalid(hidden);
  const symbol = request();
  symbol[Symbol('hidden')] = true;
  invalid(symbol);
});

test('getters are rejected without being called and property-read failures become structured errors', () => {
  let invoked = false;
  const input = request();
  Object.defineProperty(input, 'requestId', {
    enumerable: true,
    get() {
      invoked = true;
      return 'r';
    },
  });
  invalid(input);
  assert.equal(invoked, false);
  invalid(
    new Proxy(
      {},
      {
        ownKeys() {
          throw new Error('unreadable');
        },
      },
    ),
  );
});

test('cycles, sparse arrays and extra array fields are rejected', () => {
  const cyclic = request();
  cyclic.commands.push(cyclic);
  invalid(cyclic);
  invalid(request(new Array(1)));
  const commands = [atom()];
  commands.extra = true;
  invalid(request(commands));
  const disguisedHole = new Array(1);
  disguisedHole.extra = atom();
  invalid(request(disguisedHole));
});

test('deep input terminates with a structured limit failure', () => {
  let input = null;
  for (let i = 0; i < 40; i++) input = { child: input };
  const result = validateEditRequest(input);
  assert.equal(result.ok, false);
  assert.equal(result.error.code, 'limit-exceeded');
});

test('repeated objects and null-prototype JSON objects are valid and detach separately', () => {
  const shared = atom();
  const result = validateEditRequest(request([shared, shared]));
  assert.equal(result.ok, true);
  assert.notEqual(result.value.commands[0], result.value.commands[1]);
  const input = Object.assign(Object.create(null), request());
  assert.equal(validateEditRequest(input).ok, true);
});

test('prototype property names cannot bypass strict fields at any input level', () => {
  const extra = (input, key) =>
    Object.defineProperty(input, key, {
      value: { polluted: true },
      enumerable: true,
    });
  for (const name of [
    '__proto__',
    'constructor',
    'toString',
    'valueOf',
    'hasOwnProperty',
  ]) {
    invalid(extra(request(), name));
    invalid(request([extra(atom(), name)]));
    invalid(request([{ ...atom(), position: extra({ x: 0, y: 0 }, name) }]));
    invalid(
      request([
        {
          op: 'atom.update',
          target: extra({ id: 'a' }, name),
          patch: { element: 'N' },
        },
      ]),
    );
    invalid(
      request([
        {
          op: 'atom.update',
          target: { id: 'a' },
          patch: extra({ element: 'N' }, name),
        },
      ]),
    );
    invalid(
      extra({ preparedId: 'p', requestId: 'r' }, name),
      validateCommitRequest,
    );
    invalid(
      extra({ documentId: 'd', baseRevision: 0, expectedCommitId: 'c' }, name),
      validateHistoryRequest,
    );
    invalid(extra(snapshot(), name), validateDocumentSnapshot);
  }
  assert.equal({}.polluted, undefined);
});

test('document validation is strict about shape while graph integrity is left to the engine', () => {
  assert.equal(validateDocumentSnapshot(snapshot()).ok, true);
  invalid({ ...snapshot(), profile: 'full-ketcher' }, validateDocumentSnapshot);
  invalid({ ...snapshot(), sgroups: [] }, validateDocumentSnapshot);
  invalid(
    { ...snapshot(), atoms: [{ id: 'a', element: 'C' }] },
    validateDocumentSnapshot,
  );
  invalid(
    {
      ...snapshot(),
      atoms: [{ id: 'a', element: 'C', charge: 0, stereo: 'R' }],
    },
    validateDocumentSnapshot,
  );
  // Shape validation is intentionally not topology validation.
  assert.equal(
    validateDocumentSnapshot({
      ...snapshot(),
      bonds: [{ id: 'b', begin: 'missing', end: 'missing', order: 'single' }],
    }).ok,
    true,
  );
});

test('commit, cancellation and history requests reject payload changes and stale-shape inputs', () => {
  const commit = { preparedId: 'p', requestId: 'r' };
  assert.equal(validateCommitRequest(commit).ok, true);
  assert.equal(validateCancelRequest(commit).ok, true);
  invalid({ ...commit, commands: [atom()] }, validateCommitRequest);
  invalid({ preparedId: 'p' }, validateCancelRequest);
  const history = { documentId: 'd', baseRevision: 1, expectedCommitId: 'c' };
  assert.equal(validateHistoryRequest(history).ok, true);
  invalid({ ...history, baseRevision: 0.5 }, validateHistoryRequest);
  invalid({ documentId: 'd', baseRevision: 1 }, validateHistoryRequest);
});

test('published JSON files exactly match frozen schemas and accept the same JSON requests', async () => {
  for (const [name, schema] of Object.entries({
    'edit-request': moleculeEditRequestSchema,
    document: moleculeDocumentSchema,
    'commit-request': moleculeCommitRequestSchema,
    'history-request': moleculeHistoryRequestSchema,
  })) {
    const exported = JSON.parse(
      await readFile(
        new URL(`../dist/schemas/${name}.json`, import.meta.url),
        'utf8',
      ),
    );
    assert.deepEqual(exported, JSON.parse(JSON.stringify(schema)));
    assert.equal(Object.isFrozen(schema), true);
  }
  assert.throws(() => {
    moleculeEditRequestSchema.properties.commands.maxItems = 9999;
  }, TypeError);
  const externalSchema = JSON.parse(
    await readFile(
      new URL('../dist/schemas/edit-request.json', import.meta.url),
      'utf8',
    ),
  );
  const externalValidator = new Validator();
  for (const input of [
    request(),
    request([]),
    request([{ ...atom(), element: 'X' }]),
    request([{ op: 'bond.remove', target: { id: '0' } }]),
  ]) {
    assert.equal(
      externalValidator.validate(input, externalSchema).valid,
      validateEditRequest(input).ok,
    );
  }
  for (const name of [
    '__proto__',
    'constructor',
    'toString',
    'valueOf',
    'hasOwnProperty',
  ]) {
    const input = request();
    Object.defineProperty(input.commands[0], name, {
      value: {},
      enumerable: true,
    });
    assert.equal(
      externalValidator.validate(input, externalSchema).valid,
      false,
    );
  }
});
