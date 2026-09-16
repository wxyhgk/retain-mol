import type { Render } from 'ketcher-core';
import Editor from './Editor';
import { EditorEventBus } from './bus/EditorEventBus';
import SelectTool from './tool/select/select';
import type { EditableSelectionToolContext } from './tool/select/selectionToolContext';

function createFixture() {
  const area = document.createElement('div');
  const bus = new EditorEventBus(area);
  const editor: Editor = Object.assign(Object.create(Editor.prototype), {
    moleculeCommitManager: { unavailableReason: null, isCommitting: false },
    documentObserversDisposed: false,
    monomerCreationDocumentTransitioning: false,
    monomerWizardManager: { isMonomerCreationWizardActive: false },
    eventBus: bus,
    render: { options: {}, clientArea: area } as unknown as Render,
    contextMenu: {},
    _tool: null,
  });
  return { editor, bus, area };
}

describe('molecule host busy policy', () => {
  it('accepts only null or an idle default selection tool and does not cancel tools', () => {
    const { editor, bus } = createFixture();
    expect(editor.getMoleculeEditBusyReason()).toBeNull();
    const cancel = jest.fn();
    editor._tool = { cancel };
    expect(editor.getMoleculeEditBusyReason()).not.toBeNull();
    expect(cancel).not.toHaveBeenCalled();
    const select = new SelectTool(
      {} as EditableSelectionToolContext,
      'rectangle',
    );
    editor._tool = select;
    expect(editor.getMoleculeEditBusyReason()).toBeNull();
    select.isMouseDown = true;
    expect(editor.getMoleculeEditBusyReason()).not.toBeNull();
    select.isMouseDown = false;
    // Completed modifier-drag copy leaves this historical flag set.
    select.isCopied = true;
    expect(editor.getMoleculeEditBusyReason()).toBeNull();
    editor._tool = new SelectTool({} as EditableSelectionToolContext, 'lasso');
    expect(editor.getMoleculeEditBusyReason()).not.toBeNull();
    bus.destroy();
  });

  it('rejects a pointer held before model movement and every mouseup callback', () => {
    const { editor, bus, area } = createFixture();
    area.dispatchEvent(new MouseEvent('pointerdown', { button: 0 }));
    expect(editor.getMoleculeEditBusyReason()).not.toBeNull();
    bus.on('mouseup', () => {
      expect(editor.getMoleculeEditBusyReason()).not.toBeNull();
    });
    document.dispatchEvent(new MouseEvent('mouseup', { button: 0 }));
    expect(editor.getMoleculeEditBusyReason()).toBeNull();
    bus.destroy();
  });

  it('rejects open dialogs and automatic downscaling', () => {
    const { editor, bus } = createFixture();
    const dialog = document.createElement('dialog');
    dialog.open = true;
    document.body.append(dialog);
    expect(editor.getMoleculeEditBusyReason()).not.toBeNull();
    dialog.remove();
    editor.render.options.downScale = true;
    expect(editor.getMoleculeEditBusyReason()).toContain('downscaling');
    bus.destroy();
  });
});
