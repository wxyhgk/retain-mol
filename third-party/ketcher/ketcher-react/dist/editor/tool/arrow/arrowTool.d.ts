import { type Vec2 } from 'ketcher-core';
import type { IToolContext } from '../IToolContext';
export type ArrowToolContext = Pick<IToolContext, 'render' | 'selection' | 'findItem' | 'hover' | 'update'>;
export declare abstract class ArrowTool {
    protected readonly editor: ArrowToolContext;
    constructor(editor: ArrowToolContext);
    protected get render(): import("ketcher-core").Render;
    protected get reStruct(): import("ketcher-core").ReStruct;
    protected getOffset(event: PointerEvent, original: Vec2): Vec2;
}
