import {
  type Action,
  type EditorDocumentChangeReason,
  Coordinates,
  Scale,
  type Struct,
  Vec2,
  fromMultipleMove,
  type ReStruct,
  type Render,
} from 'ketcher-core';

import { getSelectionMap, getStructCenter } from '../utils/structLayout';
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
export class ViewManager implements IView {
  private clientAreaObserver: ResizeObserver | null = null;
  constructor(
    private readonly adapter: RenderAdapter,
    private readonly deps: ViewManagerDeps,
  ) {
    this.observeClientAreaResize();
  }

  setRender(render: Render): void {
    const wasObserving = this.clientAreaObserver !== null;
    if (wasObserving) this.unobserveClientAreaResize();
    this.adapter.setRender(render);
    if (wasObserving) this.observeClientAreaResize();
  }

  observeClientAreaResize(): void {
    this.unobserveClientAreaResize();
    const area = this.adapter.clientArea;
    if (!area || typeof ResizeObserver === 'undefined') return;
    this.syncViewBoxToClientArea();
    this.clientAreaObserver = new ResizeObserver(() =>
      this.syncViewBoxToClientArea(),
    );
    this.clientAreaObserver.observe(area);
  }

  unobserveClientAreaResize(): void {
    this.clientAreaObserver?.disconnect();
    this.clientAreaObserver = null;
  }

  syncViewBoxToClientArea(): void {
    const area = this.adapter.clientArea;
    if (!area || area.clientWidth === 0 || area.clientHeight === 0) return;
    this.adapter.resizeViewBox();
  }

  zoom(value?: number, event?: WheelEvent): number {
    if (value === undefined || this.adapter.options.zoom === value)
      return this.adapter.options.zoom;
    this.adapter.setZoom(value, event);
    this.adapter.update();
    this.deps.rerenderRotateController();
    return this.adapter.options.zoom;
  }

  centerStruct(): void {
    const structure = this.adapter.ctab;
    const structCenter = getStructCenter(structure);
    const viewBoxCenter = new Vec2(
      this.adapter.viewBox.minX + this.adapter.viewBox.width / 2,
      this.adapter.viewBox.minY + this.adapter.viewBox.height / 2,
    );
    const viewBoxCenterInProto = Scale.canvasToModel(
      viewBoxCenter,
      this.adapter.options,
    );
    const shiftVector = viewBoxCenterInProto.sub(structCenter);
    const structureToMove = getSelectionMap(structure);
    const action = fromMultipleMove(structure, structureToMove, shiftVector);
    if (!action.isDummy(structure)) {
      this.deps.notifyDocumentChange?.('untracked');
    }
    this.deps.update(action, true);
  }

  centerViewportAccordingToStruct(struct?: Struct): void {
    const targetStruct = struct ?? this.deps.getStruct();
    const isFitMinZoom = this.zoomAccordingContent(targetStruct);
    const structBbox = targetStruct.getCoordBoundingBox();
    const newScrollCoordinates = Coordinates.modelToCanvas(
      isFitMinZoom
        ? new Vec2(
            structBbox.min.x + (structBbox.max.x - structBbox.min.x) / 2,
            structBbox.min.y + (structBbox.max.y - structBbox.min.y) / 2,
          )
        : new Vec2(structBbox.min.x, structBbox.min.y),
    ).sub(
      new Vec2(this.adapter.viewBox.width / 2, this.adapter.viewBox.height / 2),
    );
    this.adapter.setViewBox((viewBox) => ({
      ...viewBox,
      minX: newScrollCoordinates.x,
      minY: newScrollCoordinates.y,
    }));
  }

  positionStruct(x: number, y: number): void {
    const struct = this.deps.getStruct();
    const reStruct = this.adapter.ctab;
    const structBbox = struct.getCoordBoundingBox();
    const shiftVector = new Vec2(x, y).sub(structBbox.min);
    const structureToMove = getSelectionMap(reStruct);
    const action = fromMultipleMove(reStruct, structureToMove, shiftVector);
    if (!action.isDummy(reStruct)) {
      this.deps.notifyDocumentChange?.('untracked');
    }
    this.deps.update(action, true);
    this.centerViewportAccordingToStruct();
  }

  zoomAccordingContent(struct: Struct): boolean {
    this.syncViewBoxToClientArea();
    const MIN_ZOOM_VALUE = 0.1;
    const MAX_ZOOM_VALUE = 1;
    const MARGIN_IN_PIXELS = 60;
    const parsedStructCoordBoundingBox = struct.getCoordBoundingBox();
    const parsedStructSize = new Vec2(
      parsedStructCoordBoundingBox.max.x - parsedStructCoordBoundingBox.min.x,
      parsedStructCoordBoundingBox.max.y - parsedStructCoordBoundingBox.min.y,
    );
    const parsedStructSizeInPixels = {
      width:
        parsedStructSize.x *
        this.adapter.options.microModeScale *
        this.adapter.options.zoom,
      height:
        parsedStructSize.y *
        this.adapter.options.microModeScale *
        this.adapter.options.zoom,
    };
    const clientAreaBoundingBox =
      this.adapter.clientArea.getBoundingClientRect();
    if (
      parsedStructSizeInPixels.width + MARGIN_IN_PIXELS <
        clientAreaBoundingBox.width &&
      parsedStructSizeInPixels.height + MARGIN_IN_PIXELS <
        clientAreaBoundingBox.height
    )
      return true;
    let newZoomValue =
      this.adapter.options.zoom /
      (parsedStructSizeInPixels.height - clientAreaBoundingBox.height >
      parsedStructSizeInPixels.width - clientAreaBoundingBox.width
        ? parsedStructSizeInPixels.height / clientAreaBoundingBox.height
        : parsedStructSizeInPixels.width / clientAreaBoundingBox.width);
    if (newZoomValue >= MAX_ZOOM_VALUE) {
      this.zoom(MAX_ZOOM_VALUE);
      return true;
    }
    newZoomValue -= MARGIN_IN_PIXELS / clientAreaBoundingBox.width;
    this.zoom(
      newZoomValue < MIN_ZOOM_VALUE
        ? MIN_ZOOM_VALUE
        : Number(newZoomValue.toFixed(2)),
    );
    this.deps.dispatchZoomChanged();
    return newZoomValue > MIN_ZOOM_VALUE;
  }
}
