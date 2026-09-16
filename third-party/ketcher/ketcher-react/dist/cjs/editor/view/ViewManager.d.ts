import { type Action, type EditorDocumentChangeReason, type Struct, type ReStruct, type Render } from 'ketcher-core';
import type { RenderAdapter } from './RenderAdapter';
export interface IView {
    zoom(value?: number, event?: WheelEvent): number;
    centerStruct(): void;
    centerViewportAccordingToStruct(struct?: Struct): void;
    positionStruct(x: number, y: number): void;
    zoomAccordingContent(struct: Struct): boolean;
    setRender(render: Render): void;
    observeClientAreaResize(): void;
    unobserveClientAreaResize(): void;
    syncViewBoxToClientArea(): void;
}
export interface ViewManagerDeps {
    getCtab: () => ReStruct;
    getStruct: () => Struct;
    update: (action: Action, ignoreHistory?: boolean) => void;
    rerenderRotateController: () => void;
    dispatchZoomChanged: () => void;
    notifyDocumentChange?: (reason: EditorDocumentChangeReason) => void;
}
export declare class ViewManager implements IView {
    private readonly adapter;
    private readonly deps;
    private clientAreaObserver;
    constructor(adapter: RenderAdapter, deps: ViewManagerDeps);
    setRender(render: Render): void;
    observeClientAreaResize(): void;
    unobserveClientAreaResize(): void;
    syncViewBoxToClientArea(): void;
    zoom(value?: number, event?: WheelEvent): number;
    centerStruct(): void;
    centerViewportAccordingToStruct(struct?: Struct): void;
    positionStruct(x: number, y: number): void;
    zoomAccordingContent(struct: Struct): boolean;
}
