import { BaseSequenceItemRenderer } from '../../../render/renderers/sequence/BaseSequenceItemRenderer';
export declare class UnsplitNucleotideSequenceItemRenderer extends BaseSequenceItemRenderer {
    get symbolToDisplay(): string;
    protected drawModification(): void;
}
