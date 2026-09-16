import type { ChainsCollection, ITwoStrandedChainItem } from '../../../../../domain/entities/monomer-chains/ChainsCollection';
import { SequenceViewModelChain } from '../../../../render/renderers/sequence/SequenceViewModel/SequenceViewModelChain';
interface IForEachNodeParams {
    twoStrandedNode: ITwoStrandedChainItem;
    nodeIndex: number;
    nodeIndexOverall: number;
    chain: SequenceViewModelChain;
    chainIndex: number;
}
export declare class SequenceViewModel {
    chainsCollection: ChainsCollection;
    private readonly nodes;
    chains: SequenceViewModelChain[];
    private readonly monomerToTwoStrandedSnakeLayoutNode;
    private readonly chainToHasAntisense;
    constructor(chainsCollection: ChainsCollection);
    private addNode;
    private fillSenseNodes;
    private fillAntisenseNodes;
    private postProcessNodes;
    private fillAdditionalSpacesInAntisense;
    private fillNodes;
    private fillChains;
    get firstTwoStrandedNode(): ITwoStrandedChainItem;
    get lastTwoStrandedNode(): ITwoStrandedChainItem;
    get length(): number;
    get hasOnlyOneNewChain(): boolean;
    addEmptyChain(emptyChainIndex: number): SequenceViewModelChain;
    forEachNode(callback: (params: IForEachNodeParams) => void): void;
    getNodeIndex(node: ITwoStrandedChainItem): number;
}
export {};
