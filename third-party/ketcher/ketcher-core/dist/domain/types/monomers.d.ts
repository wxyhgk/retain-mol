import type { BaseMonomer } from '../entities/BaseMonomer';
import type { Chem } from '../entities/Chem';
import type { Peptide } from '../entities/Peptide';
import type { Phosphate } from '../entities/Phosphate';
import type { RNABase } from '../entities/RNABase';
import type { Struct } from '../entities/struct';
import type { Sugar } from '../entities/Sugar';
import type { PolymerBond } from '../entities/PolymerBond';
import type { AmbiguousMonomerTransformation, IKetAttachmentPoint, IKetIdtAliases, KetAmbiguousMonomerTemplateOption, KetAmbiguousMonomerTemplateSubType, MonomerTransformation } from '../../application/formatters/types/ket';
import type { KetMonomerClass } from '../constants/monomers';
import type { D3SvgElementSelection } from '../../application/render/types';
import type { UsageInMacromolecule } from '../../application/render';
import type { MonomerToAtomBond } from '../entities/MonomerToAtomBond';
export type MonomerColorScheme = {
    regular: string;
    hover: string;
};
export declare enum AttachmentPointName {
    R1 = "R1",
    R2 = "R2",
    R3 = "R3",
    R4 = "R4",
    R5 = "R5",
    R6 = "R6",
    R7 = "R7",
    R8 = "R8",
    HYDROGEN = "hydrogen"
}
export type MonomerItemBase = {
    label: string;
    isAmbiguous?: boolean;
    favorite?: boolean;
};
export type MonomerItemType = MonomerItemBase & {
    colorScheme?: MonomerColorScheme;
    struct: Struct;
    props: {
        id?: string;
        MonomerNaturalAnalogThreeLettersCode?: string;
        MonomerNaturalAnalogCode: string;
        MonomerName: string;
        MonomerFullName?: string;
        Name: string;
        aliasHELM?: string;
        aliasBILN?: string;
        aliasAxoLabs?: string;
        BranchMonomer?: string;
        MonomerCaps?: Partial<Record<AttachmentPointName, string>>;
        MonomerCode?: string;
        MonomerType?: string;
        MonomerClass?: KetMonomerClass;
        isMicromoleculeFragment?: boolean;
        idtAliases?: IKetIdtAliases;
        unresolved?: boolean;
        modificationTypes?: string[];
        hidden?: boolean;
    };
    attachmentPoints?: IKetAttachmentPoint[];
    seqId?: number;
    isAntisense?: boolean;
    isSense?: boolean;
    expanded?: boolean;
    transformation?: MonomerTransformation;
};
export type AmbiguousMonomerType = MonomerItemBase & {
    id: string;
    monomers: BaseMonomer[];
    subtype: KetAmbiguousMonomerTemplateSubType;
    options: KetAmbiguousMonomerTemplateOption[];
    idtAliases?: IKetIdtAliases;
    isAmbiguous: true;
    transformation?: AmbiguousMonomerTransformation;
};
export type MonomerOrAmbiguousType = MonomerItemType | AmbiguousMonomerType;
export declare const attachmentPointNames: string[];
export type LeavingGroup = 'O' | 'OH' | 'H';
export type AttachmentPointConstructorParams = {
    rootElement: D3SvgElementSelection<SVGGElement, void>;
    monomer: BaseMonomer;
    bodyWidth: number;
    bodyHeight: number;
    canvas: D3SvgElementSelection<SVGSVGElement, void>;
    attachmentPointName: AttachmentPointName;
    isUsed: boolean;
    isPotentiallyUsed: boolean;
    angle: number;
    isSnake: boolean;
    applyZoomForPositionCalculation: boolean;
    isDragTarget?: boolean;
    isDragCircleHover?: boolean;
};
export type PreviewAttachmentPointConstructorParams = AttachmentPointConstructorParams & {
    selected: boolean;
    connected: boolean;
    usage: UsageInMacromolecule;
};
export type ConcreteMonomer = Peptide | Sugar | RNABase | Phosphate | Chem;
export type AttachmentPointsToBonds = Partial<Record<AttachmentPointName, PolymerBond | MonomerToAtomBond | null>>;
export type MouseEventWithAttachmentPoint = MouseEvent & {
    attachmentPointName: AttachmentPointName;
};
