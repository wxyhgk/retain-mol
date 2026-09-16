import { KetMonomerClass, AttachmentPointName, AtomLabel } from 'ketcher-core';
export type LeavingGroupRequirement = {
    attachmentPoint: AttachmentPointName;
    expectedLeavingGroup: AtomLabel;
};
export type MonomerValidationRule = {
    monomerType: KetMonomerClass;
    requirements: LeavingGroupRequirement[];
    warningMessage: string;
};
export declare const MONOMER_VALIDATION_RULES: MonomerValidationRule[];
export declare const getValidationRuleForMonomerType: (monomerType: KetMonomerClass | "rnaPreset") => MonomerValidationRule | undefined;
