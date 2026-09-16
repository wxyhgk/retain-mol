import {
  Atom,
  Ketcher,
  Struct,
  getComputationalFormatMetadata,
  setComputationalFormatMetadata,
  type Editor,
  type EditorDocumentChangeReason,
  type FormatterFactory,
  type StructService,
} from 'ketcher-core';
import type { MoleculeCanvasReader } from 'molecule-contracts';
import { attachMoleculeReader } from './attachMoleculeReader';

type Listener = (reason: EditorDocumentChangeReason) => void;

function createHost() {
  let structure = new Struct();
  structure.atoms.add(new Atom({ label: 'O' }));
  // Keep the real Ketcher, Struct, and adapter. Only the editor's committed
  // model port is replaced, so these tests do not need a Raphael surface.
  const port = {
    listeners: new Set<Listener>(),
    isMonomerCreationWizardActive: false,
    isMonomerCreationDocumentTransitioning: false,
    struct: jest.fn(() => structure),
    subscribeDocumentChanges(listener: Listener) {
      this.listeners.add(listener);
      return () => this.listeners.delete(listener);
    },
    notifyDocumentChange(reason: EditorDocumentChangeReason) {
      for (const listener of [...this.listeners]) listener(reason);
    },
  };
  const editor = port as unknown as Editor;
  const ketcher = new Ketcher({} as StructService, {} as FormatterFactory);
  ketcher.addEditor(editor);
  return {
    ketcher,
    editor,
    port,
    replace(next: Struct) {
      structure = next;
      port.notifyDocumentChange('replace');
    },
  };
}

function documentOf(reader: MoleculeCanvasReader) {
  const result = reader.getDocument();
  if (!result.ok) throw new Error(JSON.stringify(result.error));
  return result.value;
}

