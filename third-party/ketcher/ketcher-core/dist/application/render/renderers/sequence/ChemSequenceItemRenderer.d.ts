import { BaseSequenceItemRenderer } from '../../../render/renderers/sequence/BaseSequenceItemRenderer';
import type { D3SvgElementSelection } from '../../../render/types';
export declare class ChemSequenceItemRenderer extends BaseSequenceItemRenderer {
    get symbolToDisplay(): string;
    protected drawModification(): void;
    show(): void;
    protected appendRootElement(): D3SvgElementSelection<SVGGElement, void>;
}
