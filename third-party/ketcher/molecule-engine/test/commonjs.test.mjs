import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const require = createRequire(import.meta.url);

function unwrap(result) {
  assert.equal(result.ok, true, JSON.stringify(result));
  return result.value;
}

test('CommonJS consumers create and edit molecules through real CJS outputs without DOM globals', () => {
  assert.equal(typeof window, 'undefined');
  assert.equal(typeof document, 'undefined');
  for (const name of ['molecule-engine', 'molecule-contracts']) {
    assert.match(require.resolve(name), /[/\\]dist[/\\]cjs[/\\]index\.js$/);
  }
  const { createMoleculeSession } = require('molecule-engine');
  const {
    EDIT_SCHEMA,
    validateDocumentSnapshot,
  } = require('molecule-contracts');
  const session = unwrap(
    createMoleculeSession({ documentId: 'commonjs-molecule' }),
  );
  const initial = session.getDocument();
  const prepared = unwrap(
    session.prepareEdit({
      schema: EDIT_SCHEMA,
      documentId: initial.documentId,
      baseRevision: initial.revision,
      requestId: 'commonjs-create',
      commands: [
        { op: 'atom.add', ref: 'carbon', element: 'C' },
        { op: 'atom.add', ref: 'oxygen', element: 'O' },
        {
          op: 'bond.add',
          ref: 'co',
          begin: { ref: 'carbon' },
          end: { ref: 'oxygen' },
          order: 'single',
        },
      ],
    }),
  );
  assert.equal(session.getDocument(), initial, 'prepare must not commit');
  const created = unwrap(
    session.commitEdit({
      preparedId: prepared.preparedId,
      requestId: prepared.requestId,
    }),
  );
  const existing = session.getDocument();
  assert.equal(existing.atoms.length, 2);
  assert.equal(existing.bonds.length, 1);
  assert.equal(validateDocumentSnapshot(existing).ok, true);
  const modification = unwrap(
    session.prepareEdit({
      schema: EDIT_SCHEMA,
      documentId: existing.documentId,
      baseRevision: existing.revision,
      requestId: 'commonjs-modify',
      commands: [
        {
          op: 'atom.update',
          target: { id: created.refs.atoms.oxygen },
          patch: { element: 'N' },
        },
      ],
    }),
  );
  unwrap(
    session.commitEdit({
      preparedId: modification.preparedId,
      requestId: modification.requestId,
    }),
  );
  const modified = session.getDocument();
  assert.equal(
    modified.atoms.find(({ id }) => id === created.refs.atoms.oxygen).element,
    'N',
  );
  assert.equal(modified.revision, existing.revision + 1);
  assert.equal(validateDocumentSnapshot(modified).ok, true);
  assert.equal(
    existing.atoms.find(({ id }) => id === created.refs.atoms.oxygen).element,
    'O',
  );
  assert.equal(session.getHistory().undo.length, 2);
});

test('ESM and CommonJS expose equivalent session capabilities and reject malformed requests', async () => {
  const cjs = require('molecule-engine');
  const esm = await import('molecule-engine');
  const commonSession = unwrap(
    cjs.createMoleculeSession({ documentId: 'commonjs-parity' }),
  );
  const moduleSession = unwrap(
    esm.createMoleculeSession({ documentId: 'esm-parity' }),
  );
  assert.deepEqual(
    commonSession.getCapabilities(),
    moduleSession.getCapabilities(),
  );
  for (const session of [commonSession, moduleSession]) {
    const initial = session.getDocument();
    const invalid = session.prepareEdit({
      commands: [{ op: 'atom.add', element: '*' }],
    });
    assert.equal(invalid.ok, false);
    assert.equal(invalid.error.code, 'invalid-request');
    assert.equal(session.getDocument(), initial);
  }
});

test('public engine declarations support NodeNext CommonJS and ESM consumers', async () => {
  const directory = await mkdtemp(
    new URL('./.consumer-types-', import.meta.url),
  );
  try {
    const usage = `
const options: engine.MoleculeSessionOptions = { documentId: 'typed-consumer' };
const opened = engine.createMoleculeSession(options);
if (opened.ok) {
  const session: engine.MoleculeSession = opened.value;
  const document: contracts.MoleculeDocumentSnapshot = session.getDocument();
  const request: contracts.MoleculeEditRequest = {
    schema: contracts.EDIT_SCHEMA,
    documentId: document.documentId,
    baseRevision: document.revision,
    requestId: 'typed-edit',
    commands: [{ op: 'atom.add', ref: 'carbon', element: 'C' }],
  };
  const prepared: contracts.Result<contracts.PreparedEdit> = session.prepareEdit(request);
  if (prepared.ok) session.commitEdit({ preparedId: prepared.value.preparedId, requestId: prepared.value.requestId });
}
`;
    await writeFile(
      join(directory, 'consumer.cts'),
      `
import engine = require('molecule-engine');
import contracts = require('molecule-contracts');
${usage}`,
    );
    await writeFile(
      join(directory, 'consumer.mts'),
      `
import * as engine from 'molecule-engine';
import * as contracts from 'molecule-contracts';
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
      { encoding: 'utf8' },
    );
    assert.equal(checked.status, 0, `${checked.stdout}\n${checked.stderr}`);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
