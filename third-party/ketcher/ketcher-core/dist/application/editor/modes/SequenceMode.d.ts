import { BaseMode } from '../../editor/modes/BaseMode';
import type { LayoutMode } from '../../editor/modes/types';
import { BaseSequenceItemRenderer } from '../../render/renderers/sequence/BaseSequenceItemRenderer';
import { type MonomerItemType } from '../../../domain/types';
import { Command } from '../../../domain/entities/Command';
import { Vec2 } from '../../../domain/entities';
import { DrawingEntitiesManager } from '../../../domain/entities/DrawingEntitiesManager';
import type { IRnaPreset, LabeledNodesWithPositionInSequence } from '../../editor/tools/Tool';
export interface StartNewSequenceEventData {
    indexOfRowBefore: number;
}
export declare class SequenceMode extends BaseMode {
    private _isEditMode;
    private _isEditInRNABuilderMode;
    private _isAntisenseEditMode;
    private _isSyncEditMode;
    private isFirstInit;
    private selectionStarted;
    private selectionStartCaretPosition;
    private mousemoveCounter;
    constructor(previousMode?: LayoutMode);
    get isEditMode(): boolean;
    set isEditMode(isEditMode: boolean);
    get isEditInRNABuilderMode(): boolean;
    set isEditInRNABuilderMode(isEditInRNABuilderMode: boolean);
    get isAntisenseEditMode(): boolean;
    get isSyncEditMode(): boolean;
    private get needToEditSense();
    private get needToEditAntisense();
    private turnOnAntisenseEditMode;
    private turnOffAntisenseEditMode;
    private setAntisenseEditMode;
    turnOnSyncEditMode(): void;
    turnOffSyncEditMode(): void;
    resetEditMode(): void;
    initialize(needScroll?: boolean, needRemoveSelection?: boolean, needReArrangeChains?: boolean, forceRecalculateAntisense?: boolean): Command;
    turnOnEditMode(sequenceItemRenderer?: BaseSequenceItemRenderer, needToRemoveSelection?: boolean): void;
    turnOffEditMode(): void;
    turnOnSequenceEditInRNABuilderMode(): void;
    turnOffSequenceEditInRNABuilderMode(): void;
    startNewSequence(eventData?: StartNewSequenceEventData): void;
    modifySequenceInRnaBuilder(updatedSelection: LabeledNodesWithPositionInSequence[]): void;
    click(event: MouseEvent): void;
    doubleClickOnSequenceItem(event: MouseEvent): void;
    mousedownBetweenSequenceItems(event: MouseEvent): void;
    mousedown(event: MouseEvent): void;
    mousemove(event: MouseEvent): void;
    mouseup(): void;
    private bondNodesThroughNewPhosphate;
    private handlePeptideNodeAddition;
    private handleRnaDnaNodeAddition;
    private connectNodes;
    private deleteBondToNextNodeInChain;
    private finishNodesDeletion;
    private tryToCreatePolymerBond;
    private splitCurrentChain;
    private handleNodesDeletion;
    private isNodeExistAndNonEmpty;
    get keyboardEventHandlers(): {
        delete: {
            shortcut: string[];
            handler: () => void;
        };
        backspace: {
            shortcut: string[];
            handler: () => void;
        };
        'turn-off-edit-mode': {
            shortcut: string[];
            handler: () => void;
        };
        'start-new-sequence': {
            shortcut: string[];
            handler: () => void;
        };
        'break-editting-chain': {
            shortcut: string[];
            handler: () => void;
        };
        'break-complimentary-chain': {
            shortcut: string[];
            handler: () => void;
        };
        'move-caret-up': {
            shortcut: string[];
            handler: () => void;
        };
        'move-caret-down': {
            shortcut: string[];
            handler: () => void;
        };
        'move-caret-forward': {
            shortcut: string[];
            handler: () => void;
        };
        'move-caret-back': {
            shortcut: string[];
            handler: () => void;
        };
        'move-caret-to-row-start': {
            shortcut: string[];
            handler: () => void;
        };
        'move-caret-to-row-end': {
            shortcut: string[];
            handler: () => void;
        };
        'add-sequence-item': {
            shortcut: string[];
            handler: (event: any) => void;
        };
        'sequence-edit-select': {
            shortcut: string[];
            handler: (event: any) => void;
        };
    };
    deleteSelection(): boolean;
    isPasteAllowedByMode(drawingEntitiesManager: DrawingEntitiesManager): boolean;
    private isR1Free;
    private isR2Free;
    private areR1R2Free;
    private isConnectionPossible;
    isPasteAvailable(drawingEntitiesManager: DrawingEntitiesManager): boolean;
    applyAdditionalPasteOperations(drawingEntitiesManager: DrawingEntitiesManager): Command;
    private preserveSideChainConnections;
    private replaceSelectionWithMonomer;
    private getPresetMonomerForPreservedSideChainConnection;
    private replaceSelectionsWithMonomer;
    private checkIfNewMonomerCouldEstablishConnections;
    private selectionsContainLinkerNode;
    private getFirstMissingAttachmentPoint;
    private presetHasNeededAttachmentPoints;
    private selectionsCantPreserveConnectionsWithPreset;
    private checkNodeInsertionPossibility;
    private isSelectionsContainAntisenseChains;
    insertMonomerFromLibrary(monomerItem: MonomerItemType): void;
    private createRnaPresetNode;
    private replaceSelectionWithPreset;
    private replaceSelectionsWithPreset;
    insertPresetFromLibrary(preset: IRnaPreset): void;
    private insertNewSequenceItem;
    private showMergeWarningModal;
    private insertNewSequenceFragment;
    getNewNodePosition(): Vec2;
    private deleteSelectedDrawingEntities;
    private getNewSequenceItemPosition;
    scrollForView(): void;
    private unselectAllEntities;
    private createHydrogenBondForTwoStrandedNode;
    private deleteHydrogenBondsForNode;
    establishHydrogenBond(sequenceItemRenderer: BaseSequenceItemRenderer): void;
    deleteHydrogenBond(sequenceItemRenderer: BaseSequenceItemRenderer): void;
    destroy(): void;
}
