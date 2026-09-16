import type { Render, Vec2, ReStruct, RenderOptions, ViewBox } from 'ketcher-core';
export declare class RenderAdapter {
    private _render;
    constructor(_render: Render);
    get raw(): Render;
    setRender(render: Render): void;
    get ctab(): ReStruct;
    get options(): RenderOptions;
    get viewBox(): ViewBox;
    get clientArea(): HTMLElement;
    get sz(): Vec2;
    setZoom(value: number, event?: WheelEvent): void;
    setViewBox(arg: ViewBox | ((viewBox: ViewBox) => ViewBox)): void;
    update(force?: boolean, viewSz?: Vec2 | null): void;
    resizeViewBox(): void;
    observeCanvasResize(): void;
    unobserveCanvasResize(): void;
}
