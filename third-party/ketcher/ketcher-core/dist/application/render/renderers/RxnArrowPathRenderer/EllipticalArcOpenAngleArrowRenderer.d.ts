import type { Vec2 } from '../../../../domain/entities/vec2';
export declare class EllipticalArcOpenAngleArrowRenderer {
    static preparePaths(start: Vec2, arrowLength: number, arrowAngle: number, height: number): {
        d: string;
        attrs: {};
    }[];
}
