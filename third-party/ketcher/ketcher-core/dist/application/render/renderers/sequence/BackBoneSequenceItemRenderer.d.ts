import { BaseSequenceItemRenderer } from '../../../render/renderers/sequence/BaseSequenceItemRenderer';
import type { D3SvgElementSelection } from '../../../render/types';
export declare class BackBoneSequenceItemRenderer extends BaseSequenceItemRenderer {
    get symbolToDisplay(): string;
    protected drawModification(): void;
    protected appendRootElement(): D3SvgElementSelection<SVGGElement, void>;
}
