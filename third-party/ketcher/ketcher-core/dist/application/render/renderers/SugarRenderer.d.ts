import type { Selection } from 'd3';
import type { Sugar } from '../../../domain/entities/Sugar';
import { BaseMonomerRenderer } from '../../render/renderers/BaseMonomerRenderer';
export declare class SugarRenderer extends BaseMonomerRenderer {
    monomer: Sugar;
    CHAIN_START_TERMINAL_INDICATOR_TEXT: string;
    CHAIN_END_TERMINAL_INDICATOR_TEXT: string;
    constructor(monomer: Sugar, scale?: number);
    get textColor(): "#fff" | "#333333";
    protected get modificationConfig(): {
        backgroundId: string;
        requiresFill: boolean;
    } | undefined;
    protected getMonomerColor(theme: any): any;
    protected appendBody(rootElement: Selection<SVGGElement, void, HTMLElement, never>, theme: any): Selection<SVGUseElement, this, HTMLElement, never>;
    get enumerationElementPosition(): undefined;
    get beginningElementPosition(): {
        x: number;
        y: number;
    };
}
