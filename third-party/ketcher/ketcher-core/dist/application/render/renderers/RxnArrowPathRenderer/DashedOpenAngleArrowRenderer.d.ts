import type { Vec2 } from '../../../../domain/entities/vec2';
export declare class DashedOpenAngleArrowRenderer {
    static preparePaths(start: Vec2, arrowLength: number, arrowAngle: number): {
        d: string;
        attrs: {
            fill: string;
        };
    }[];
}
