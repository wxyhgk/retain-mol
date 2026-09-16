import { RNASequenceItemRenderer } from './RNASequenceItemRenderer';
import type { D3SvgElementSelection } from '../../../render/types';
export declare class NucleosideSequenceItemRenderer extends RNASequenceItemRenderer {
    private nucleosideCircleElement?;
    protected drawModification(): void;
    protected appendRootElement(): D3SvgElementSelection<SVGGElement, void>;
}
