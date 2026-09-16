import { BaseRenderer } from '../../render/renderers/BaseRenderer';
import type { D3SvgElementSelection } from '../../render/types';
import { Vec2 } from '../../../domain/entities/vec2';
import type { MultitailArrow } from '../../../domain/entities/CoreMultitailArrow';
export declare class MultitailArrowRenderer extends BaseRenderer {
    arrow: MultitailArrow;
    private selectionElement;
    constructor(arrow: MultitailArrow);
    get selectionPoints(): Vec2[];
    getReferencePositionsArray(): Array<Vec2>;
    private getReferencePositions;
    private getArrowPaths;
    private getSelectionContour;
    show(): void;
    protected appendHover(): D3SvgElementSelection<SVGUseElement, void> | void;
    protected appendHoverAreaElement(): void;
    drawSelection(): void;
    appendSelection(): void;
    removeSelection(): void;
    move(): void;
    protected removeHover(): void;
    remove(): void;
    moveSelection(): void;
}
