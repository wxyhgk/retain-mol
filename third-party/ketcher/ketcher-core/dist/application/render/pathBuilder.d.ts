import { Vec2 } from '../../domain/entities/vec2';
interface Point2D {
    x: number;
    y: number;
}
export declare class PathBuilder {
    static generatePoint(point: Point2D): string;
    private pathParts;
    constructor(initialPath?: string);
    addMovement(to: Point2D): this;
    addLine(to: Point2D, from?: Point2D): this;
    addClosedLine(to: Point2D, from?: Point2D): this;
    addQuadraticBezierCurve(control: Point2D, to: Point2D): this;
    addPathParts(pathParts: Array<string>): this;
    addOpenArrowPathParts(start: Vec2, arrowLength: number, tipXOffset?: number, tipYOffset?: number): this;
    addFilledTriangleArrowPathParts(start: Vec2, arrowLength: number, triangleLength?: number, triangleWidth?: number): this;
    addMultitailArrowBase(topY: number, bottomY: number, spineX: number, tailLength: number, cubicBezierOffset?: number): this;
    build(): string;
}
export {};
