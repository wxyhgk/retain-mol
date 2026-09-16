import type { Tool } from '../Tool';
import LassoHelper from '../helper/lasso';
import type { SelectMode } from './select.types';
import type { SelectionStateContext } from './selectionToolContext';
import {
  onSelectionEnd,
  onSelectionLeave,
  onSelectionMove,
  onSelectionStart,
} from './select.helpers';

export class SelectViewOnlyTool implements Tool {
  private readonly lassoHelper: LassoHelper;
  constructor(
    private readonly editor: SelectionStateContext,
    private readonly mode: SelectMode,
  ) {
    this.lassoHelper = new LassoHelper(
      this.mode === 'lasso' ? 0 : 1,
      editor,
      this.mode === 'fragment',
    );
  }

  isSelectionRunning() {
    return this.lassoHelper.running();
  }

  mousedown(event: PointerEvent) {
    onSelectionStart(event, this.editor, this.lassoHelper);
  }

  mousemove(event: PointerEvent) {
    onSelectionMove(event, this.editor, this.lassoHelper);
  }

  mouseup(event: PointerEvent) {
    onSelectionEnd(event, this.editor, this.lassoHelper);
  }

  mouseleave() {
    onSelectionLeave(this.editor, this.lassoHelper);
  }
}
