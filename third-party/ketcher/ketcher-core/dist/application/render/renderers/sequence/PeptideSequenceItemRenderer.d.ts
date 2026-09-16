import { BaseSequenceItemRenderer } from '../../../render/renderers/sequence/BaseSequenceItemRenderer';
import type { D3SvgElementSelection } from '../../../render/types';
export declare class PeptideSequenceItemRenderer extends BaseSequenceItemRenderer {
    #private;
    get symbolToDisplay(): string;
    private drawLine;
    protected drawModification(): void;
    protected appendRootElement(): D3SvgElementSelection<SVGGElement, void>;
}
