import type { Render } from '../raphaelRender';
import type { ViewBox } from '../render.types';
import type { RaphaelElement, RaphaelRectAttr } from './types';
export declare abstract class Scrollbar {
    protected bar: RaphaelElement | null;
    protected render: Render;
    protected viewBoxBeforeDrag: ViewBox | null;
    protected MIN_LENGTH: number;
    protected RADIUS: number;
    protected MARGIN: number;
    protected WIDTH: number;
    protected DIST_TO_EDGE: number;
    protected COLOR: string;
    protected constructor(render: Render);
    destroy(): void;
    update(): void;
    protected redraw(): RaphaelElement;
    protected updateAttr(): RaphaelElement;
    protected hide(): null;
    protected draw(): RaphaelElement;
    protected onDragStart(_x: number, _y: number, event: MouseEvent): void;
    protected onDragEnd(event: MouseEvent): void;
    abstract hasOffset(): boolean;
    abstract getDynamicAttr(): RaphaelRectAttr;
    abstract onDragMove(dx: number, dy: number, x: number, y: number, event: MouseEvent): void;
}
