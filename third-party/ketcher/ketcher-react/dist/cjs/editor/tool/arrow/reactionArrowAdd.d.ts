import { type RxnArrowMode } from 'ketcher-core';
import type { ArrowAddTool } from './arrow.types';
import type { ArrowToolContext } from './arrowTool';
export declare class ReactionArrowAddTool implements ArrowAddTool {
    private readonly editor;
    private readonly mode;
    static readonly MIN_LENGTH = 0.5;
    static readonly DEFAULT_LENGTH = 1;
    private dragCtx;
    constructor(editor: ArrowToolContext, mode: RxnArrowMode);
    private get render();
    private get reStruct();
    mousedown(event: MouseEvent): void;
    mousemove(event: MouseEvent): void;
    mouseup(event: MouseEvent): void;
    private getArrowWithMinimalLengthEnd;
    private addNewArrowWithDragging;
    private addNewArrowWithClicking;
    private updateResizingState;
}
