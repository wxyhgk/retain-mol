import type { Selection } from 'd3';
import { BaseMonomerRenderer } from '../../render/renderers/BaseMonomerRenderer';
import type { UnsplitNucleotide } from '../../../domain/entities/UnsplitNucleotide';
import type { D3SvgElementSelection } from '../../render/types';
import { type HighlightPathData } from '../../render/renderers/monomerHighlightShapes';
export declare class UnsplitNucleotideRenderer extends BaseMonomerRenderer {
    monomer: UnsplitNucleotide;
    CHAIN_START_TERMINAL_INDICATOR_TEXT: string;
    CHAIN_END_TERMINAL_INDICATOR_TEXT: string;
    constructor(monomer: UnsplitNucleotide, scale?: number);
    getHighlightPath(offset?: number): HighlightPathData;
    get textColor(): any;
    protected getMonomerColor(theme: any): any;
    protected appendBody(rootElement: Selection<SVGGElement, void, HTMLElement, never>, theme: any): Selection<SVGUseElement, this, HTMLElement, never>;
    show(theme: any): void;
    protected appendLabel(rootElement: D3SvgElementSelection<SVGGElement, void>): void;
    get enumerationElementPosition(): {
        x: number;
        y: number;
    };
    get beginningElementPosition(): {
        x: number;
        y: number;
    };
    protected get modificationConfig(): undefined;
}
