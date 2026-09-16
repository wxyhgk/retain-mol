import type { Selection } from 'd3';
import type { Phosphate } from '../../../domain/entities/Phosphate';
import { BaseMonomerRenderer } from '../../render/renderers/BaseMonomerRenderer';
import { type HighlightPathData } from '../../render/renderers/monomerHighlightShapes';
export declare class PhosphateRenderer extends BaseMonomerRenderer {
    monomer: Phosphate;
    constructor(monomer: Phosphate, scale?: number);
    protected getMonomerColor(theme: any): any;
    getHighlightPath(offset?: number): HighlightPathData;
    get textColor(): "#fff" | "#333333";
    protected get modificationConfig(): {
        backgroundId: string;
    } | undefined;
    protected appendBody(rootElement: Selection<SVGGElement, void, HTMLElement, never>, theme: any): Selection<SVGUseElement, this, HTMLElement, never>;
    show(theme: any): void;
    get enumerationElementPosition(): undefined;
    get beginningElementPosition(): undefined;
}
