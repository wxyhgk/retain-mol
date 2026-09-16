import type { CoreEditor } from '../../editor/Editor';
import type { BaseTool } from '../../editor/tools/Tool';
export declare class HandTool implements BaseTool {
    private readonly editor;
    private readonly dragBehavior;
    constructor(editor: CoreEditor);
    private handleDragStart;
    private handleDragging;
    private handleDragEnd;
    destroy(): void;
}
