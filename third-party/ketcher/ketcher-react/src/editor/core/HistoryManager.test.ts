import type { Action, Render, Struct } from 'ketcher-core';
import type { Tool } from '../tool/Tool';
import {
  HistoryManager,
  type HistoryManagerDependencies,
} from './HistoryManager';

const createAction = () =>
  ({
    operations: [],
    isDummy: jest.fn().mockReturnValue(false),
    perform: jest.fn(),
  } as unknown as Action);

const createFixture = (omitReplayAction = false) => {
  const dispatchEditorChange = jest.fn();
  const dispatchExternalChange = jest.fn();
  const selection = jest.fn();
  const cancel = jest.fn();
  const updateRender = jest.fn();
  const tool = { cancel } as Tool;
  const ctab = {
    needRecalculateVisibleAtomsAndBonds: false,
  };
  const editor = {
    _tool: tool,
    render: {
      ctab,
      update: updateRender,
    } as unknown as Render,
    selection,
    event: {
      change: { dispatch: dispatchEditorChange },
      showInfo: { dispatch: jest.fn() },
    },
    findItem: jest.fn().mockReturnValue(null),
    struct: jest.fn() as unknown as () => Struct,
  };
  const dependencies: HistoryManagerDependencies = {
    dispatchExternalChange,
    shouldOmitActionOnHistoryReplay: jest
      .fn()
      .mockReturnValue(omitReplayAction),
  };

  return {
    cancel,
    ctab,
    dependencies,
    dispatchEditorChange,
    dispatchExternalChange,
    editor,
    manager: new HistoryManager(editor, dependencies),
    selection,
    updateRender,
  };
};

describe('HistoryManager', () => {
  it('dispatches stored changes through the injected external event', () => {
    const fixture = createFixture();
    const action = createAction();

    fixture.manager.update(action);

    expect(fixture.dispatchEditorChange).toHaveBeenCalledWith(action);
    expect(fixture.dispatchExternalChange).toHaveBeenCalledWith(action);
    expect(fixture.manager.historySize()).toEqual({ undo: 1, redo: 0 });
    expect(fixture.updateRender).toHaveBeenCalledWith(false, null);
  });

  it('preserves undo and redo action dispatch semantics', () => {
    const fixture = createFixture();
    const undoAction = createAction();
    const redoAction = createAction();
    const nextUndoAction = createAction();
    jest.mocked(undoAction.perform).mockReturnValue(redoAction);
    jest.mocked(redoAction.perform).mockReturnValue(nextUndoAction);

    fixture.manager.update(undoAction);
    fixture.dispatchEditorChange.mockClear();
    fixture.dispatchExternalChange.mockClear();

    fixture.manager.undo();

    expect(fixture.cancel).toHaveBeenCalledTimes(1);
    expect(fixture.selection).toHaveBeenCalledWith(null);
    expect(fixture.dispatchEditorChange).toHaveBeenLastCalledWith(redoAction);
    expect(fixture.dispatchExternalChange).toHaveBeenLastCalledWith(redoAction);
    expect(fixture.manager.historySize()).toEqual({ undo: 0, redo: 1 });

    fixture.manager.redo();

    expect(fixture.dispatchEditorChange).toHaveBeenLastCalledWith(
      nextUndoAction,
    );
    expect(fixture.dispatchExternalChange).toHaveBeenLastCalledWith(
      nextUndoAction,
    );
    expect(fixture.manager.historySize()).toEqual({ undo: 1, redo: 0 });
    expect(fixture.ctab.needRecalculateVisibleAtomsAndBonds).toBe(true);
  });

  it('omits replay actions when the injected tool policy requests it', () => {
    const fixture = createFixture(true);
    const undoAction = createAction();
    const redoAction = createAction();
    jest.mocked(undoAction.perform).mockReturnValue(redoAction);

    fixture.manager.update(undoAction);
    fixture.dispatchEditorChange.mockClear();
    fixture.dispatchExternalChange.mockClear();

    fixture.manager.undo();

    expect(
      fixture.dependencies.shouldOmitActionOnHistoryReplay,
    ).toHaveBeenCalledWith(fixture.editor._tool);
    expect(fixture.dispatchEditorChange).toHaveBeenCalledWith();
    expect(fixture.dispatchExternalChange).toHaveBeenCalledWith();
  });

  it('keeps the history pointer unchanged when undo replay fails', () => {
    const fixture = createFixture();
    const undoAction = createAction();
    jest.mocked(undoAction.perform).mockImplementation(() => {
      throw new Error('undo failed');
    });

    fixture.manager.update(undoAction);

    expect(() => fixture.manager.undo()).toThrow('undo failed');
    expect(fixture.manager.historySize()).toEqual({ undo: 1, redo: 0 });
    expect(fixture.dispatchEditorChange).toHaveBeenCalledTimes(1);
    expect(fixture.updateRender).toHaveBeenCalledTimes(1);
  });

  it('keeps the history pointer unchanged when redo replay fails', () => {
    const fixture = createFixture();
    const undoAction = createAction();
    const redoAction = createAction();
    jest.mocked(undoAction.perform).mockReturnValue(redoAction);
    jest.mocked(redoAction.perform).mockImplementation(() => {
      throw new Error('redo failed');
    });

    fixture.manager.update(undoAction);
    fixture.manager.undo();

    expect(() => fixture.manager.redo()).toThrow('redo failed');
    expect(fixture.manager.historySize()).toEqual({ undo: 0, redo: 1 });
  });
});
