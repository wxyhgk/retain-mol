import { BaseMicromoleculeEntity } from '../entities/BaseMicromoleculeEntity';
import { Vec2 } from '../entities/vec2';
import { Pool } from '../entities/pool';
import type { KetFileNode } from '../serializers/serializers.types';
import { FixedPrecisionCoordinates } from '../entities/fixedPrecision';
export type Line = [Vec2, Vec2];
export interface MultitailArrowsReferencePositions {
    head: Vec2;
    topTail: Vec2;
    bottomTail: Vec2;
    topSpine: Vec2;
    bottomSpine: Vec2;
    tails: Pool<Vec2>;
}
export type MultitailArrowReferencePositionsNames = keyof MultitailArrowsReferencePositions;
export interface MultitailArrowsReferenceLines {
    head: Line;
    topTail: Line;
    bottomTail: Line;
    spine: Line;
    tails: Pool<Line>;
}
export type MultitailArrowReferenceLinesNames = keyof MultitailArrowsReferenceLines;
export interface KetFileMultitailArrowNode {
    head: {
        position: Vec2;
    };
    spine: {
        pos: [Vec2, Vec2];
    };
    tails: {
        pos: Array<Vec2>;
    };
    zOrder: 0;
}
interface TailDistance {
    distance: number;
    center: number;
}
export declare class MultitailArrow extends BaseMicromoleculeEntity {
    private spineTopX;
    private spineTopY;
    private height;
    private headOffsetX;
    private headOffsetY;
    private tailLength;
    private tailsYOffset;
    static readonly KET_MIN_DISTANCE: FixedPrecisionCoordinates;
    static readonly MIN_TAIL_DISTANCE: FixedPrecisionCoordinates;
    static readonly MIN_HEAD_LENGTH: FixedPrecisionCoordinates;
    static readonly MIN_TAIL_LENGTH: FixedPrecisionCoordinates;
    static readonly MIN_TOP_BOTTOM_OFFSET: FixedPrecisionCoordinates;
    static readonly MIN_HEIGHT: FixedPrecisionCoordinates;
    static readonly TOP_TAIL_NAME = "topTail";
    static readonly BOTTOM_TAIL_NAME = "bottomTail";
    static readonly TAILS_NAME = "tails";
    arrowId?: number;
    static canAddTail(distance: TailDistance['distance']): boolean;
    static fromTwoPoints(topLeft: Vec2, bottomRight: Vec2): MultitailArrow;
    static validateKetNode(ketFileData: KetFileMultitailArrowNode): string | null;
    static getConstructorParamsFromKetNode(ketFileNode: KetFileNode<KetFileMultitailArrowNode>): {
        spineTopX: FixedPrecisionCoordinates;
        spineTopY: FixedPrecisionCoordinates;
        height: FixedPrecisionCoordinates;
        headOffsetX: FixedPrecisionCoordinates;
        headOffsetY: FixedPrecisionCoordinates;
        tailsLength: FixedPrecisionCoordinates;
        tailsYOffset: Pool<FixedPrecisionCoordinates>;
    };
    static fromKetNode(ketFileNode: KetFileNode<KetFileMultitailArrowNode>): MultitailArrow;
    static fromFloatingPointCoordinates(spineTop: Vec2, height: number, headOffset: Vec2, tailLength: number, tailsYOffset: Pool<number>): MultitailArrow;
    constructor(spineTopX: FixedPrecisionCoordinates, spineTopY: FixedPrecisionCoordinates, height: FixedPrecisionCoordinates, headOffsetX: FixedPrecisionCoordinates, headOffsetY: FixedPrecisionCoordinates, tailLength: FixedPrecisionCoordinates, tailsYOffset: Pool<FixedPrecisionCoordinates>, arrowId?: number);
    static getReferencePositions(spineTopX: FixedPrecisionCoordinates, spineTopY: FixedPrecisionCoordinates, height: FixedPrecisionCoordinates, headOffsetX: FixedPrecisionCoordinates, headOffsetY: FixedPrecisionCoordinates, tailLength: FixedPrecisionCoordinates, tailsYOffset: Pool<FixedPrecisionCoordinates>): {
        head: Vec2;
        topTail: Vec2;
        bottomTail: Vec2;
        topSpine: Vec2;
        bottomSpine: Vec2;
        tails: Pool<Vec2>;
    };
    getReferencePositions(): MultitailArrowsReferencePositions;
    getReferencePositionsArray(): Array<Vec2>;
    getReferenceLines(referencePositions: MultitailArrowsReferencePositions): MultitailArrowsReferenceLines;
    getTailsDistance(tailsYOffsets: Array<FixedPrecisionCoordinates>): Array<TailDistance>;
    getTailsMaxDistance(): TailDistance;
    getTailCoordinate(id: number): FixedPrecisionCoordinates | undefined;
    addTail(id?: number, coordinate?: FixedPrecisionCoordinates): number;
    removeTail(id: number): void;
    center(): Vec2;
    clone(): MultitailArrow;
    rescaleSize(scale: number): void;
    resizeHead(offset: number): number;
    moveHead(offset: number): number;
    resizeTails(offset: number): number;
    normalizeTailPosition(proposedPosition: FixedPrecisionCoordinates, tailId: number): FixedPrecisionCoordinates | null;
    moveTail(offset: number, id: number, normalize?: true): number;
    moveTail(offset: number, name: typeof MultitailArrow.TOP_TAIL_NAME | typeof MultitailArrow.BOTTOM_TAIL_NAME): number;
    move(offset: Vec2): void;
    static getParametersForKetNode(spineTopX: FixedPrecisionCoordinates, spineTopY: FixedPrecisionCoordinates, headOffsetX: FixedPrecisionCoordinates, headOffsetY: FixedPrecisionCoordinates, tailLength: FixedPrecisionCoordinates, tailsYOffset: Pool<FixedPrecisionCoordinates>, height: FixedPrecisionCoordinates, center: Vec2, isInitiallySelected?: boolean): {
        type: string;
        center: Vec2;
        selected: boolean | undefined;
        data: {
            head: {
                position: Vec2;
            };
            spine: {
                pos: [Vec2, Vec2];
            };
            tails: {
                pos: Vec2[];
            };
            zOrder: 0;
        };
    };
    toKetNode(): KetFileNode<KetFileMultitailArrowNode>;
}
export {};
