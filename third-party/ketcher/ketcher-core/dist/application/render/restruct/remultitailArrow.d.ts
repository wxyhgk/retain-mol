import ReObject from './reobject';
import { MultitailArrow } from '../../../domain/entities/multitailArrow';
import type { Render } from '../raphaelRender';
import type ReStruct from './restruct';
import type { RenderOptions } from '../../render/render.types';
import { PathBuilder } from '../../render/pathBuilder';
import { Vec2 } from '../../../domain/entities/vec2';
import type { RaphaelPaper } from 'raphael';
export declare enum MultitailArrowRefName {
    HEAD = "head",
    TAILS = "tails",
    TOP_TAIL = "topTail",
    BOTTOM_TAIL = "bottomTail",
    SPINE = "spine"
}
export interface MultitailArrowReferencePosition {
    name: MultitailArrowRefName;
    isLine: boolean;
    tailId: number | null;
}
export interface MultitailArrowClosestReferencePosition {
    distance: number;
    ref: MultitailArrowReferencePosition | null;
}
export declare class ReMultitailArrow extends ReObject {
    multitailArrow: MultitailArrow;
    static readonly CUBIC_BEZIER_OFFSET = 6;
    static readonly FRAME_OFFSET = 0.175;
    static readonly SELECTION_POINT_OFFSET_FROM_SPINE = 0.1;
    static readonly SPINE_MOVE_POINT_X_OFFSET = -1;
    static readonly HEAD_LINE_START_OFFSET = 1;
    static readonly SELECTION_POINT_RADIUS = 1;
    static readonly HIDDEN_SELECTION_POINT_OPACITY = 0;
    static readonly VISIBLE_SELECTION_POINT_OPACITY = 1;
    private testSelectionPoints;
    static isSelectable(): boolean;
    static getTailIdFromRefName(name: string): number | null;
    constructor(multitailArrow: MultitailArrow);
    getFrameOffset(options: RenderOptions): number;
    getSelectionPointOffset(options: RenderOptions): number;
    getReferencePositions(renderOptions: RenderOptions): ReturnType<MultitailArrow['getReferencePositions']>;
    getReferenceLines(renderOptions: RenderOptions, referencePositions?: import("../../../domain/entities/multitailArrow").MultitailArrowsReferencePositions): import("../../../domain/entities/multitailArrow").MultitailArrowsReferenceLines;
    static drawSingleLineHover(builder: PathBuilder, offset: number, lineStart: Vec2, lineEnd: Vec2, verticalDirection: -1 | 1, horizontalDirection: -1 | 1): void;
    buildFrame(renderOptions: RenderOptions): string;
    drawHover(render: Render): any;
    getSelectionPointsFromReferencePoint(point: Vec2, topSpine: Vec2, name: string, spineOffset: number): {
        [x: string]: Vec2;
    };
    addTestSelectionPoints(reStruct: ReStruct, paper: RaphaelPaper, renderOptions: RenderOptions): void;
    makeSelectionPlate(reStruct: ReStruct, paper: RaphaelPaper, options: RenderOptions): any;
    show(reStruct: ReStruct, renderOptions: RenderOptions): void;
    showPoints(): void;
    hidePoints(): void;
    private getClosestArrowPartPosition;
    private getTailArrayFromPool;
    calculateDistanceToPoint(point: Vec2, renderOptions: RenderOptions, maxDistanceToPoint: number): MultitailArrowClosestReferencePosition;
}
