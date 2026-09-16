import type { Selection } from 'd3';
import type { RNABase } from '../../../domain/entities/RNABase';
import { BaseMonomerRenderer } from '../../render/renderers/BaseMonomerRenderer';
import { type HighlightPathData } from '../../render/renderers/monomerHighlightShapes';
export declare class RNABaseRenderer extends BaseMonomerRenderer {
    monomer: RNABase;
    constructor(monomer: RNABase, scale?: number);
    get textColor(): "#fff" | "#333333";
    getHighlightPath(offset?: number): HighlightPathData;
    protected get modificationConfig(): {
        backgroundId: string;
    } | undefined;
    protected appendBody(rootElement: Selection<SVGGElement, void, HTMLElement, never>, theme: any): Selection<SVGUseElement, this, HTMLElement, never>;
    show(theme: any): void;
    get enumerationElementPosition(): {
        x: number;
        y: number;
    };
    get beginningElementPosition(): undefined;
}
