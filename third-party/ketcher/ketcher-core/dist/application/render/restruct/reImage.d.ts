import ReObject from './reobject';
import type ReStruct from './restruct';
import type { RaphaelPath } from './raphaelTypes';
import type { Image, ImageReferencePositionInfo } from '../../../domain/entities/image';
import type { RenderOptions } from '../../render/render.types';
import type { RaphaelPaper } from 'raphael';
import { Box2Abs } from '../../../domain/entities/box2Abs';
import { Vec2 } from '../../../domain/entities/vec2';
import type { Render } from '../../render/raphaelRender';
interface ClosestReferencePosition {
    distance: number;
    ref: ImageReferencePositionInfo | null;
}
export declare class ReImage extends ReObject {
    image: Image;
    private selectionPointsSet;
    private selectionHitTargetsSet;
    private setSelectionPointsVisibility;
    static isSelectable(): boolean;
    constructor(image: Image);
    private getScaledPointWithOffset;
    private getScale;
    private getDimensions;
    private getSelectionReferencePositions;
    private drawSelectionLine;
    private drawSelectionPoints;
    show(restruct: ReStruct, renderOptions: RenderOptions, nextPath?: RaphaelPath): void;
    drawHover(render: Render): any[];
    makeSelectionPlate(_reStruct: ReStruct, paper: RaphaelPaper, options: RenderOptions): RaphaelSet;
    getVBoxObj(): Box2Abs | null;
    showPoints(): void;
    hidePoints(): void;
    calculateDistanceToPoint(point: Vec2, renderOptions: RenderOptions): number;
    calculateClosestReferencePosition(point: Vec2, renderOptions: RenderOptions): ClosestReferencePosition;
    isPointInsidePolygon(point: Vec2, renderOptions: RenderOptions): boolean;
}
export {};