describe('attachMoleculeReader public Ketcher integration', () => {
  const cleanups: (() => void)[] = [];
  let previousMacroMode: boolean;

  beforeEach(() => {
    previousMacroMode = window.isPolymerEditorTurnedOn;
    window.isPolymerEditorTurnedOn = false;
  });

  afterEach(() => {
    for (const cleanup of cleanups.splice(0).reverse()) cleanup();
    window.isPolymerEditorTurnedOn = previousMacroMode;
  });

  function attach(host: ReturnType<typeof createHost>) {
    const cleanup = attachMoleculeReader(host.ketcher, host.editor);
    cleanups.push(cleanup);
    const reader = host.ketcher.molecule;
    if (!reader) throw new Error('Expected a real attached canvas reader.');
    return { reader, cleanup };
  }

  it('captures on attachment and publishes only committed changes through Ketcher.molecule', () => {
    const host = createHost();
    const { reader } = attach(host);
    expect(host.port.struct).toHaveBeenCalled();
    const initial = documentOf(reader);
    expect(initial.atoms[0].element).toBe('O');
    expect(initial.revision).toBe(0);

    const observer = jest.fn();
    reader.subscribe(observer);
    const atom = host.port.struct().atoms.get(0);
    if (!atom) throw new Error('Expected an oxygen atom in the fixture.');
    atom.label = 'N';
    expect(documentOf(reader)).toBe(initial);
    expect(documentOf(reader).atoms[0].element).toBe('O');
    expect(observer).not.toHaveBeenCalled();

    host.port.notifyDocumentChange('edit');
    const attached = host.ketcher.molecule;
    if (!attached) throw new Error('Expected the reader to remain attached.');
    const edited = documentOf(attached);
    expect(edited.atoms[0].element).toBe('N');
    expect(edited.atoms[0].id).toBe(initial.atoms[0].id);
    expect(edited.revision).toBe(1);
    expect(observer).toHaveBeenCalledTimes(1);
    expect(observer).toHaveBeenLastCalledWith(
      expect.objectContaining({ status: 'ready', reason: 'edit', revision: 1 }),
    );
    expect(initial.atoms[0].element).toBe('O');
  });

  it('cleans up once, clears the public reader, and detaches committed-change listeners', () => {
    const host = createHost();
    const { reader, cleanup } = attach(host);
    const observer = jest.fn();
    reader.subscribe(observer);
    expect(host.port.listeners.size).toBe(1);

    cleanup();
    expect(host.ketcher.molecule).toBeNull();
    expect(host.port.listeners.size).toBe(0);
    expect(reader.getState().status).toBe('disposed');
    expect(reader.getDocument()).toMatchObject({
      ok: false,
      error: { code: 'reader-disposed' },
    });
    expect(observer).toHaveBeenCalledTimes(1);
    expect(observer).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'disposed', reason: 'dispose' }),
    );
    const finalState = reader.getState();
    cleanup();
    host.port.notifyDocumentChange('edit');
    expect(reader.getState()).toBe(finalState);
    expect(observer).toHaveBeenCalledTimes(1);
  });

  it('does not clear a replacement reader when the previous attachment cleans up', () => {
    const host = createHost();
    const previous = attach(host);
    const current = attach(host);
    expect(previous.reader.getState().status).toBe('disposed');
    expect(host.port.listeners.size).toBe(1);

    previous.cleanup();
    expect(host.ketcher.molecule).toBe(current.reader);
    expect(current.reader.getState().status).toBe('ready');
    host.port.notifyDocumentChange('undo');
    expect(current.reader.getState()).toMatchObject({
      reason: 'undo',
      revision: 1,
    });
    expect(host.port.listeners.size).toBe(1);
  });

  it('disposes the old canvas when the real Ketcher switches editor instances', () => {
    const host = createHost();
    const previous = attach(host);
    const previousId = documentOf(previous.reader).atoms[0].id;
    const replacement = createHost();
    host.ketcher.addEditor(replacement.editor);
    expect(host.ketcher.molecule).toBeNull();
    expect(previous.reader.getState().status).toBe('disposed');
    expect(host.port.listeners.size).toBe(0);

    const current = attach({ ...replacement, ketcher: host.ketcher });
    previous.cleanup();
    expect(host.ketcher.molecule).toBe(current.reader);
    expect(documentOf(current.reader).atoms[0].id).not.toBe(previousId);
  });

  it('rejects committed calculation metadata without losing it or returning a partial graph', () => {
    const host = createHost();
    const structure = host.port.struct();
    setComputationalFormatMetadata(structure, {});
    const { reader } = attach(host);
    const initial = documentOf(reader);
    setComputationalFormatMetadata(structure, {
      molecularCharge: 0,
      molecularMultiplicity: 1,
    });
    expect(documentOf(reader)).toBe(initial);

    host.port.notifyDocumentChange('edit');
    expect(reader.getState()).toMatchObject({
      status: 'unsupported',
      revision: 1,
      issues: [
        expect.objectContaining({
          code: 'unsupported-feature',
          path: '/calculation',
        }),
      ],
    });
    expect(reader.getDocument()).toMatchObject({
      ok: false,
      error: { code: 'unsupported-document' },
    });
    expect(reader.getDocument()).not.toHaveProperty('value');
    expect(getComputationalFormatMetadata(structure)).toEqual({
      molecularCharge: 0,
      molecularMultiplicity: 1,
    });
    expect(structure.atoms.size).toBe(1);

    host.replace(new Struct());
    expect(documentOf(reader)).toMatchObject({
      revision: 2,
      atoms: [],
      bonds: [],
    });
    expect(reader.getState().status).toBe('ready');
  });

  it.each([
    ['wizard', 'isMonomerCreationWizardActive'],
    ['document transition', 'isMonomerCreationDocumentTransitioning'],
  ] as const)(
    'blocks %s reads and recovers when the guard clears',
    (_name, flag) => {
      const host = createHost();
      const { reader } = attach(host);
      const initial = documentOf(reader);
      const observer = jest.fn();
      reader.subscribe(observer);

      host.port[flag] = true;
      expect(reader.getDocument()).toMatchObject({
        ok: false,
        error: { code: 'canvas-unavailable' },
      });
      expect(reader.getState()).toMatchObject({
        status: 'unavailable',
        reason: 'mode',
        revision: 1,
      });
      expect(observer).toHaveBeenCalledTimes(1);

      host.port[flag] = false;
      const recovered = documentOf(reader);
      expect(recovered.revision).toBe(2);
      expect(recovered.atoms).toEqual(initial.atoms);
      expect(reader.getState().status).toBe('ready');
      expect(observer).toHaveBeenCalledTimes(2);
    },
  );

  it('blocks an initially active macromolecule canvas before sampling its structure, then recovers', () => {
    const host = createHost();
    window.isPolymerEditorTurnedOn = true;
    const { reader } = attach(host);
    expect(host.port.struct).not.toHaveBeenCalled();
    expect(reader.getState()).toMatchObject({
      status: 'unavailable',
      revision: 0,
    });
    expect(reader.getDocument()).toMatchObject({
      ok: false,
      error: { code: 'canvas-unavailable' },
    });

    window.isPolymerEditorTurnedOn = false;
    expect(documentOf(reader).atoms[0].element).toBe('O');
    expect(reader.getState()).toMatchObject({ status: 'ready', revision: 1 });
    window.isPolymerEditorTurnedOn = true;
    expect(reader.getState()).toMatchObject({
      status: 'unavailable',
      revision: 2,
    });
  });

  it('respects the public host transition guard until the real Ketcher clears it', () => {
    const host = createHost();
    const { reader } = attach(host);
    const observer = jest.fn();
    reader.subscribe(observer);
    host.ketcher.setMoleculeCanvasUnavailableReason('Converting the canvas.');
    expect(observer).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'unavailable',
        reason: 'mode',
        revision: 1,
      }),
    );
    expect(reader.getDocument()).toMatchObject({
      ok: false,
      error: { code: 'canvas-unavailable', message: 'Converting the canvas.' },
    });
    host.ketcher.setMoleculeCanvasUnavailableReason('Converting the canvas.');
    expect(observer).toHaveBeenCalledTimes(1);

    host.ketcher.setMoleculeCanvasUnavailableReason(null);
    expect(documentOf(reader).revision).toBe(2);
    expect(reader.getState().status).toBe('ready');
    expect(observer).toHaveBeenCalledTimes(2);
  });

  it('leaves custom editors without a committed-change port unattached', () => {
    const host = createHost();
    const editor = { struct: host.port.struct } as unknown as Editor;
    host.ketcher.addEditor(editor);
    const cleanup = attachMoleculeReader(host.ketcher, editor);
    cleanup();
    expect(host.ketcher.molecule).toBeNull();
    expect(host.port.struct).not.toHaveBeenCalled();
  });
});
