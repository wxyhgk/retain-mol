import type { Tool } from '../Tool';
import type { IToolContext } from '../IToolContext';
import { SelectViewOnlyTool } from './selectViewOnly';
import SelectTool from './select';
import type { SelectMode } from './select.types';
import type { EditableSelectionToolContext } from './selectionToolContext';

export * from './select.helpers';

function createSelectTool(
  editor: EditableSelectionToolContext,
  mode: SelectMode,
): Tool {
  const isViewOnlyMode = editor.render.options.viewOnlyMode === true;
  return isViewOnlyMode
    ? new SelectViewOnlyTool(editor, mode)
    : new SelectTool(editor, mode);
}

function supportsSelectionTools(
  editor: IToolContext,
): editor is IToolContext & EditableSelectionToolContext {
  return (
    typeof editor.structSelected === 'function' &&
    'reposition' in editor.rotateController &&
    typeof editor.rotateController.reposition === 'function'
  );
}

export class SelectCommonTool implements Tool {
  constructor(editor: IToolContext, ...args: unknown[]) {
    if (!supportsSelectionTools(editor)) {
      throw new Error('Selection tool context is incomplete');
    }
    const mode = args[0] ?? 'rectangle';
    if (mode !== 'lasso' && mode !== 'fragment' && mode !== 'rectangle') {
      throw new Error('Unknown selection mode');
    }

    return createSelectTool(editor, mode);
  }
}
