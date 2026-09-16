import type { SGroupRenderer } from '../../application/render/renderers/SGroupRenderer';
import type { BaseMonomer } from '../entities/BaseMonomer';
import { DrawingEntity } from '../entities/DrawingEntity';
import type { SGroup } from '../entities/sgroup';
import { Vec2 } from '../entities/vec2';
export declare class SGroupDrawingEntity extends DrawingEntity {
    readonly sgroup: SGroup;
    readonly monomer: BaseMonomer;
    readonly sgroupIdInMicroMode: number;
    renderer?: SGroupRenderer;
    constructor(sgroup: SGroup, monomer: BaseMonomer, sgroupIdInMicroMode: number);
    get center(): Vec2;
    setRenderer(renderer: SGroupRenderer): void;
    private static getCenter;
}
