import type { ITwoStrandedChainItem } from '../entities/monomer-chains/ChainsCollection';
import { STRAND_TYPE } from '../constants';
import type { BaseMonomer } from '../entities/BaseMonomer';
import type { SubChainNode } from '../entities/monomer-chains/types';
export declare const getNodeFromTwoStrandedNode: (twoStrandedNode: ITwoStrandedChainItem, strandType: STRAND_TYPE) => import("../entities/monomer-chains/types").SequenceNode | undefined;
export declare const getNextConnectedNode: (node: SubChainNode, monomerToNode: Map<BaseMonomer, SubChainNode>) => SubChainNode | undefined;
export declare const getPreviousConnectedNode: (node: SubChainNode, monomerToNode: Map<BaseMonomer, SubChainNode>) => SubChainNode | undefined;
