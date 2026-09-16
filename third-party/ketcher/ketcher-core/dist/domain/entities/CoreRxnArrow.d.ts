import { DrawingEntity } from '../entities/DrawingEntity';
import type { RxnArrowMode } from '../entities/rxnArrow';
import { Vec2 } from '../entities/vec2';
import type { RxnArrowRenderer } from '../../application/render/renderers/RxnArrowRenderer';
import type { initiallySelectedType } from '../entities/BaseMicromoleculeEntity';
export declare class RxnArrow extends DrawingEntity {
    type: RxnArrowMode;
    startEndPosition: [Vec2, Vec2];
    height?: number | undefined;
    initiallySelected?: initiallySelectedType | undefined;
    renderer?: RxnArrowRenderer;
    arrowId?: number;
    constructor(type: RxnArrowMode, startEndPosition: [Vec2, Vec2], height?: number | undefined, initiallySelected?: initiallySelectedType | undefined);
    get startPosition(): Vec2;
    private set startPosition(value);
    get endPosition(): Vec2;
    private set endPosition(value);
    get center(): Vec2;
    setRenderer(renderer: RxnArrowRenderer): void;
    moveRelative(delta: Vec2): void;
    moveAbsolute(position: Vec2): void;
}
