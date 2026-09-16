import type { SubChainNode } from '../../entities/monomer-chains/types';
import type { PolymerBond } from '../PolymerBond';
export declare class BaseSubChain {
    nodes: Array<SubChainNode>;
    bonds: Array<PolymerBond>;
    modified: boolean;
    get lastNode(): SubChainNode;
    get firstNode(): SubChainNode;
    add(node: SubChainNode): void;
    addBond(bond: PolymerBond): void;
    get length(): number;
}
