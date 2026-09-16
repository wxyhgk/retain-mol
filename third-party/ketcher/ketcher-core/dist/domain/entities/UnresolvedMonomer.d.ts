import { BaseMonomer } from './BaseMonomer';
import { ChemSubChain } from '../entities/monomer-chains/ChemSubChain';
import type { SubChainNode } from '../entities/monomer-chains/types';
export declare class UnresolvedMonomer extends BaseMonomer {
    getValidSourcePoint(secondMonomer?: BaseMonomer): import("../types").AttachmentPointName | undefined;
    getValidTargetPoint(firstMonomer: BaseMonomer): import("../types").AttachmentPointName | undefined;
    get SubChainConstructor(): typeof ChemSubChain;
    isMonomerTypeDifferentForChaining(monomerToChain: SubChainNode): boolean;
}
