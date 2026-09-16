import { BaseMonomer } from '../entities/BaseMonomer';
import { ChemSubChain } from '../entities/monomer-chains/ChemSubChain';
import type { PolymerBond } from '../entities/PolymerBond';
import { AttachmentPointName } from '../types';
export declare class RNABase extends BaseMonomer {
    getValidSourcePoint(): AttachmentPointName | undefined;
    getValidTargetPoint(): AttachmentPointName | undefined;
    get SubChainConstructor(): typeof ChemSubChain;
    get sideConnections(): PolymerBond[];
}
