import { Chain } from '../../entities/monomer-chains/Chain';
import { AmbiguousMonomer } from '../../entities/AmbiguousMonomer';
import type { BaseMonomer } from '../../entities/BaseMonomer';
import { Chem } from '../../entities/Chem';
import { type SequenceNode, type SubChainNode } from '../../entities/monomer-chains/types';
import { Peptide } from '../../entities/Peptide';
import { Phosphate } from '../../entities/Phosphate';
import { RNABase } from '../../entities/RNABase';
import { Sugar } from '../../entities/Sugar';
import { UnresolvedMonomer } from '../../entities/UnresolvedMonomer';
import { UnsplitNucleotide } from '../../entities/UnsplitNucleotide';
import type { BaseSubChain } from '../../entities/monomer-chains/BaseSubChain';
export interface ComplimentaryChainsWithData {
    complimentaryChain: Chain;
    chain: Chain;
    firstConnectedNode: SubChainNode;
    firstConnectedComplimentaryNode: SubChainNode;
    chainIdxConnection: number;
}
export type GrouppedChain = {
    group: number;
    chain: Chain;
};
export interface ITwoStrandedChainItem {
    senseNode?: SequenceNode;
    senseNodeIndex: number;
    chain: Chain;
    antisenseNode?: SequenceNode;
    antisenseNodeIndex?: number;
    antisenseChain?: Chain;
}
export declare class ChainsCollection {
    chains: Chain[];
    get monomerToChain(): Map<BaseMonomer, Chain>;
    get monomerToNode(): Map<BaseMonomer, SubChainNode>;
    rearrange(): void;
    add(chain: Chain): this;
    static fromMonomers(monomers: BaseMonomer[]): ChainsCollection;
    static getFirstMonomersInChains(monomers: BaseMonomer[], MonomerTypes?: Array<typeof Peptide | typeof Chem | typeof Phosphate | typeof Sugar | typeof RNABase | typeof UnresolvedMonomer | typeof UnsplitNucleotide | typeof AmbiguousMonomer>): BaseMonomer[][];
    private static getFirstMonomersInMiddleOfChains;
    get firstNode(): SubChainNode;
    private static getFirstMonomersInRegularChains;
    private static getFirstMonomersInCycledChains;
    private static getMonomerWithLowerCoordsFromMonomerList;
    get lastNode(): SubChainNode;
    get length(): number;
    forEachNode(forEachCallback: (params: {
        chainIndex: number;
        subChainIndex: number;
        nodeIndex: number;
        nodeIndexOverall: number;
        node: SubChainNode;
        subChain: BaseSubChain;
        chain: Chain;
    }) => void): void;
    private getFirstComplimentaryMonomer;
    private findCycledComplimentaryChains;
    getComplimentaryChainIfNucleotide(node: SubChainNode, monomerToChain: Map<BaseMonomer, Chain>, monomerToNode: Map<BaseMonomer, SubChainNode>): {
        complimentaryChain: Chain | undefined;
        complimentaryNode: SubChainNode | undefined;
    };
    private reorderChainsPutSenseChainOrderInAccordanceAntisenseConnection;
    getAllChainsWithConnectionInBlock(c: Chain): GrouppedChain[];
    getComplimentaryChainsWithData(chain: Chain): ComplimentaryChainsWithData[];
}
