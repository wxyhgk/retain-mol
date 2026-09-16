import type { Tool } from '../Tool';
import type { SelectMode } from './select.types';
import type { SelectionStateContext } from './selectionToolContext';
export declare class SelectViewOnlyTool implements Tool {
    private readonly editor;
    private readonly mode;
    private readonly lassoHelper;
    constructor(editor: SelectionStateContext, mode: SelectMode);
    isSelectionRunning(): boolean;
    mousedown(event: PointerEvent): void;
    mousemove(event: PointerEvent): void;
    mouseup(event: PointerEvent): void;
    mouseleave(): void;
}
