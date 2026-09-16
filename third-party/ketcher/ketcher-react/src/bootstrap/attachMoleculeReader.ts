import {
  getComputationalFormatMetadata,
  KetcherLogger,
  type Editor,
  type Ketcher,
} from 'ketcher-core';
import {
  createMoleculeCanvasEditor,
  createMoleculeCanvasReader,
  type MoleculeCanvasSource,
} from 'molecule-ketcher';

/** Bind eagerly during initialization, before a pointer gesture can preview. */
export function attachMoleculeReader(
  ketcher: Ketcher,
  editor: Editor,
): () => void {
  const subscribe = editor.subscribeDocumentChanges?.bind(editor);
  if (!subscribe) return () => undefined;
  const source: MoleculeCanvasSource = {
    getStruct: () => editor.struct(),
    subscribe,
    getUnavailableReason: () => {
      if (ketcher.moleculeCanvasUnavailableReason)
        return ketcher.moleculeCanvasUnavailableReason;
      if (window.isPolymerEditorTurnedOn)
        return 'Only the micromolecule canvas is supported.';
      if (editor.isMonomerCreationWizardActive)
        return 'The monomer creation wizard is not supported.';
      if (editor.isMonomerCreationDocumentTransitioning)
        return 'The monomer creation document transition has not completed.';
      return editor.getMoleculeEditUnavailableReason?.() ?? null;
    },
    getAdditionalIssues: () => {
      const metadata = getComputationalFormatMetadata(editor.struct());
      return metadata && Object.keys(metadata).length
        ? [
            {
              code: 'unsupported-feature',
              path: '/calculation',
              message:
                'Calculation and extended geometry metadata are not represented by basic-graph-v1.',
            },
          ]
        : [];
    },
  };
  const options = {
    onListenerError: (error: unknown) =>
      KetcherLogger.warn('Molecule canvas listener failed.', error),
  };
  const commit = editor.commitMoleculeStruct?.bind(editor);
  const getEditBusyReason = editor.getMoleculeEditBusyReason?.bind(editor);
  const result =
    commit && getEditBusyReason
      ? createMoleculeCanvasEditor(
          { ...source, commit, getEditBusyReason },
          options,
        )
      : createMoleculeCanvasReader(source, options);
  if (!result.ok) {
    KetcherLogger.warn(
      'Molecule canvas reader could not be initialized.',
      result.error,
    );
    return () => undefined;
  }
  const reader = result.value;
  ketcher.setMoleculeReader(reader, () => reader.dispose());
  return () => {
    if (ketcher.molecule === reader) ketcher.setMoleculeReader(null);
    else reader.dispose();
  };
}
