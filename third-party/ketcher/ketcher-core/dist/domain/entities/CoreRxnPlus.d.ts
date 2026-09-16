import { DrawingEntity } from '../entities/DrawingEntity';
import type { Vec2 } from '../entities/vec2';
import type { RxnPlusRenderer } from '../../application/render/renderers/RxnPlusRenderer';
import type { initiallySelectedType } from '../entities/BaseMicromoleculeEntity';
export declare class RxnPlus extends DrawingEntity {
    initiallySelected?: initiallySelectedType | undefined;
    renderer?: RxnPlusRenderer;
    constructor(position: Vec2, initiallySelected?: initiallySelectedType | undefined);
    get center(): Vec2;
    setRenderer(renderer: RxnPlusRenderer): void;
}
