import type { Selection } from 'd3';
import { BaseMonomerRenderer } from '../../render/renderers/BaseMonomerRenderer';
import { AmbiguousMonomer } from '../../../domain/entities/AmbiguousMonomer';
import type { UsageInMacromolecule } from '../../render';
import type { D3SvgElementSelection } from '../../render/types';
import { type HighlightPathData } from '../../render/renderers/monomerHighlightShapes';
type PreviewAttachmentPointParams = {
    canvas: D3SvgElementSelection<SVGSVGElement, void>;
    usage: UsageInMacromolecule;
    selectedAttachmentPoint: string | null | undefined;
    connectedAttachmentPoints: string[] | undefined;
};
export declare class AmbiguousMonomerRenderer extends BaseMonomerRenderer {
    monomer: AmbiguousMonomer;
    private readonly monomerRenderer;
    private readonly monomerSymbolElementsIds;
    constructor(monomer: AmbiguousMonomer, scale?: number);
    protected appendBody(rootElement: Selection<SVGGElement, void, HTMLElement, never>): Selection<SVGUseElement, this, HTMLElement, never>;
    get enumerationElementPosition(): void | {
        x: number;
        y: number;
    };
    get beginningElementPosition(): void | {
        x: number;
        y: number;
    };
    getHighlightPath(offset?: number): HighlightPathData;
    private appendNumberOfMonomers;
    show(theme: any): void;
    private appendPreviewAttachmentPoint;
    showExternal(params: PreviewAttachmentPointParams): void;
    protected get modificationConfig(): {
        backgroundId: string;
        requiresFill: boolean;
    } | {
        backgroundId: string;
        requiresFill?: undefined;
    } | undefined;
}
export {};
