import { CoreEditor, EditorHistory } from 'application/editor';
import {
  createPolymerEditorCanvas,
  createRenderersManager,
} from '../../helpers/dom';
import { Command } from 'domain/entities/Command';

describe('EditorHistory', () => {
  let canvas;
  let editor: CoreEditor;
  let history: EditorHistory;
  beforeEach(() => {
    canvas = createPolymerEditorCanvas();
    editor = new CoreEditor({
      theme: {},
      canvas,
      renderersContainer: createRenderersManager(),
    });
    history = EditorHistory.getInstance(editor);
  });

  afterEach(() => {
    history.destroy();
  });

  it('should reuse the history for the same editor', () => {
    const historyInstance2 = EditorHistory.getInstance(editor);
    expect(history).toBe(historyInstance2);
  });

  it('should isolate histories belonging to different editors', () => {
    const secondEditor = new CoreEditor({
      theme: {},
      canvas: createPolymerEditorCanvas(),
      renderersContainer: createRenderersManager(),
    });
    const secondHistory = EditorHistory.getInstance(secondEditor);

    history.update(new Command());
    secondHistory.update(new Command());
    secondHistory.update(new Command());

    expect(secondHistory).not.toBe(history);
    expect(history.historyStack).toHaveLength(1);
    expect(secondHistory.historyStack).toHaveLength(2);

    secondHistory.destroy();
    secondEditor.destroy();
  });

  it('should create another instance after destroy', () => {
    history.destroy();
    const historyInstance2 = EditorHistory.getInstance(editor);
    expect(history).not.toBe(historyInstance2);
  });

  it('should add commands into history stack', () => {
    history.update(new Command());
    history.update(new Command());
    expect(history.historyStack.length).toEqual(2);
  });

  it('should move pointer when undo/redo methods called', () => {
    history.update(new Command());
    history.update(new Command());
    expect(history.historyPointer).toEqual(2);
    history.redo();
    expect(history.historyPointer).toEqual(2);
    history.undo();
    expect(history.historyPointer).toEqual(1);
    history.undo();
    expect(history.historyPointer).toEqual(0);
    history.undo();
    expect(history.historyPointer).toEqual(0);
    history.redo();
    expect(history.historyPointer).toEqual(1);
  });

  it('should keep the pointer unchanged when undo fails', () => {
    const command = new Command();
    jest.spyOn(command, 'invert').mockImplementation(() => {
      throw new Error('undo failed');
    });
    history.update(command);

    expect(() => history.undo()).toThrow('undo failed');
    expect(history.historyPointer).toBe(1);
  });

  it('should have stack maximum size equal 32 commands', () => {
    for (let i = 0; i < 40; i++) {
      history.update(new Command());
    }
    expect(history.historyStack.length).toEqual(32);
    expect(history.historyPointer).toEqual(32);
  });
});
