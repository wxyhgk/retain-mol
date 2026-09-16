import {
  Action,
  Atom,
  Box2Abs,
  fromAtomAddition,
  fromAtomsAttrs,
  fromMultipleMove,
  fromNewCanvas,
  ReStruct,
  Render,
  type RenderOptions,
  Struct,
  Vec2,
} from 'ketcher-core';
import { HistoryManager } from './HistoryManager';
import { StructManager } from './StructManager';
import { RenderAdapter } from '../view/RenderAdapter';
import { ViewManager } from '../view/ViewManager';

function createFixture() {
  const render = new Render(
    document as unknown as HTMLElement,
    {
      microModeScale: 20,
      width: 100,
      height: 100,
    } as RenderOptions,
  );
  render.ctab = new ReStruct(new Struct(), render);
  Object.defineProperty(render, 'clientArea', {
    value: document.createElement('div'),
  });
  jest.spyOn(render, 'update').mockImplementation(() => undefined);
  const notifyDocumentChange = jest.fn();
  const editorChange = jest.fn();
  const history = new HistoryManager(
    {
      render,
      _tool: null,
      selection: jest.fn(),
      event: {
        change: { dispatch: editorChange },
        showInfo: { dispatch: jest.fn() },
      },
      findItem: jest.fn().mockReturnValue(null),
      struct: () => render.ctab.molecule,
    },
    {
      dispatchExternalChange: jest.fn(),
      shouldOmitActionOnHistoryReplay: () => false,
      notifyDocumentChange,
    },
  );
  const update = (action: Action, ignoreHistory?: boolean) =>
    history.update(action, ignoreHistory);
  const view = new ViewManager(new RenderAdapter(render), {
    getCtab: () => render.ctab,
    getStruct: () => render.ctab.molecule,
    update,
    rerenderRotateController: jest.fn(),
    dispatchZoomChanged: jest.fn(),
    notifyDocumentChange,
  });
  // Viewport scrolling is independent of molecule coordinates.
  jest
    .spyOn(view, 'centerViewportAccordingToStruct')
    .mockImplementation(() => undefined);
  const structs = new StructManager({
    getRender: () => render,
    getViewManager: () => view,
    getSelectionManager: () => ({ selection: jest.fn() }),
    getHoverIcon: () => ({ create: jest.fn() }),
    update,
    notifyDocumentChange,
    isMonomerCreationWizardActive: () => false,
    shouldPreserveStructPosition: () => false,
    updateToolAfterOptionsChange: jest.fn(),
  });
  return { render, history, notifyDocumentChange, editorChange, view, structs };
}

