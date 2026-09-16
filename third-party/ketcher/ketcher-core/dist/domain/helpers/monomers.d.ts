import type { BaseMonomer } from '../entities/BaseMonomer';
import type { Peptide } from '../entities/Peptide';
import type { RNABase } from '../entities/RNABase';
import type { Sugar } from '../entities/Sugar';
import { type MonomerItemType, type MonomerOrAmbiguousType, type AmbiguousMonomerType, AttachmentPointName } from '../types';
import { PolymerBond } from '../entities/PolymerBond';
import type { IVariantMonomer } from '../entities/types';
import { type KetMonomerTemplateAtom } from '../../application/formatters/types/ket';
import type { IRnaPreset } from '../../application/editor/tools/Tool';
import type { Phosphate } from '../entities/Phosphate';
/**
 * Structural equivalent of AmbiguousMonomer used locally to avoid importing the class
 * and creating extra dependency edges in core entity/helper graph.
 */
type AmbiguousMonomerEntity = BaseMonomer & IVariantMonomer;
/**
 * Maps ambiguous monomer class metadata to chain constructor types used in chain checks.
 * This keeps runtime checks independent from the AmbiguousMonomer class constructor.
 */
type ChainMonomerType = 'Peptide' | 'Phosphate' | 'Sugar' | 'UnsplitNucleotide';
export declare function getMonomerUniqueKey(monomer: MonomerItemType): string;
export declare function checkIsR2R1Connection(monomer: BaseMonomer, nextMonomer: BaseMonomer): boolean;
export declare function isR2R1ConnectionFromRnaBase(polymerBond: PolymerBond): boolean;
export declare function isMonomerConnectedToR2RnaBase(monomer?: BaseMonomer): boolean | undefined;
export declare function isChemMonomer(monomer: BaseMonomer): boolean;
export declare function isLinearChem(monomer?: BaseMonomer): boolean;
export declare function getPreviousMonomerInChain(monomer: BaseMonomer): BaseMonomer | undefined;
export declare function getNextMonomerInChain(monomer?: BaseMonomer, firstMonomer?: BaseMonomer | null): BaseMonomer | undefined;
export declare function isValidRnaEnumerationStartMonomer(monomer?: BaseMonomer): boolean;
export declare function getRnaBaseFromSugar(monomer?: BaseMonomer): AmbiguousMonomerEntity | RNABase | undefined;
export declare function getSugarFromRnaBase(monomer?: BaseMonomer): BaseMonomer | undefined;
export declare function isBondBetweenSugarAndBaseOfRna(polymerBond: PolymerBond): boolean;
export declare function getPhosphateFromSugar(monomer?: BaseMonomer): BaseMonomer | undefined;
export declare function isMonomerBeginningOfChain(monomer: BaseMonomer, MonomerTypes: Array<ChainMonomerType>): boolean | undefined;
export declare function isValidNucleotide(sugar: Sugar | AmbiguousMonomerEntity, firstMonomerInCyclicChain?: BaseMonomer): boolean;
export declare function isValidNucleoside(sugar: Sugar | AmbiguousMonomerEntity, firstMonomerInCyclicChain?: BaseMonomer): boolean;
export declare const isRnaBaseVariantMonomer: (monomer: BaseMonomer & IVariantMonomer) => boolean;
export declare function isAmbiguousMonomerLibraryItem(monomer?: MonomerOrAmbiguousType): monomer is AmbiguousMonomerType;
export declare const isLibraryItemRnaPreset: (item: IRnaPreset | MonomerOrAmbiguousType) => item is IRnaPreset;
export declare const libraryItemHasR1AttachmentPoint: (libraryItem: MonomerOrAmbiguousType | IRnaPreset, attachmentPointName?: AttachmentPointName) => string | boolean | undefined;
export declare function isPeptideOrAmbiguousPeptide(monomer?: BaseMonomer): monomer is Peptide | AmbiguousMonomerEntity;
export declare function isRnaBaseOrAmbiguousRnaBase(monomer?: BaseMonomer): monomer is RNABase | AmbiguousMonomerEntity;
export declare function isPhosphateOrAmbiguousPhosphate(monomer?: BaseMonomer): monomer is Phosphate | AmbiguousMonomerEntity;
export declare function isSugarOrAmbiguousSugar(monomer?: BaseMonomer): monomer is Sugar | AmbiguousMonomerEntity;
export { isMonomerItemSugar, isMonomerItemPhosphate, } from '../helpers/monomerItem';
export declare function isRnaBaseApplicableForAntisense(monomer?: BaseMonomer): boolean;
export declare function getAllConnectedMonomersRecursively(monomer: BaseMonomer): BaseMonomer[];
export declare const canModifyAminoAcid: (monomer: BaseMonomer, modificationMonomerLibraryItem: MonomerItemType) => string | true | undefined;
export declare const getAminoAcidsToModify: (monomers: BaseMonomer[], modificationType: string, monomersLibrary: MonomerItemType[]) => Map<BaseMonomer, MonomerItemType>;
export declare const isHelmCompatible: (monomers: BaseMonomer[], monomersLibrary: MonomerItemType[]) => boolean;
export declare const normalizeMonomerAtomsPositions: (atoms: KetMonomerTemplateAtom[]) => {
    location: [number, number, number];
    label: string;
}[];
