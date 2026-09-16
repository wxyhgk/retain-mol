import type {
  Render,
  Vec2,
  ReStruct,
  RenderOptions,
  ViewBox,
} from 'ketcher-core';
export class RenderAdapter {
  constructor(private _render: Render) {}
  get raw(): Render {
    return this._render;
  }

  setRender(render: Render): void {
    this._render = render;
  }

  get ctab(): ReStruct {
    return this._render.ctab;
  }

  get options(): RenderOptions {
    return this._render.options;
  }

  get viewBox(): ViewBox {
    return this._render.viewBox;
  }

  get clientArea(): HTMLElement {
    return this._render.clientArea;
  }

  get sz(): Vec2 {
    return this._render.sz;
  }

  setZoom(value: number, event?: WheelEvent): void {
    this._render.setZoom(value, event);
  }

  setViewBox(arg: ViewBox | ((viewBox: ViewBox) => ViewBox)): void {
    this._render.setViewBox(arg as never);
  }

  update(force?: boolean, viewSz?: Vec2 | null): void {
    this._render.update(force ?? false, viewSz ?? null);
  }

  resizeViewBox(): void {
    this._render.resizeViewBox();
  }

  observeCanvasResize(): void {
    this._render.observeCanvasResize();
  }

  unobserveCanvasResize(): void {
    this._render.unobserveCanvasResize();
  }
}
