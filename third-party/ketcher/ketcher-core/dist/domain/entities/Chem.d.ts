import { BaseMonomer } from '../entities/BaseMonomer';
import { ChemSubChain } from '../entities/monomer-chains/ChemSubChain';
import type { SubChainNode } from '../entities/monomer-chains/types';
export declare class Chem extends BaseMonomer {
    getValidSourcePoint(monomer?: BaseMonomer): import("../types").AttachmentPointName | undefined;
    getValidTargetPoint(monomer: BaseMonomer): import("../types").AttachmentPointName | undefined;
    get SubChainConstructor(): typeof ChemSubChain;
    isMonomerTypeDifferentForChaining(monomerToChain: SubChainNode): boolean;
}
