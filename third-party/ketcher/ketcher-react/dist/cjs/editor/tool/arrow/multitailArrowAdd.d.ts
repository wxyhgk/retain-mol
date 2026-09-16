import type { ArrowAddTool } from './arrow.types';
import type { ArrowToolContext } from './arrowTool';
export declare class MultitailArrowAddTool implements ArrowAddTool {
    private readonly editor;
    static readonly MIN_HEIGHT = 2.5;
    static readonly MIN_WIDTH = 1.2;
    constructor(editor: ArrowToolContext);
    private get render();
    private get reStruct();
    mousedown(): void;
    mousemove(): void;
    mouseup(event: MouseEvent): void;
    private getArrowWithMinimalSizeEnd;
}
