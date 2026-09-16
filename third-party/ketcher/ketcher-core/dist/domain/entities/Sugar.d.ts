import { BaseMonomer } from './BaseMonomer';
import { AttachmentPointName } from '../types';
import { RnaSubChain } from '../entities/monomer-chains/RnaSubChain';
import type { SubChainNode } from '../entities/monomer-chains/types';
export declare class Sugar extends BaseMonomer {
    getValidSourcePoint(secondMonomer?: BaseMonomer): AttachmentPointName | undefined;
    getValidTargetPoint(firstMonomer: BaseMonomer): AttachmentPointName | undefined;
    private static getValidPoint;
    get SubChainConstructor(): typeof RnaSubChain;
    isMonomerTypeDifferentForChaining(monomerToChain: SubChainNode): boolean;
    get isPartOfRNA(): boolean;
}
