import type { Vec2 } from '../../../../domain/entities/vec2';
import type { HalfEdge } from '../../../render/view-model/HalfEdge';
export type SVGPathAttributes = {
    d: string;
    attrs: Record<string, string | number>;
};
export type BondVectors = {
    startPosition: Vec2;
    endPosition: Vec2;
    firstHalfEdge: HalfEdge;
    secondHalfEdge: HalfEdge;
};
export declare const BondWidth = 2;
export declare const StereoBondWidth = 6;
export declare const BondSpace = 6;
export declare const LinesOffset: number;
export declare const BondDashArrayMap: {
    4: string;
    5: string;
    6: string;
    7: string;
    8: string;
    10: string;
};
