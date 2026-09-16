import { KetcherLogger } from 'ketcher-core';
import Editor from './Editor';

// Exercise observer delivery without constructing Raphael's SVG surface.
const createEditorObservers = (): Editor =>
  Object.assign(Object.create(Editor.prototype), {
    documentChangeListeners: new Set(),
    documentObserversDisposed: false,
  });

describe('Editor committed document observers', () => {
  afterEach(() => jest.restoreAllMocks());

  it('isolates failing observers and supports unsubscribe', () => {
    const editor = createEditorObservers();
    const failure = new Error('listener failed');
    const failing = jest.fn(() => {
      throw failure;
    });
    const healthy = jest.fn();
    const log = jest
      .spyOn(KetcherLogger, 'error')
      .mockImplementation(() => undefined);
    const unsubscribe = editor.subscribeDocumentChanges(failing);
    editor.subscribeDocumentChanges(healthy);

    editor.notifyDocumentChange('edit');
    expect(healthy).toHaveBeenCalledWith('edit');
    expect(log).toHaveBeenCalledWith(
      'Document change observer failed',
      failure,
    );

    unsubscribe();
    editor.notifyDocumentChange('undo');
    expect(failing).toHaveBeenCalledTimes(1);
    expect(healthy).toHaveBeenLastCalledWith('undo');
    editor.disposeDocumentObservers();
  });

  it('disposes once and does not retain new subscriptions during or after disposal', () => {
    const editor = createEditorObservers();
    const late = jest.fn();
    const observer = jest.fn((reason) => {
      if (reason === 'dispose') editor.subscribeDocumentChanges(late);
    });
    editor.subscribeDocumentChanges(observer);

    editor.disposeDocumentObservers();
    editor.subscribeDocumentChanges(late)();
    editor.disposeDocumentObservers();
    editor.notifyDocumentChange('edit');

    expect(observer).toHaveBeenCalledTimes(1);
    expect(observer).toHaveBeenCalledWith('dispose');
    expect(late).not.toHaveBeenCalled();
  });

  it('does not continue an edit notification after an observer disposes the editor', () => {
    const editor = createEditorObservers();
    editor.subscribeDocumentChanges((reason) => {
      if (reason === 'edit') editor.disposeDocumentObservers();
    });
    const later = jest.fn();
    editor.subscribeDocumentChanges(later);

    editor.notifyDocumentChange('edit');

    expect(later.mock.calls).toEqual([['dispose']]);
  });
});
