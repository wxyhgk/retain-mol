import type { ITwoStrandedChainItem } from '../../../domain/entities/monomer-chains/ChainsCollection';
import type { SequenceNode } from '../../../domain/entities/monomer-chains/types';
export declare function isNodeRestrictedForHydrogenBondCreation(node: SequenceNode | undefined): boolean;
export declare function isTwoStrandedNodeRestrictedForHydrogenBondCreation(twoStrandedNode?: ITwoStrandedChainItem): boolean;
