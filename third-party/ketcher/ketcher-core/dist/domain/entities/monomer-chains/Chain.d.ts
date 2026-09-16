import type { BaseSubChain } from '../../entities/monomer-chains/BaseSubChain';
import type { BaseMonomer } from '../../entities/BaseMonomer';
import type { SubChainNode } from '../../entities/monomer-chains/types';
import { Nucleoside } from '../../entities/Nucleoside';
import { Nucleotide } from '../../entities/Nucleotide';
import { MonomerSequenceNode } from '../../entities/MonomerSequenceNode';
import { EmptySequenceNode } from '../../entities/EmptySequenceNode';
import { LinkerSequenceNode } from '../../entities/LinkerSequenceNode';
import type { PolymerBond } from '../../entities/PolymerBond';
import { EmptySubChain } from '../../entities/monomer-chains/EmptySubChain';
export declare class Chain {
    subChains: BaseSubChain[];
    firstMonomer?: BaseMonomer;
    isCyclic: boolean;
    id: number;
    private nodesChanged;
    private nodesCache;
    private monomersCache;
    private bondsCache;
    constructor(firstMonomer?: BaseMonomer, isCyclic?: boolean);
    private recalculateNodes;
    private createSubChainIfNeed;
    private tryAddAsNucleosideOrNucleotide;
    private addAmbiguousMonomer;
    add(monomer: BaseMonomer): void;
    addNode(node: SubChainNode): this;
    private fillSubChains;
    get lastSubChain(): BaseSubChain;
    get nodes(): SubChainNode[];
    get lastNode(): EmptySequenceNode | MonomerSequenceNode | Nucleoside | Nucleotide | LinkerSequenceNode | undefined;
    get lastNonEmptyNode(): SubChainNode | undefined;
    get firstSubChain(): BaseSubChain;
    get firstNode(): SubChainNode;
    get length(): number;
    get isEmpty(): boolean;
    get isAntisense(): boolean;
    forEachNode(callback: ({ node, subChain, }: {
        node: SubChainNode;
        subChain: BaseSubChain;
        nodeIndex: number;
    }) => void): void;
    forEachNodeReversed(callback: ({ node, subChain, }: {
        node: SubChainNode;
        subChain: BaseSubChain;
        nodeIndex: number;
    }) => void): void;
    static createChainWithEmptyNode(): {
        emptyChain: Chain;
        emptySubChain: EmptySubChain;
        emptySequenceNode: EmptySequenceNode;
    };
    get isNewSequenceChain(): boolean;
    get monomers(): BaseMonomer[];
    get bonds(): PolymerBond[];
}
