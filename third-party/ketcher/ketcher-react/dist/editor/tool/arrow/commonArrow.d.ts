import type { Tool } from '../Tool';
import { type RxnArrowMode, MULTITAIL_ARROW_TOOL_NAME } from 'ketcher-core';
import type { CommonArrowDragContext, MultitailArrowClosestItem, ReactionArrowClosestItem } from './arrow.types';
import { ArrowTool, type ArrowToolContext } from './arrowTool';
export declare class CommonArrowTool extends ArrowTool implements Tool {
    static isDragContextMultitail(dragContext: CommonArrowDragContext<MultitailArrowClosestItem | ReactionArrowClosestItem>): dragContext is CommonArrowDragContext<MultitailArrowClosestItem>;
    static isDragContextReaction(dragContext: CommonArrowDragContext<MultitailArrowClosestItem | ReactionArrowClosestItem>): dragContext is CommonArrowDragContext<ReactionArrowClosestItem>;
    private dragContext;
    private readonly addTool;
    private readonly multitailMoveTool;
    private readonly reactionMoveTool;
    constructor(editor: ArrowToolContext, mode: RxnArrowMode | typeof MULTITAIL_ARROW_TOOL_NAME);
    mousedown(event: PointerEvent): void;
    mousemove(event: PointerEvent): void;
    mouseup(event: PointerEvent): void;
}
