import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const require = createRequire(import.meta.url);

test('CommonJS consumers load real CJS contracts and reader without DOM globals', () => {
  assert.equal(typeof window, 'undefined');
  assert.equal(typeof document, 'undefined');
  for (const name of ['molecule-contracts', 'molecule-ketcher']) {
    assert.match(require.resolve(name), /[/\\]dist[/\\]cjs[/\\]index\.js$/);
  }
  const contracts = require('molecule-contracts');
  const { createMoleculeCanvasReader } = require('molecule-ketcher');
  const { Atom, Struct } = require('ketcher-core');
  const struct = new Struct();
  struct.atoms.add(new Atom({ label: 'O' }));
  let listener;
  const created = createMoleculeCanvasReader(
    {
      getStruct: () => struct,
      subscribe: (next) => {
        listener = next;
        return () => {
          listener = undefined;
        };
      },
    },
    { documentId: 'commonjs-canvas' },
  );
  assert.equal(created.ok, true, JSON.stringify(created));
  const reader = created.value;
  const original = reader.getDocument();
  assert.equal(original.ok, true, JSON.stringify(original));
  assert.equal(original.value.atoms[0].element, 'O');
  assert.equal(contracts.validateDocumentSnapshot(original.value).ok, true);
  assert.equal(
    contracts.validateDocumentSnapshot({ ...original.value, revision: -1 }).ok,
    false,
  );
  struct.atoms.get(0).charge = 1;
  listener('edit');
  const changed = reader.getDocument();
  assert.equal(changed.ok, true, JSON.stringify(changed));
  assert.equal(changed.value.revision, original.value.revision + 1);
  assert.equal(changed.value.atoms[0].id, original.value.atoms[0].id);
  assert.equal(changed.value.atoms[0].charge, 1);
  reader.dispose();
  assert.equal(listener, undefined);
});

test('ESM and CommonJS expose the same contract schemas and preserve JSON schema exports', async () => {
  const esm = await import('molecule-contracts');
  const cjs = require('molecule-contracts');
  assert.equal(
    typeof (await import('molecule-ketcher')).createMoleculeCanvasReader,
    'function',
  );
  for (const [path, name] of [
    ['edit-request', 'moleculeEditRequestSchema'],
    ['document', 'moleculeDocumentSchema'],
    ['commit-request', 'moleculeCommitRequestSchema'],
    ['history-request', 'moleculeHistoryRequestSchema'],
  ]) {
    const schema = require(`molecule-contracts/schemas/${path}.json`);
    assert.deepEqual(JSON.parse(JSON.stringify(cjs[name])), schema);
    assert.deepEqual(JSON.parse(JSON.stringify(esm[name])), schema);
  }
});

test('published declarations support NodeNext CommonJS and ESM consumers', async () => {
  const directory = await mkdtemp(
    new URL('./.consumer-types-', import.meta.url),
  );
  try {
    const usage = `
const source = { getStruct: () => new core.Struct(), subscribe: () => () => {} };
const result = adapter.createMoleculeCanvasReader(source);
if (result.ok) {
  const reader: adapter.MoleculeCanvasObserver = result.value;
  const document = reader.getDocument();
  if (document.ok) contracts.validateDocumentSnapshot(document.value);
}
`;
    await writeFile(
      join(directory, 'consumer.cts'),
      `
import contracts = require('molecule-contracts');
import adapter = require('molecule-ketcher');
import core = require('ketcher-core');
${usage}`,
    );
    await writeFile(
      join(directory, 'consumer.mts'),
      `
import * as contracts from 'molecule-contracts';
import * as adapter from 'molecule-ketcher';
import * as core from 'ketcher-core';
${usage}`,
    );
    await writeFile(
      join(directory, 'tsconfig.json'),
      JSON.stringify({
        compilerOptions: {
          target: 'ES2022',
          module: 'NodeNext',
          moduleResolution: 'NodeNext',
          strict: true,
          noEmit: true,
          skipLibCheck: true,
          types: [],
        },
        files: ['consumer.cts', 'consumer.mts'],
      }),
    );
    const checked = spawnSync(
      process.execPath,
      [
        require.resolve('typescript/bin/tsc'),
        '-p',
        join(directory, 'tsconfig.json'),
      ],
      { encoding: 'utf8', cwd: fileURLToPath(new URL('..', import.meta.url)) },
    );
    assert.equal(checked.status, 0, `${checked.stdout}\n${checked.stderr}`);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
