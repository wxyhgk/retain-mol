import { type BaseMonomer, type IKetMonomerTemplate, type MonomerCreationState, AttachmentPointName, type KetMonomerClass, type Struct } from 'ketcher-core';
export type SaveNewMonomerData = {
    type: KetMonomerClass;
    symbol: string;
    name: string;
    naturalAnalogue: string;
    modificationTypes: string[];
    aliasHELM: string;
    aliasBILN: string;
    hidden?: boolean;
    structure: Struct;
    attachmentPoints: Map<AttachmentPointName, [number, number]>;
};
export interface IMonomerOpsManager {
    saveNewMonomer(data: SaveNewMonomerData): {
        monomer: BaseMonomer;
        monomerTemplate: IKetMonomerTemplate;
        monomerRef: string;
    };
    isMinimalViableStructure(structure: Struct, monomerCreationState: MonomerCreationState | null): boolean;
    isStructureImpure(struct: Struct): boolean;
}
type Deps = {
    getMonomerCreationState: () => MonomerCreationState | null;
};
export declare class MonomerOpsManager implements IMonomerOpsManager {
    private deps;
    constructor(deps: Deps);
    saveNewMonomer(data: SaveNewMonomerData): {
        monomer: import("ketcher-core").Chem | import("ketcher-core").Peptide | import("ketcher-core").Phosphate | import("ketcher-core").RNABase | import("ketcher-core").Sugar | import("ketcher-core").UnresolvedMonomer | import("ketcher-core").UnsplitNucleotide;
        monomerTemplate: IKetMonomerTemplate;
        monomerRef: string;
    };
    isMinimalViableStructure(structure: Struct, monomerCreationState: MonomerCreationState | null): boolean;
    isStructureImpure(struct: Struct): boolean;
    static isMinimalViableStructure(structure: Struct, monomerCreationState: MonomerCreationState | null): boolean;
    static isStructureImpure(struct: Struct): boolean;
}
export {};
