/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/
import { ZoomTransform } from 'd3';
import type { BaseTool } from '../../editor/tools/Tool';
import type { D3SvgElementSelection } from '../../render/types';
import { Vec2 } from '../../../domain/entities/vec2';
import type { DrawingEntitiesManager } from '../../../domain/entities/DrawingEntitiesManager';
import type { StructureBbox } from '../../render/renderers/types';
export declare enum SCROLL_POSITION {
    CENTER = "CENTER",
    BOTTOM = "BOTTOM"
}
interface ScrollBar {
    name: string;
    offsetStart: number;
    offsetEnd: number;
    maxWidth: number;
    maxHeight: number;
    bar?: D3SvgElementSelection<SVGRectElement, void>;
}
export declare class ZoomTool implements BaseTool {
    canvas: D3SvgElementSelection<SVGGElement, void>;
    canvasWrapper: D3SvgElementSelection<SVGSVGElement, void>;
    private zoom;
    private zoomLevel;
    private _zoomTransform;
    private resizeObserver;
    drawingEntitiesManager: DrawingEntitiesManager;
    private zoomEventHandlers;
    private scrollBars;
    COLOR: string;
    MIN_LENGTH: number;
    RADIUS: number;
    MARGIN: number;
    HORIZONTAL_DIST_TO_EDGE: number;
    VERTICAL_DIST_TO_EDGE: number;
    WIDTH: number;
    MINZOOMSCALE: number;
    MAXZOOMSCALE: number;
    private static _instance;
    private static _renderingContext;
    static get instance(): ZoomTool;
    static setRenderingContext(zoomTool: ZoomTool | undefined): void;
    static initInstance(drawingEntitiesManager: DrawingEntitiesManager, canvas?: SVGSVGElement): ZoomTool;
    private constructor();
    initActions(): void;
    setZoomLevel(zoomLevel: number): void;
    getZoomLevel(): number;
    setZoomTransform(transform: ZoomTransform): void;
    get zoomTransform(): ZoomTransform;
    zoomAction({ transform }: {
        transform: any;
    }): void;
    subscribeOnZoomEvent(zoomEventHandler: (transform?: ZoomTransform) => void): void;
    unsubscribeOnZoomEvent(zoomEventHandler: (transform?: ZoomTransform) => void): void;
    dispatchZoomEventHandlers(transform: ZoomTransform): void;
    drawScrollBars(forceHide?: boolean): void;
    renderScrollBar(scrollBar: ScrollBar, forceHide?: boolean): void;
    drawScrollBar(scrollBar: ScrollBar): void;
    updateScrollBarAttrs(scrollBar: ScrollBar): void;
    calculateDynamicAttr(scrollBar: ScrollBar): {
        start: number;
        length: number;
    };
    dragged: (name: string) => (event: any) => void;
    scrollTo(position: Vec2, stickToBottom?: boolean, xOffset?: any, yOffset?: any, isOffsetInPercents?: boolean, needScrollVertical?: boolean): void;
    scrollBy(x: number, y: number): void;
    scrollToVerticalCenter(structCenterY: number): void;
    scrollToVerticalBottom(): void;
    mouseWheeled(event: any): void;
    initScrollBars(): void;
    private get zoomStep();
    zoomIn(zoomStep?: number): void;
    zoomOut(zoomStep?: number): void;
    zoomToLeftTopCorner(_newZoomLevel: number): void;
    zoomTo(zoomLevel: number): void;
    resetZoom(): void;
    observeCanvasResize: () => void;
    defaultWheelDelta(event: any): number;
    scaleCoordinates(position: Vec2): Vec2;
    invertZoom(position: Vec2): Vec2;
    unzoomValue(value: number): number;
    zoomValue(value: number): number;
    destroy(): void;
    isFitToCanvasHeight(height: any): boolean;
    zoomStructureToFitHalfOfCanvas(structureBbox: StructureBbox): void;
    get canvasWrapperHeight(): number;
    get canvasWrapperWidth(): number;
    get canvasWrapperSize(): {
        width: number;
        height: number;
    };
}
export default ZoomTool;
