import { EmptySubChain } from '../entities/monomer-chains/EmptySubChain';
import type { BaseSequenceItemRenderer } from '../../application/render/renderers/sequence/BaseSequenceItemRenderer';
import { EmptyMonomer } from '../entities/EmptyMonomer';
import type { BaseMonomer } from '../entities/BaseMonomer';
import type { SubChainNode } from '../entities/monomer-chains/types';
export declare class BackBoneSequenceNode {
    firstConnectedNode: SubChainNode;
    secondConnectedNode: SubChainNode;
    renderer?: BaseSequenceItemRenderer;
    monomer: EmptyMonomer;
    constructor(firstConnectedNode: SubChainNode, secondConnectedNode: SubChainNode);
    get SubChainConstructor(): typeof EmptySubChain;
    get firstMonomerInNode(): BaseMonomer | import("./Sugar").Sugar | import("./AmbiguousMonomer").AmbiguousMonomer | import("./Phosphate").Phosphate | EmptyMonomer;
    get lastMonomerInNode(): BaseMonomer | import("./Sugar").Sugar | import("./AmbiguousMonomer").AmbiguousMonomer | import("./Phosphate").Phosphate | EmptyMonomer;
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
