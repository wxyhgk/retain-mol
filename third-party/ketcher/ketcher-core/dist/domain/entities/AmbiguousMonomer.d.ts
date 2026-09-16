import { BaseMonomer } from './BaseMonomer';
import type { SubChainNode } from '../entities/monomer-chains/types';
import type { Vec2 } from '../entities/vec2';
import { KetAmbiguousMonomerTemplateSubType, KetMonomerClass } from '../../application/formatters/types/ket';
import type { IVariantMonomer } from '../entities/types';
import type { AmbiguousMonomerType, AttachmentPointName } from '../types';
import { Chem } from '../entities/Chem';
import { Peptide } from '../entities/Peptide';
import { Phosphate } from '../entities/Phosphate';
import { Sugar } from '../entities/Sugar';
import { RNABase } from '../entities/RNABase';
import { UnsplitNucleotide } from '../entities/UnsplitNucleotide';
export declare const DEFAULT_VARIANT_MONOMER_LABEL = "%";
export declare const MONOMER_CLASS_TO_CONSTRUCTOR: {
    CHEM: typeof Chem;
    AminoAcid: typeof Peptide;
    Phosphate: typeof Phosphate;
    Sugar: typeof Sugar;
    Base: typeof RNABase;
    RNA: typeof UnsplitNucleotide;
};
export declare class AmbiguousMonomer extends BaseMonomer implements IVariantMonomer {
    variantMonomerItem: AmbiguousMonomerType;
    monomers: BaseMonomer[];
    monomerClass: KetMonomerClass;
    subtype: KetAmbiguousMonomerTemplateSubType;
    constructor(variantMonomerItem: AmbiguousMonomerType, position?: Vec2, generateId?: boolean);
    static getMonomerClass(monomers: BaseMonomer[]): KetMonomerClass;
    private static getAttachmentPoints;
    get monomerCaps(): Partial<Record<AttachmentPointName, string>> | undefined;
    get isModification(): boolean;
    getValidSourcePoint(_secondMonomer?: BaseMonomer): any;
    getValidTargetPoint(_firstMonomer: BaseMonomer): any;
    get SubChainConstructor(): any;
    isMonomerTypeDifferentForChaining(monomerToChain: SubChainNode): any;
}
