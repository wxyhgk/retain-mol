import { Vec2 } from '../entities/vec2';
import type { BaseRenderer } from '../../application/render/renderers/BaseRenderer';
export interface DrawingEntityConfig {
    generateId: boolean;
}
export declare abstract class DrawingEntity {
    private _position;
    private readonly config;
    selected: boolean;
    hovered: boolean;
    id: number;
    baseRenderer?: BaseRenderer;
    protected constructor(_position?: Vec2, config?: DrawingEntityConfig);
    moveRelative(position: Vec2): void;
    moveAbsolute(position: Vec2): void;
    get position(): Vec2;
    turnOnHover(): void;
    turnOffHover(): void;
    turnOnSelection(): void;
    turnOffSelection(): void;
    abstract get center(): Vec2;
    selectIfLocatedInRectangle(rectangleTopLeftPoint: Vec2, rectangleBottomRightPoint: Vec2, isPreviousSelected?: boolean, shiftKey?: boolean): boolean;
    selectIfLocatedInPolygon(polygonPoints: Vec2[], isPreviousSelected?: boolean, shiftKey?: boolean): boolean;
    private isPointInPolygon;
    setBaseRenderer(renderer: BaseRenderer): void;
}
