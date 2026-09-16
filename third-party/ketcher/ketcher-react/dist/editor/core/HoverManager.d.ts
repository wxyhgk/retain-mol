import { type Render } from 'ketcher-core';
import { type FunctionalGroupsTooltipContext } from '../utils/functionalGroupsTooltip';
import type { HoverTarget, Tool } from '../tool/Tool';
export interface IHoverManager {
    hover(ci: HoverTarget | null, newTool?: Tool | null, event?: PointerEvent): void;
}
interface HoverManagerContext extends FunctionalGroupsTooltipContext {
    render: Render;
    _tool: Tool | null;
}
export declare class HoverManager implements IHoverManager {
    private readonly editor;
    constructor(editor: HoverManagerContext);
    private getHoverId;
    hover(ci: HoverTarget | null, newTool?: Tool | null, event?: PointerEvent): void;
}
export {};
