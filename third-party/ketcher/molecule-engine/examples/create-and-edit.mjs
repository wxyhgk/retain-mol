import { createMoleculeSession } from 'molecule-engine';
import { EDIT_SCHEMA } from 'molecule-contracts';

function unwrap(result) {
  if (!result.ok) throw new Error(JSON.stringify(result.error));
  return result.value;
}

const session = unwrap(
  createMoleculeSession({ documentId: 'example-molecule' }),
);

function prepare(requestId, commands) {
  const { documentId, revision } = session.getDocument();
  return unwrap(
    session.prepareEdit({
      schema: EDIT_SCHEMA,
      documentId,
      baseRevision: revision,
      requestId,
      commands,
    }),
  );
}

// This host explicitly authorizes committing its two example edits.
// An interactive host can display candidate/changes before calling commitEdit.
const draft = prepare('create-cco', [
  { op: 'atom.add', ref: 'left', element: 'C' },
  { op: 'atom.add', ref: 'middle', element: 'C' },
  { op: 'atom.add', ref: 'terminal', element: 'O' },
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
]);
const created = unwrap(
  session.commitEdit({
    preparedId: draft.preparedId,
    requestId: draft.requestId,
  }),
);

// Existing entities are addressed using returned IDs, not array positions.
const edit = prepare('change-terminal-element', [
  {
    op: 'atom.update',
    target: { id: created.refs.atoms.terminal },
    patch: { element: 'N' },
  },
]);
const changed = unwrap(
  session.commitEdit({
    preparedId: edit.preparedId,
    requestId: edit.requestId,
  }),
);
const afterEdit = session.getDocument();

unwrap(
  session.undo({
    documentId: afterEdit.documentId,
    baseRevision: afterEdit.revision,
    expectedCommitId: changed.commitId,
  }),
);
const afterUndo = session.getDocument();
unwrap(
  session.redo({
    documentId: afterUndo.documentId,
    baseRevision: afterUndo.revision,
    expectedCommitId: changed.commitId,
  }),
);

console.log(
  JSON.stringify(
    {
      afterEdit,
      afterUndo,
      afterRedo: session.getDocument(),
      warnings: changed.warnings,
      capabilities: session.getCapabilities(),
    },
    null,
    2,
  ),
);
