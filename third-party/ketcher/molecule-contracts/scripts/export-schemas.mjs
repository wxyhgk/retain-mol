import { mkdir, writeFile } from 'node:fs/promises';
import {
  moleculeCommitRequestSchema,
  moleculeDocumentSchema,
  moleculeEditRequestSchema,
  moleculeHistoryRequestSchema,
} from '../dist/index.js';

const destination = new URL('../dist/schemas/', import.meta.url);
await mkdir(destination, { recursive: true });
await writeFile(
  new URL('../dist/cjs/package.json', import.meta.url),
  `${JSON.stringify({ type: 'commonjs' }, null, 2)}\n`,
);
for (const [name, schema] of Object.entries({
  'edit-request': moleculeEditRequestSchema,
  document: moleculeDocumentSchema,
  'commit-request': moleculeCommitRequestSchema,
  'history-request': moleculeHistoryRequestSchema,
})) {
  await writeFile(
    new URL(`${name}.json`, destination),
    `${JSON.stringify(schema, null, 2)}\n`,
  );
}
