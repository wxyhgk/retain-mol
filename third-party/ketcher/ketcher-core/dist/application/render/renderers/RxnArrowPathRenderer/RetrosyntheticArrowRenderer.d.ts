import type { Vec2 } from '../../../../domain/entities/vec2';
export declare class RetrosyntheticArrowRenderer {
    static preparePaths(start: Vec2, arrowLength: number, arrowAngle: number): {
        d: string;
        attrs: {};
    }[];
}
