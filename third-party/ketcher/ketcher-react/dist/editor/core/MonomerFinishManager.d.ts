import { type BaseMonomer, type IKetMonomerTemplate, type MonomerCreationState, type Render, type EditorDocumentChangeReason, type Struct, Action } from 'ketcher-core';
import type { Selection } from './SelectionManager';
import type { ISGroupManager } from './SGroupManager';
export type FinishNewMonomersCreationOptions = {
    rnaPresetName?: string;
    phosphatePosition?: '3' | '5';
};
export type FinishNewMonomersCreationData = {
    monomer: BaseMonomer;
    monomerTemplate: IKetMonomerTemplate;
    monomerRef: string;
    monomerStructureInWizard: Selection;
    atomIdMap: Map<number, number>;
};
export interface IMonomerFinishManager {
    finishNewMonomersCreation(monomersData: FinishNewMonomersCreationData[], options?: FinishNewMonomersCreationOptions): void;
}
type Deps = {
    getRender: () => Render;
    getStruct: () => Struct;
    setStruct: (struct: Struct) => Struct;
    update: (action: Action | true, ignoreHistory?: boolean) => void;
    closeMonomerCreationWizard: () => void;
    getMonomerCreationState: () => MonomerCreationState | null;
    getOriginalStruct: () => Struct;
    getOriginalSelection: () => Selection;
    getSelectedToOriginalAtomsIdMap: () => Map<number, number>;
    updateMonomersLibrary: (library: string, options: {
        format: 'ket';
        shouldPersist: boolean;
        needDispatchLibraryUpdateEvent: boolean;
    }) => unknown;
    selection: (sel: Selection | null) => Selection | null;
    dispatchChange: () => void;
    getSGroupManager: () => ISGroupManager;
    setDocumentTransitioning: (active: boolean) => void;
    notifyDocumentChange?: (reason: EditorDocumentChangeReason) => void;
};
export declare class MonomerFinishManager implements IMonomerFinishManager {
    private readonly deps;
    constructor(deps: Deps);
    finishNewMonomersCreation(monomersData: FinishNewMonomersCreationData[], { rnaPresetName, phosphatePosition }?: FinishNewMonomersCreationOptions): void;
}
export {};
