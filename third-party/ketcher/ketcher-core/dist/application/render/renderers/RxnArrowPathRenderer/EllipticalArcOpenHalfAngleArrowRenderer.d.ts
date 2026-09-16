import type { Vec2 } from '../../../../domain/entities/vec2';
export declare class EllipticalArcOpenHalfAngleArrowRenderer {
    static preparePaths(start: Vec2, arrowLength: number, arrowAngle: number, height: number): {
        d: string;
        attrs: {};
    }[];
}
