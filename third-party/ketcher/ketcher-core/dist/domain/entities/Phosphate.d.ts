import { BaseMonomer } from './BaseMonomer';
import { type MonomerItemType, AttachmentPointName } from '../types';
import type { Vec2 } from './vec2';
import { PhosphateSubChain } from '../entities/monomer-chains/PhosphateSubChain';
import type { SubChainNode } from '../entities/monomer-chains/types';
export declare class Phosphate extends BaseMonomer {
    constructor(monomerItem: MonomerItemType, _position?: Vec2);
    getValidSourcePoint(secondMonomer: BaseMonomer): AttachmentPointName | undefined;
    getValidTargetPoint(firstMonomer: BaseMonomer): AttachmentPointName | undefined;
    private static getValidPoint;
    isMonomerTypeDifferentForChaining(monomerToChain: SubChainNode): boolean;
    get SubChainConstructor(): typeof PhosphateSubChain;
}
