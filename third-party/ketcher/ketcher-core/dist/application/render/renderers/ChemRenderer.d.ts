import type { Selection } from 'd3';
import type { Chem } from '../../../domain/entities/Chem';
import { BaseMonomerRenderer } from '../../render/renderers/BaseMonomerRenderer';
export declare class ChemRenderer extends BaseMonomerRenderer {
    monomer: Chem;
    constructor(monomer: Chem, scale?: number);
    protected appendBody(rootElement: Selection<SVGGElement, void, HTMLElement, never>, theme: any): Selection<SVGUseElement, this, HTMLElement, never>;
    get enumerationElementPosition(): undefined;
    get beginningElementPosition(): undefined;
    show(theme?: any): void;
    protected get modificationConfig(): undefined;
}
