import { Subscription } from 'subscription';
import type { ToolEventHandlerName } from '../editor/tools/Tool';
import type { CoreEditor } from '../editor/Editor';
export interface IEditorEvents {
    selectMonomer: Subscription;
    selectPreset: Subscription;
    selectTool: Subscription;
    selectSelectionTool: Subscription;
    createBondViaModal: Subscription;
    cancelBondCreationViaModal: Subscription;
    selectMode: Subscription;
    layoutModeChange: Subscription;
    selectHistory: Subscription;
    error: Subscription;
    openErrorModal: Subscription;
    openMonomerConnectionModal: Subscription;
    mouseOverPolymerBond: Subscription;
    mouseLeavePolymerBond: Subscription;
    mouseOnMovePolymerBond: Subscription;
    mouseOverMonomer: Subscription;
    mouseOnMoveMonomer: Subscription;
    mouseLeaveMonomer: Subscription;
    mouseOverAttachmentPoint: Subscription;
    mouseMoveAttachmentPoint: Subscription;
    mouseLeaveAttachmentPoint: Subscription;
    mouseUpAttachmentPoint: Subscription;
    mouseDownAttachmentPoint: Subscription;
    mouseOverDrawingEntity: Subscription;
    mouseLeaveDrawingEntity: Subscription;
    mouseUpMonomer: Subscription;
    rightClickSequence: Subscription;
    rightClickCanvas: Subscription;
    rightClickCanvasSequence: Subscription;
    rightClickPolymerBond: Subscription;
    rightClickSelectedMonomers: Subscription;
    keyDown: Subscription;
    editSequence: Subscription;
    startNewSequence: Subscription;
    establishHydrogenBond: Subscription;
    deleteHydrogenBond: Subscription;
    turnOnSequenceEditInRNABuilderMode: Subscription;
    turnOffSequenceEditInRNABuilderMode: Subscription;
    modifySequenceInRnaBuilder: Subscription;
    mouseOverSequenceItem: Subscription;
    mouseOnMoveSequenceItem: Subscription;
    mouseLeaveSequenceItem: Subscription;
    changeSequenceTypeEnterMode: Subscription;
    toggleSequenceEditMode: Subscription;
    toggleSequenceEditInRNABuilderMode: Subscription;
    toggleIsSequenceSyncEditMode: Subscription;
    resetSequenceEditMode: Subscription;
    clickOnSequenceItem: Subscription;
    mousedownBetweenSequenceItems: Subscription;
    mouseDownOnSequenceItem: Subscription;
    doubleClickOnSequenceItem: Subscription;
    openConfirmationDialog: Subscription;
    mouseUpAtom: Subscription;
    updateMonomersLibrary: Subscription;
    createAntisenseChain: Subscription;
    copySelectedStructure: Subscription;
    pasteFromClipboard: Subscription;
    deleteSelectedStructure: Subscription;
    selectEntities: Subscription;
    modelChange: Subscription;
    toggleMacromoleculesPropertiesVisibility: Subscription;
    modifyAminoAcids: Subscription;
    setEditorLineLength: Subscription;
    toggleLineLengthHighlighting: Subscription;
    setLibraryItemDragState: Subscription;
    placeLibraryItemOnCanvas: Subscription;
    autochain: Subscription;
    previewAutochain: Subscription;
    removeAutochainPreview: Subscription;
    switchToMacromoleculesMode: Subscription;
    switchToMoleculesMode: Subscription;
    layoutCircular: Subscription;
    flipHorizontal: Subscription;
    flipVertical: Subscription;
}
export declare function createEditorEvents(): IEditorEvents;
export declare const renderersEvents: ToolEventHandlerName[];
export declare const hotkeysConfiguration: {
    RNASequenceType: {
        shortcut: string[];
        handler: (editor: CoreEditor) => void;
    };
    DNASequenceType: {
        shortcut: string[];
        handler: (editor: CoreEditor) => void;
    };
    PEPTIDESequenceTYpe: {
        shortcut: string[];
        handler: (editor: CoreEditor) => void;
    };
    exit: {
        shortcut: string[];
        handler: (editor: CoreEditor) => void;
    };
    switchSelectTool: {
        shortcut: string[];
        handler: (editor: CoreEditor) => void;
    };
    undo: {
        shortcut: string;
        handler: (editor: CoreEditor) => void;
    };
    redo: {
        shortcut: string[];
        handler: (editor: CoreEditor) => void;
    };
    erase: {
        shortcut: string[];
        handler: (editor: CoreEditor) => void;
    };
    bondSingle: {
        shortcut: string;
        handler: (editor: CoreEditor) => void;
    };
    bondHydrogen: {
        shortcut: string;
        handler: (editor: CoreEditor) => void;
    };
    clear: {
        shortcut: string[];
        handler: (editor: CoreEditor) => void;
    };
    'zoom-plus': {
        shortcut: string[];
        handler: () => void;
    };
    'zoom-minus': {
        shortcut: string[];
        handler: () => void;
    };
    'zoom-reset': {
        shortcut: string;
        handler: () => void;
    };
    'select-all': {
        shortcut: string;
        handler: (editor: CoreEditor) => void;
    };
    hand: {
        shortcut: string;
        handler: (editor: CoreEditor) => void;
    };
    'hide-scrollbars': {
        shortcut: string;
        handler: () => void;
    };
    createRnaAntisenseStrand: {
        shortcut: string[];
        handler: (editor: CoreEditor) => void;
    };
    createDnaAntisenseStrand: {
        shortcut: string[];
        handler: (editor: CoreEditor) => void;
    };
    toggleMacromoleculesPropertiesVisibility: {
        shortcut: string;
        handler: (editor: CoreEditor) => void;
    };
    arrangeRing: {
        shortcut: string[];
        handler: (editor: CoreEditor) => void;
    };
};
