import type { Render } from '../raphaelRender';
import type { ScrollOffset } from './scroll-offset';
import { Scrollbar } from './scrollbar';
import type { RaphaelRectAttr } from './types';
export declare class VerticalScrollbar extends Scrollbar {
    #private;
    constructor(render: Render, scrollOffset: ScrollOffset);
    hasOffset(): boolean;
    getDynamicAttr(): RaphaelRectAttr;
    onDragMove(_dx: number, dy: number, _x: number, _y: number, _event: MouseEvent): void;
}
