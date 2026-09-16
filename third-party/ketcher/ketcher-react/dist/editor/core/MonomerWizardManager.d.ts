import { Action, Atom, AtomLabel, AttachmentPointName, Bond, type RnaPresetComponentKey, type Render, type EditorDocumentChangeReason, Struct, type KetMonomerClass, type MonomerCreationState, type MonomerCreationInitialValues, type SGroupAttachmentPoint, type Vec2 } from 'ketcher-core';
import type { Selection } from './SelectionManager';
export interface IMonomerWizardManager {
    get monomerCreationState(): MonomerCreationState | null;
    set monomerCreationState(state: MonomerCreationState | null);
    setMonomerCreationSelectedType(type: KetMonomerClass | 'rnaPreset' | undefined): void;
    markAsRnaComponent(componentKey: RnaPresetComponentKey, atomIds: number[], bondIds: number[]): void;
    setConnectionAttachmentPoints(points: Map<AttachmentPointName, [number, number]>): void;
    setVisibleAssignedAttachmentPoints(points: Map<AttachmentPointName, [number, number]> | undefined): void;
    highlightConnectionAttachmentPoint(name: AttachmentPointName | null): void;
    highlightAtomById(atomId: number | null): void;
    get isMonomerCreationWizardActive(): boolean;
    get isMonomerCreationWizardEnabled(): boolean;
    isBondSuitableForAttachmentPoint(bond: Bond): boolean;
    isValidTerminalRGroupAtom(atom: Atom | undefined, struct: Struct): boolean;
    getBondByNeighborHalfBondId(struct: Struct, neighborHalfBondId?: number): Bond | null;
    openMonomerCreationWizard(selectionOverride?: Selection, editInstanceInitialValues?: MonomerCreationInitialValues, editInstanceAttachmentPoints?: ReadonlyArray<SGroupAttachmentPoint>): void;
    assignLeavingGroupAtom(atomId: number): void;
    assignConnectionPointAtom(atomId: number, attachmentPointName?: AttachmentPointName, assignedAttachmentPointsByMonomer?: Map<AttachmentPointName, [
        number,
        number
    ]>, monomerStructure?: Selection, forceAddNewLeavingGroupAtom?: boolean, leavingAtomLabel?: AtomLabel, leavingAtomPosition?: Vec2): void;
    closeMonomerCreationWizard(restoreOriginalStruct?: boolean): void;
    reassignAttachmentPointLeavingAtom(name: AttachmentPointName, newLeavingAtomId: number): void;
    reassignAttachmentPoint(currentName: AttachmentPointName, newName: AttachmentPointName): void;
    changeLeavingAtomLabel(name: AttachmentPointName, newLeavingAtomLabel: AtomLabel): void;
    removeAttachmentPoint(name: AttachmentPointName): void;
    cleanupCloseAttachmentPointEditPopup(): void;
    setProblematicAttachmentPoints(problematicPoints: Set<AttachmentPointName>): void;
    setProblematicAtoms(problematicAtoms: Set<number>): void;
    highlightAttachmentPoint(name: AttachmentPointName | null): void;
    findPotentialLeavingAtoms(attachmentAtomId: number): Atom[];
    originalStruct: Struct;
    originalSelection: Selection;
    originalHistoryStack: Action[];
    originalHistoryPointer: number;
    selectedToOriginalAtomsIdMap: Map<number, number>;
    terminalRGroupAtoms: Array<[number, string]>;
    potentialLeavingAtomsForAutoAssignment: number[];
    potentialLeavingAtomsForManualAssignment: number[];
}
type Deps = {
    getRender: () => Render;
    update: (action: Action) => void;
    getStruct: () => Struct;
    setStruct: (struct: Struct, needToCenter?: boolean) => void;
    getSelection: () => Selection | null;
    structSelected: (selection: Selection) => Struct;
    getHistoryStack: () => Action[];
    setHistoryStack: (stack: Action[]) => void;
    getHistoryPtr: () => number;
    setHistoryPtr: (ptr: number) => void;
    subscribeToChangeEventInMonomerCreationWizard: () => void;
    unsubscribeFromChangeEventInMonomerCreationWizard: () => void;
    setMonomerCreationStateNull: () => void;
    toolSelect: () => void;
    notifyDocumentChange?: (reason: EditorDocumentChangeReason) => void;
    setDocumentTransitioning?: (active: boolean) => void;
};
export declare class MonomerWizardManager implements IMonomerWizardManager {
    private deps;
    private static readonly suitableAttachmentPointStereoTypes;
    originalStruct: Struct;
    originalSelection: Selection;
    originalHistoryStack: Action[];
    originalHistoryPointer: number;
    readonly selectedToOriginalAtomsIdMap: Map<number, number>;
    terminalRGroupAtoms: Array<[number, string]>;
    potentialLeavingAtomsForAutoAssignment: number[];
    potentialLeavingAtomsForManualAssignment: number[];
    constructor(deps: Deps);
    get monomerCreationState(): MonomerCreationState | null;
    set monomerCreationState(state: MonomerCreationState | null);
    setMonomerCreationSelectedType(type: KetMonomerClass | 'rnaPreset' | undefined): void;
    markAsRnaComponent(componentKey: RnaPresetComponentKey, atomIds: number[], bondIds: number[]): void;
    setConnectionAttachmentPoints(points: Map<AttachmentPointName, [number, number]>): void;
    setVisibleAssignedAttachmentPoints(points: Map<AttachmentPointName, [number, number]> | undefined): void;
    highlightConnectionAttachmentPoint(name: AttachmentPointName | null): void;
    highlightAtomById(atomId: number | null): void;
    get isMonomerCreationWizardActive(): boolean;
    get isMonomerCreationWizardEnabled(): boolean;
    isBondSuitableForAttachmentPoint(bond: Bond): boolean;
    isValidTerminalRGroupAtom(atom: Atom | undefined, struct: Struct): boolean;
    getBondByNeighborHalfBondId(struct: Struct, neighborHalfBondId?: number): Bond | null;
    openMonomerCreationWizard(selectionOverride?: Selection, editInstanceInitialValues?: MonomerCreationInitialValues, editInstanceAttachmentPoints?: ReadonlyArray<SGroupAttachmentPoint>): void;
    assignLeavingGroupAtom(atomId: number): void;
    assignConnectionPointAtom(atomId: number, attachmentPointName?: AttachmentPointName, assignedAttachmentPointsByMonomer?: Map<AttachmentPointName, [
        number,
        number
    ]>, monomerStructure?: Selection, forceAddNewLeavingGroupAtom?: boolean, leavingAtomLabel?: AtomLabel, leavingAtomPosition?: Vec2): void;
    reassignAttachmentPointLeavingAtom(name: AttachmentPointName, newLeavingAtomId: number): void;
    reassignAttachmentPoint(currentName: AttachmentPointName, newName: AttachmentPointName): void;
    changeLeavingAtomLabel(name: AttachmentPointName, newLeavingAtomLabel: AtomLabel): void;
    removeAttachmentPoint(name: AttachmentPointName): void;
    cleanupCloseAttachmentPointEditPopup(): void;
    setProblematicAttachmentPoints(problematicPoints: Set<AttachmentPointName>): void;
    setProblematicAtoms(problematicAtoms: Set<number>): void;
    highlightAttachmentPoint(name: AttachmentPointName | null): void;
    findPotentialLeavingAtoms(attachmentAtomId: number): Atom[];
    closeMonomerCreationWizard(restoreOriginalStruct?: boolean): void;
}
export {};
