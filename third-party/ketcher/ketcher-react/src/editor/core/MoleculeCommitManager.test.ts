import {
  type EditorDocumentChangeReason,
  fromBondAddition,
  KetcherLogger,
  ReStruct,
  Render,
  type RenderOptions,
  Struct,
  Vec2,
} from 'ketcher-core';
import { PipelineSubscription, Subscription } from 'subscription';
import { createMoleculeCanvasReader } from 'molecule-ketcher';
import { HistoryManager } from './HistoryManager';
import { SelectionManager } from './SelectionManager';
import { MoleculeCommitManager } from './MoleculeCommitManager';
import { dispatchMoleculeListeners } from './moleculeListeners';

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
  fromBondAddition(
    render.ctab,
    { type: 1 },
    { label: 'C' },
    { label: 'O' },
    new Vec2(0, 0),
    new Vec2(1, 0),
  );
  render.options.zoom = 2;
  render.options.offset = new Vec2(3, 4);
  render.viewBox = { minX: 12, minY: 34, width: 100, height: 100 };
  const renderUpdate = jest
    .spyOn(render, 'update')
    .mockImplementation(() => render.ctab.assignConnectedComponents());
  jest.spyOn(render, 'setViewBox').mockImplementation((view) => {
    render.viewBox = view;
  });
  const selectionChange = new PipelineSubscription();
  const change = new Subscription();
  const selection = new SelectionManager({
    getCtab: () => render.ctab,
    getRender: () => render,
    getOptions: () => render.options,
    dispatchSelectionChange: (value) => selectionChange.dispatch(value),
    onSelectAll: jest.fn(),
    onSelectionCleared: jest.fn(),
    requestUpdate: jest.fn(),
    update: jest.fn(),
  });
  selection.replaceSilently({ atoms: [0, 1], bonds: [0] });
  const listeners = new Set<(reason: EditorDocumentChangeReason) => void>();
  const notify = jest.fn((reason: EditorDocumentChangeReason) => {
    for (const listener of listeners) listener(reason);
  });
  const publishLegacy = () => {
    dispatchMoleculeListeners(change);
    dispatchMoleculeListeners(selectionChange, selection.selection(), true);
  };
  const history = new HistoryManager(
    {
      render,
      _tool: null,
      selection: (value) => selection.selection(value),
      struct: () => render.ctab.molecule,
      findItem: () => null,
      event: { change, showInfo: { dispatch: jest.fn() } },
    },
    {
      dispatchExternalChange: jest.fn(),
      shouldOmitActionOnHistoryReplay: () => false,
      notifyDocumentChange: notify,
      publishMoleculeReplay: publishLegacy,
    },
  );
  let busyReason: string | null = null;
  const manager = new MoleculeCommitManager({
    getRender: () => render,
    getSelection: () => selection,
    getHistory: () => history,
    getBusyReason: () => busyReason,
    publish: () => {
      notify('edit');
      publishLegacy();
    },
  });
  const readerResult = createMoleculeCanvasReader({
    getStruct: () => render.ctab.molecule,
    getUnavailableReason: () => manager.unavailableReason,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  });
  if (!readerResult.ok) throw new Error(readerResult.error.message);
  const reader = readerResult.value;
  const original = render.ctab.molecule;
  const candidate = original.clone();
  const atom = candidate.atoms.get(1);
  if (!atom) throw new Error('Missing fixture atom');
  atom.label = 'N';
  return {
    manager,
    render,
    renderUpdate,
    history,
    selection,
    notify,
    reader,
    original,
    candidate,
    change,
    selectionChange,
    setBusy: (value: string | null) => {
      busyReason = value;
    },
  };
}

