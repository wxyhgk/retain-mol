import { BaseSequenceItemRenderer } from '../../../render/renderers/sequence/BaseSequenceItemRenderer';
export declare class UnresolvedMonomerSequenceItemRenderer extends BaseSequenceItemRenderer {
    get symbolToDisplay(): string;
    protected drawModification(): void;
}
