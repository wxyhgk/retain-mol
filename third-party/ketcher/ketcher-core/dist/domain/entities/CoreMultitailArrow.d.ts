import { DrawingEntity } from '../entities/DrawingEntity';
import { type KetFileMultitailArrowNode, type MultitailArrowsReferencePositions } from '../entities/multitailArrow';
import { FixedPrecisionCoordinates } from '../entities/fixedPrecision';
import type { Pool } from '../entities/pool';
import { Vec2 } from '../entities/vec2';
import type { KetFileNode } from '../serializers/serializers.types';
import type { MultitailArrowRenderer } from '../../application/render/renderers/MultitailArrowRenderer';
export declare class MultitailArrow extends DrawingEntity {
    private spineTopX;
    private spineTopY;
    private readonly height;
    private readonly headOffsetX;
    private readonly headOffsetY;
    private readonly tailLength;
    private readonly tailsYOffset;
    renderer?: MultitailArrowRenderer;
    arrowId?: number;
    constructor(spineTopX: FixedPrecisionCoordinates, spineTopY: FixedPrecisionCoordinates, height: FixedPrecisionCoordinates, headOffsetX: FixedPrecisionCoordinates, headOffsetY: FixedPrecisionCoordinates, tailLength: FixedPrecisionCoordinates, tailsYOffset: Pool<FixedPrecisionCoordinates>);
    get center(): Vec2;
    setRenderer(renderer: MultitailArrowRenderer): void;
    moveRelative(delta: Vec2): void;
    moveAbsolute(position: Vec2): void;
    static fromKet(multitailArrowKetNode: KetFileNode<KetFileMultitailArrowNode>): MultitailArrow;
    toKetNode(): KetFileNode<KetFileMultitailArrowNode>;
    getReferencePositions(): MultitailArrowsReferencePositions;
}