describe('atomic molecule host commit', () => {
  afterEach(() => jest.restoreAllMocks());

  it('renders and preserves selection/viewport before one history entry, receipt and event, with UI undo/redo', () => {
    const f = createFixture();
    const initialView = { ...f.render.viewBox };
    const revision = f.reader.getState().revision;
    const receipt = jest.fn(() => {
      expect(f.history.historySize()).toEqual({ undo: 1, redo: 0 });
      expect(f.render.ctab.molecule).toBe(f.candidate);
      expect(f.selection.selection()).toEqual({ atoms: [0, 1], bonds: [0] });
      expect(f.notify).not.toHaveBeenCalled();
    });
    const observed = jest.fn(() => expect(receipt).toHaveBeenCalledTimes(1));
    f.reader.subscribe(observed);

    expect(f.manager.commit(f.candidate, f.original, receipt)).toEqual({
      ok: true,
    });
    expect(f.render.viewBox).toEqual(initialView);
    expect(f.render.options.offset).toEqual(new Vec2(3, 4));
    expect(f.render.options.zoom).toBe(2);
    expect(f.reader.getState().revision).toBe(revision + 1);
    expect(f.notify.mock.calls).toEqual([['edit']]);

    f.render.viewBox.minX = 50;
    f.history.undo();
    expect(f.render.ctab.molecule).toBe(f.original);
    expect(f.render.viewBox.minX).toBe(50);
    expect(f.selection.selection()).toEqual({ atoms: [0, 1], bonds: [0] });
    f.history.redo();
    expect(f.render.ctab.molecule).toBe(f.candidate);
    expect(f.notify.mock.calls).toEqual([['edit'], ['undo'], ['redo']]);
  });

  it('silently drops deleted selection IDs and restores selection on undo', () => {
    const f = createFixture();
    f.candidate.bonds.clear();
    f.candidate.atoms.delete(1);
    f.candidate.initHalfBonds();
    f.candidate.initNeighbors();
    const selectionEvents = jest.fn();
    f.selectionChange.add(selectionEvents);
    expect(f.manager.commit(f.candidate, f.original, jest.fn())).toEqual({
      ok: true,
    });
    expect(f.selection.selection()).toEqual({ atoms: [0] });
    expect(selectionEvents).toHaveBeenCalledTimes(1);
    f.history.undo();
    expect(f.selection.selection()).toEqual({ atoms: [0, 1], bonds: [0] });
  });

  it('restores graph, nonempty selection, viewport, redo branch and reader revision after render failure', () => {
    const f = createFixture();
    f.manager.commit(f.candidate, f.original, jest.fn());
    f.history.undo();
    const oldStack = [...f.history.historyStack];
    const oldRevision = f.reader.getState().revision;
    const oldView = { ...f.render.viewBox };
    f.notify.mockClear();
    f.renderUpdate.mockImplementationOnce(() => {
      f.render.viewBox.minX = 900;
      throw new Error('render failed');
    });
    const receipt = jest.fn();

    expect(f.manager.commit(f.candidate, f.original, receipt)).toEqual({
      ok: false,
      reason: 'render',
      message: 'render failed',
    });
    expect(f.render.ctab.molecule).toBe(f.original);
    expect(f.selection.selection()).toEqual({ atoms: [0, 1], bonds: [0] });
    expect(f.render.viewBox).toEqual(oldView);
    expect(f.history.historyStack).toEqual(oldStack);
    expect(f.history.historySize()).toEqual({ undo: 0, redo: 1 });
    expect(f.reader.getState().revision).toBe(oldRevision);
    expect(receipt).not.toHaveBeenCalled();
    expect(f.notify).not.toHaveBeenCalled();
    f.history.redo();
    expect(f.render.ctab.molecule).toBe(f.candidate);
  });

  it('sets unavailable after the renderer also fails during restoration', () => {
    const f = createFixture();
    f.renderUpdate.mockImplementation(() => {
      throw new Error('renderer unavailable');
    });
    expect(f.manager.commit(f.candidate, f.original, jest.fn())).toEqual(
      expect.objectContaining({ ok: false, reason: 'rollback' }),
    );
    expect(f.manager.unavailableReason).not.toBeNull();
    expect(f.reader.getState().status).toBe('unavailable');
    expect(f.history.historySize()).toEqual({ undo: 0, redo: 0 });
  });

  it('isolates each legacy listener after publishing and never rolls back the successful result', () => {
    const f = createFixture();
    jest.spyOn(KetcherLogger, 'error').mockImplementation(() => undefined);
    f.change.add(() => {
      throw new Error('change listener failed');
    });
    f.selectionChange.add(() => {
      throw new Error('selection listener failed');
    });
    const laterChange = jest.fn();
    const laterSelection = jest.fn();
    f.change.add(laterChange);
    f.selectionChange.add(laterSelection);

    expect(f.manager.commit(f.candidate, f.original, jest.fn())).toEqual({
      ok: true,
    });
    expect(laterChange).toHaveBeenCalledWith(undefined);
    expect(laterSelection).toHaveBeenCalledWith({ atoms: [0, 1], bonds: [0] });
    expect(f.render.ctab.molecule).toBe(f.candidate);
    f.history.undo();
    f.history.redo();
    expect(f.render.ctab.molecule).toBe(f.candidate);
    expect(laterChange).toHaveBeenCalledTimes(3);
  });

  it('rejects busy and stale host calls before mutation or receipt caching', () => {
    const f = createFixture();
    const receipt = jest.fn();
    f.setBusy('Pointer held');
    expect(f.manager.commit(f.candidate, f.original, receipt)).toEqual({
      ok: false,
      reason: 'busy',
      message: 'Pointer held',
    });
    f.setBusy(null);
    expect(f.manager.commit(f.candidate, new Struct(), receipt)).toEqual(
      expect.objectContaining({ ok: false, reason: 'changed' }),
    );
    expect(f.render.ctab.molecule).toBe(f.original);
    expect(f.renderUpdate).not.toHaveBeenCalled();
    expect(receipt).not.toHaveBeenCalled();
  });

  it('returns to the saved history origin after undo and redo', () => {
    const f = createFixture();
    f.manager.commit(f.candidate, f.original, jest.fn());
    f.history.setOrigin();
    expect(f.history.isDirty()).toBe(false);
    f.history.undo();
    expect(f.history.isDirty()).toBe(true);
    f.history.redo();
    expect(f.history.isDirty()).toBe(false);
  });

  it('does not accumulate SVG layer anchors across swaps and failed restoration', () => {
    const f = createFixture();
    const layerCount = () =>
      f.render.paper.canvas.querySelectorAll('rect[class$="Layer"]').length;
    const before = layerCount();
    expect(before).toBeGreaterThan(0);
    f.manager.commit(f.candidate, f.original, jest.fn());
    expect(layerCount()).toBe(before);
    f.history.undo();
    f.history.redo();
    expect(layerCount()).toBe(before);
    f.renderUpdate.mockImplementationOnce(() => {
      throw new Error('render failed');
    });
    f.manager.commit(f.original, f.candidate, jest.fn());
    expect(layerCount()).toBe(before);
  });

  it('rejects automatic downscaling before changing the candidate or canvas', () => {
    const f = createFixture();
    f.render.options.downScale = true;
    const before = Array.from(
      f.candidate.atoms.values(),
      (atom) => new Vec2(atom.pp),
    );
    expect(f.manager.commit(f.candidate, f.original, jest.fn())).toEqual(
      expect.objectContaining({ ok: false, reason: 'busy' }),
    );
    expect(Array.from(f.candidate.atoms.values(), (atom) => atom.pp)).toEqual(
      before,
    );
    expect(f.render.ctab.molecule).toBe(f.original);
    expect(f.renderUpdate).not.toHaveBeenCalled();
  });
});