describe('completed document changes with real core actions', () => {
  afterEach(() => jest.restoreAllMocks());

  it('publishes edits and successful undo/redo with the resulting model and history', () => {
    const { render, history, notifyDocumentChange, editorChange } =
      createFixture();
    const observed: unknown[] = [];
    notifyDocumentChange.mockImplementation((reason) => {
      observed.push([
        reason,
        render.ctab.molecule.atoms.get(0)?.label,
        history.historySize(),
      ]);
    });
    editorChange.mockImplementation(() => {
      expect(observed).toHaveLength(editorChange.mock.calls.length);
    });

    history.update(
      fromAtomAddition(render.ctab, new Vec2(0, 0), { label: 'C' }),
    );
    history.update(fromAtomsAttrs(render.ctab, [0], { label: 'O' }, false));
    history.undo();
    history.redo();

    expect(observed).toEqual([
      ['edit', 'C', { undo: 1, redo: 0 }],
      ['edit', 'O', { undo: 2, redo: 0 }],
      ['undo', 'C', { undo: 1, redo: 1 }],
      ['redo', 'O', { undo: 2, redo: 0 }],
    ]);
    expect(editorChange).toHaveBeenCalledTimes(4);
  });

  it('does not publish a drag preview, its cancellation, redraws, or dummy actions', () => {
    const { render, history, notifyDocumentChange } = createFixture();
    history.update(
      fromAtomAddition(render.ctab, new Vec2(0, 0), { label: 'C' }),
    );
    notifyDocumentChange.mockClear();
    const preview = fromMultipleMove(
      render.ctab,
      { atoms: [0] },
      new Vec2(2, 1),
    );
    history.update(preview, true);
    history.update(preview.perform(render.ctab), true);
    history.update(true);
    history.update(new Action());

    expect(render.ctab.molecule.atoms.get(0)?.pp).toEqual(new Vec2(0, 0));
    expect(history.historySize()).toEqual({ undo: 1, redo: 0 });
    expect(notifyDocumentChange).not.toHaveBeenCalled();
  });

  it('does not publish unsuccessful undo and redo', () => {
    const { render, history, notifyDocumentChange } = createFixture();
    expect(() => history.undo()).toThrow('Undo stack is empty');
    expect(() => history.redo()).toThrow('Redo stack is empty');
    expect(notifyDocumentChange).not.toHaveBeenCalled();
    const action = fromAtomAddition(render.ctab, new Vec2(0, 0), {
      label: 'C',
    });
    history.update(action);
    jest.spyOn(action, 'perform').mockImplementation(() => {
      throw new Error('replay failed');
    });
    notifyDocumentChange.mockClear();

    expect(() => history.undo()).toThrow('replay failed');
    expect(history.historySize()).toEqual({ undo: 1, redo: 0 });
    expect(notifyDocumentChange).not.toHaveBeenCalled();
  });

  it('does not publish a failed redo replay', () => {
    const { render, history, notifyDocumentChange } = createFixture();
    history.update(
      fromAtomAddition(render.ctab, new Vec2(0, 0), { label: 'C' }),
    );
    history.undo();
    jest.spyOn(history.historyStack[0], 'perform').mockImplementation(() => {
      throw new Error('redo failed');
    });
    notifyDocumentChange.mockClear();

    expect(() => history.redo()).toThrow('redo failed');
    expect(history.historySize()).toEqual({ undo: 0, redo: 1 });
    expect(notifyDocumentChange).not.toHaveBeenCalled();
  });

  it('identifies whole-canvas replacement and retains its undo/redo behavior', () => {
    const { render, history, notifyDocumentChange, structs } = createFixture();
    const original = render.ctab.molecule;
    const replacement = new Struct();
    replacement.atoms.add(new Atom({ label: 'N', pp: new Vec2(3, 4) }));

    structs.struct(replacement, false);
    expect(notifyDocumentChange).toHaveBeenLastCalledWith('replace');
    expect(render.ctab.molecule).toBe(replacement);
    history.undo();
    expect(render.ctab.molecule).toBe(original);
    history.redo();
    expect(render.ctab.molecule).toBe(replacement);
    expect(notifyDocumentChange.mock.calls).toEqual([
      ['replace'],
      ['undo'],
      ['redo'],
    ]);
  });

  it('publishes permanent positioning without adding history, but ignores a zero shift', () => {
    const { render, history, notifyDocumentChange, view } = createFixture();
    history.update(
      fromAtomAddition(render.ctab, new Vec2(0, 0), { label: 'C' }),
    );
    notifyDocumentChange.mockClear();
    view.positionStruct(4, 2);
    expect(render.ctab.molecule.atoms.get(0)?.pp).toEqual(new Vec2(4, 2));
    expect(notifyDocumentChange).toHaveBeenCalledWith('untracked');
    view.positionStruct(4, 2);
    expect(notifyDocumentChange).toHaveBeenCalledTimes(1);
    expect(history.historySize()).toEqual({ undo: 1, redo: 0 });
  });

  it('publishes permanent centering only when molecule coordinates change', () => {
    const { render, history, notifyDocumentChange, view } = createFixture();
    history.update(
      fromAtomAddition(render.ctab, new Vec2(0, 0), { label: 'C' }),
    );
    const atom = render.ctab.molecule.atoms.get(0);
    if (!atom) throw new Error('Expected the inserted atom');
    jest.spyOn(render.ctab, 'getVBoxObj').mockImplementation(() => {
      const position = atom.pp;
      return new Box2Abs(position, position);
    });
    render.viewBox = { minX: 0, minY: 0, width: 100, height: 100 };
    notifyDocumentChange.mockClear();
    view.centerStruct();
    const centered = new Vec2(atom.pp);
    expect(centered).not.toEqual(new Vec2(0, 0));
    view.centerStruct();
    expect(render.ctab.molecule.atoms.get(0)?.pp).toEqual(centered);
    expect(notifyDocumentChange.mock.calls).toEqual([['untracked']]);
    expect(history.historySize()).toEqual({ undo: 1, redo: 0 });
  });

  it('publishes positioned fragment insertion despite its existing ignoreHistory path', () => {
    const { render, history, notifyDocumentChange, structs } = createFixture();
    const fragmentFixture = createFixture();
    fromAtomAddition(fragmentFixture.render.ctab, new Vec2(0, 0), {
      label: 'N',
    });
    const fragment = fragmentFixture.render.ctab.molecule;

    structs.structToAddFragment(fragment, 3, 4);

    expect(render.ctab.molecule.atoms.size).toBe(1);
    expect(render.ctab.molecule.atoms.get(0)?.label).toBe('N');
    expect(notifyDocumentChange.mock.calls).toEqual([['untracked']]);
    expect(history.historySize()).toEqual({ undo: 0, redo: 0 });
  });

  it('recognizes direct fromNewCanvas actions from callers outside StructManager', () => {
    const { render, history, notifyDocumentChange } = createFixture();
    history.update(fromNewCanvas(render.ctab, new Struct()));
    expect(notifyDocumentChange.mock.calls).toEqual([['replace']]);
  });
});
