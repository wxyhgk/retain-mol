import { BaseMonomer } from '../entities/BaseMonomer';
import type { SubChainNode } from '../entities/monomer-chains/types';
import { RnaSubChain } from '../entities/monomer-chains/RnaSubChain';
export declare class UnsplitNucleotide extends BaseMonomer {
    getValidSourcePoint(monomer?: BaseMonomer): import("../types").AttachmentPointName | undefined;
    getValidTargetPoint(monomer: BaseMonomer): import("../types").AttachmentPointName | undefined;
    get SubChainConstructor(): typeof RnaSubChain;
    isMonomerTypeDifferentForChaining(monomerToChain: SubChainNode): boolean;
}
