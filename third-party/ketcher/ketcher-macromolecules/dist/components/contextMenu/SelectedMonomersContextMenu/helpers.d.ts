import { AmbiguousMonomer, BaseMonomer, Peptide } from 'ketcher-core';
export declare const isSenseBase: (monomer: BaseMonomer | AmbiguousMonomer) => boolean;
export declare const isAntisenseCreationDisabled: (selectedMonomers: BaseMonomer[]) => boolean;
export declare const hasOnlyDeoxyriboseSugars: (selectedMonomers: BaseMonomer[]) => boolean;
export declare const hasOnlyRiboseSugars: (selectedMonomers: BaseMonomer[]) => boolean;
export declare const isAntisenseOptionVisible: (selectedMonomers: BaseMonomer[]) => boolean;
export declare const hasUnsplitNucleotide: (selectedMonomers: BaseMonomer[]) => boolean;
export declare const AMINO_ACID_MODIFICATION_MENU_ITEM_PREFIX = "aminoAcidModification-";
export declare const getModifyAminoAcidsMenuItems: (selectedMonomers: BaseMonomer[]) => {
    name: string;
    title: string;
    onMouseOver: () => void;
    onMouseOut: () => void;
}[];
export declare const getMonomersForAminoAcidModification: (selectedMonomers: BaseMonomer[], contextMenuEvent?: any) => Peptide[];
export declare const isCycleExistsForSelectedMonomers: (selectedMonomers: BaseMonomer[]) => boolean;
