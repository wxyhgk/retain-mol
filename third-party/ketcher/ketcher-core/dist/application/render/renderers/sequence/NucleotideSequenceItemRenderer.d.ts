import type { D3SvgElementSelection } from '../../../render/types';
import { RNASequenceItemRenderer } from './RNASequenceItemRenderer';
export declare class NucleotideSequenceItemRenderer extends RNASequenceItemRenderer {
    private phosphateModificationCircleElement?;
    drawModification(): void;
    protected appendRootElement(): D3SvgElementSelection<SVGGElement, void>;
}
