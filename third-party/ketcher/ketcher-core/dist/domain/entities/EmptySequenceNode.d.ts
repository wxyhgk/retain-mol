import { EmptySubChain } from '../entities/monomer-chains/EmptySubChain';
import type { BaseSequenceItemRenderer } from '../../application/render/renderers/sequence/BaseSequenceItemRenderer';
import { EmptyMonomer } from '../entities/EmptyMonomer';
import type { BaseMonomer } from '../entities/BaseMonomer';
export declare class EmptySequenceNode {
    renderer?: BaseSequenceItemRenderer;
    readonly monomer: EmptyMonomer;
    private readonly monomersCache;
    get SubChainConstructor(): typeof EmptySubChain;
    get firstMonomerInNode(): EmptyMonomer;
    get lastMonomerInNode(): EmptyMonomer;
    get hovered(): boolean;
    get selected(): boolean;
    get monomerItem(): {
        props: {
            MonomerNaturalAnalogCode: null;
        };
    };
    get monomers(): BaseMonomer[];
    setRenderer(renderer: any): void;
    get modified(): boolean;
}
