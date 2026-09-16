import { AttachmentPointName } from '../types';
import type { BaseMonomer } from '../entities/BaseMonomer';
type PolymerBondLike = {
    firstMonomer: BaseMonomer;
    secondMonomer?: BaseMonomer;
    firstMonomerAttachmentPoint?: AttachmentPointName;
    secondMonomerAttachmentPoint?: AttachmentPointName;
    getAnotherMonomer: (monomer: BaseMonomer) => BaseMonomer | undefined;
};
declare const isRnaBaseOrAmbiguousRnaBase: (monomer?: BaseMonomer) => boolean;
export declare const isMonomerConnectedToR2RnaBase: (monomer?: BaseMonomer) => boolean;
export declare const isBondBetweenSugarAndBaseOfRna: (polymerBond: PolymerBondLike) => boolean;
export { isRnaBaseOrAmbiguousRnaBase };
