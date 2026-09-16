import { type MonomerCreationState, type RnaPresetComponentKey, type Bond, type Struct } from 'ketcher-core';
export interface IRnaPresetManager {
    getRnaComponentForAtom(atomId: number): RnaPresetComponentKey | null;
    canAssignRnaComponent(bond: Bond): boolean;
    autoAssignAtomToRnaComponent(bondId: number): void;
    updateRnaComponentStructureState(componentKey: RnaPresetComponentKey, updatedAtoms: number[], updatedBonds: number[]): void;
    addAtomsAndBondsToRnaComponent(componentKey: RnaPresetComponentKey, atomIds: number[], bondIds: number[]): void;
    removeAtomsAndBondsFromRnaComponents(atomIds: number[], bondIds: number[]): void;
    setRnaMonomerCreationMode(isActive: boolean): void;
}
type Deps = {
    getMonomerCreationState: () => MonomerCreationState | null;
    getStruct: () => Struct;
    getOriginalStruct: () => Struct;
    getSelectedToOriginalAtomsIdMap: () => Map<number, number>;
};
export declare class RnaPresetManager implements IRnaPresetManager {
    private deps;
    constructor(deps: Deps);
    getRnaComponentForAtom(atomId: number): RnaPresetComponentKey | null;
    canAssignRnaComponent(bond: Bond): boolean;
    autoAssignAtomToRnaComponent(bondId: number): void;
    updateRnaComponentStructureState(componentKey: RnaPresetComponentKey, updatedAtoms: number[], updatedBonds: number[]): void;
    addAtomsAndBondsToRnaComponent(componentKey: RnaPresetComponentKey, atomIds: number[], bondIds: number[]): void;
    removeAtomsAndBondsFromRnaComponents(atomIds: number[], bondIds: number[]): void;
    setRnaMonomerCreationMode(isActive: boolean): void;
}
export {};
