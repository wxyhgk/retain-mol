import { BaseRenderer } from '../../render/renderers/BaseRenderer';
import type { D3SvgElementSelection } from '../../render/types';
import type { RxnArrow } from '../../../domain/entities/CoreRxnArrow';
export declare class RxnArrowRenderer extends BaseRenderer {
    arrow: RxnArrow;
    private selectionElement;
    constructor(arrow: RxnArrow);
    private get scaledPosition();
    getArrowParams(): {
        length: number;
        angle: number;
    };
    private generateArrowPath;
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
