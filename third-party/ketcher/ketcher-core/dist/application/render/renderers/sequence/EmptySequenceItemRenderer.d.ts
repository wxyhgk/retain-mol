import { BaseSequenceItemRenderer } from '../../../render/renderers/sequence/BaseSequenceItemRenderer';
import type { D3SvgElementSelection } from '../../../render/types';
export declare class EmptySequenceItemRenderer extends BaseSequenceItemRenderer {
    get symbolToDisplay(): string;
    protected drawModification(): void;
    protected appendRootElement(): D3SvgElementSelection<SVGGElement, void>;
}
