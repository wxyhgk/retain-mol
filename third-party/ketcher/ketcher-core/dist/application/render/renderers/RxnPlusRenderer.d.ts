import { BaseRenderer } from '../../render/renderers/BaseRenderer';
import type { D3SvgElementSelection } from '../../render/types';
import type { RxnPlus } from '../../../domain/entities/CoreRxnPlus';
export declare class RxnPlusRenderer extends BaseRenderer {
    rxnPlus: RxnPlus;
    private selectionElement;
    constructor(rxnPlus: RxnPlus);
    private get scaledPosition();
    private get halfOfLineLength();
    private setSelectionContourAttributes;
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
