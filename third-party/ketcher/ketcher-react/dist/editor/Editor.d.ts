/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/
import { type Editor as KetcherEditor, type EditorDocumentChangeReason, type MoleculeCanvasCommitResult, type FloatingToolsParams, type MonomerCreationInitialValues, type MonomerCreationState, type RenderOptions, type SGroupAttachmentPoint, type RnaPresetComponentKey, type BaseMonomer, type Action, AtomLabel, type AttachmentPointName, Render, type Struct, type Vec2, type KetMonomerClass, type IKetMonomerTemplate } from 'ketcher-core';
import { PipelineSubscription, Subscription } from 'subscription';
import type { SelectedItems, SkipItem } from './shared/closest.types';
import type { ChangeEventData } from './utils';
import { type ISelectionManager, type Selection } from './core/SelectionManager';
import { Highlighter } from './highlighter';
import { type IHistoryManager } from './core/HistoryManager';
import type { ContextMenuInfo } from '../ui/components/ContextMenu/contextMenu.types';
import { HoverIcon } from './HoverIcon';
import RotateController from './tool/rotate-controller';
import type { HoverTarget, Tool } from './tool/Tool';
import { type IView } from './view/ViewManager';
import { type IEditorEventBus } from './bus/EditorEventBus';
import { type IStructManager } from './core/StructManager';
import { type IMonomerWizardManager } from './core/MonomerWizardManager';
import { type ISGroupManager } from './core/SGroupManager';
import { type IRnaPresetManager } from './core/RnaPresetManager';
import { type IMonomerFinishManager } from './core/MonomerFinishManager';
import { type IMonomerSubscriptionManager } from './core/MonomerSubscriptionManager';
import { type IMonomerOpsManager, type SaveNewMonomerData } from './core/MonomerOpsManager';
import { type IToolManager } from './core/ToolManager';
import { type IHoverManager } from './core/HoverManager';
import { type ISubscriptionManager } from './core/SubscriptionManager';
export type { Selection } from './core/SelectionManager';
export type FinishNewMonomersCreationOptions = {
    rnaPresetName?: string;
    phosphatePosition?: '3' | '5';
};
export type { SaveNewMonomerData } from './core/MonomerOpsManager';
export type FinishNewMonomersCreationData = {
    monomer: BaseMonomer;
    monomerTemplate: IKetMonomerTemplate;
    monomerRef: string;
    monomerStructureInWizard: Selection;
    atomIdMap: Map<number, number>;
};
declare class Editor implements KetcherEditor {
    private readonly documentChangeListeners;
    private documentObserversDisposed;
    private monomerCreationDocumentTransitioning;
    private readonly moleculeCommitManager;
    ketcherId: string;
    render: Render;
    selectionManager: ISelectionManager;
    viewManager: IView;
    eventBus: IEditorEventBus;
    _tool: Tool | null;
    historyManager: IHistoryManager;
    structManager: IStructManager;
    monomerWizardManager: IMonomerWizardManager;
    sGroupManager: ISGroupManager;
    rnaPresetManager: IRnaPresetManager;
    monomerFinishManager: IMonomerFinishManager;
    monomerSubscriptionManager: IMonomerSubscriptionManager;
    monomerOpsManager: IMonomerOpsManager;
    toolManager: IToolManager;
    hoverManager: IHoverManager;
    subscriptionManager: ISubscriptionManager;
    get _selection(): Selection | null;
    set _selection(value: Selection | null);
    get historyStack(): Action[];
    set historyStack(value: Action[]);
    get historyPtr(): number;
    set historyPtr(value: number);
    errorHandler: ((message: string) => void) | null;
    highlights: Highlighter;
    hoverIcon: HoverIcon;
    lastCursorPosition: {
        x: number;
        y: number;
    };
    contextMenu: ContextMenuInfo;
    rotateController: RotateController;
    event: {
        message: Subscription;
        tooltip: Subscription;
        elementEdit: PipelineSubscription;
        zoomIn: PipelineSubscription;
        zoomOut: PipelineSubscription;
        zoomChanged: PipelineSubscription;
        bondEdit: PipelineSubscription;
        rgroupEdit: PipelineSubscription;
        sgroupEdit: PipelineSubscription;
        sdataEdit: PipelineSubscription;
        quickEdit: PipelineSubscription;
        attachEdit: PipelineSubscription;
        removeFG: PipelineSubscription;
        editMonomer: PipelineSubscription;
        change: Subscription;
        selectionChange: PipelineSubscription;
        aromatizeStruct: PipelineSubscription;
        dearomatizeStruct: PipelineSubscription;
        enhancedStereoEdit: PipelineSubscription;
        confirm: PipelineSubscription;
        showInfo: PipelineSubscription;
        apiSettings: PipelineSubscription;
        cursor: Subscription;
        updateFloatingTools: Subscription<FloatingToolsParams>;
    };
    serverSettings: Record<string, unknown>;
    lastEvent: Event | null;
    macromoleculeConvertionError: string | null | undefined;
    constructor(ketcherId: string, clientArea: HTMLElement, options?: Record<string, unknown>, serverSettings?: Record<string, unknown>, prevEditor?: KetcherEditor);
    subscribeDocumentChanges(listener: (reason: EditorDocumentChangeReason) => void): () => void;
    getMoleculeEditUnavailableReason(): string | null;
    getMoleculeEditBusyReason(): string | null;
    commitMoleculeStruct(candidate: Struct, expected: Struct, onCommitted: () => void): MoleculeCanvasCommitResult;
    private publishMoleculeLegacyChanges;
    notifyDocumentChange(reason: EditorDocumentChangeReason): void;
    disposeDocumentObservers(): void;
    private dispatchDocumentChange;
    isDitrty(): boolean;
    isDirty(): boolean;
    setOrigin(): void;
    tool(name?: string, opts?: unknown): Tool | null;
    clear(): void;
    renderAndRecoordinateStruct(struct: Struct, needToCenterStruct?: boolean, x?: number, y?: number): Struct;
    /** Apply {@link value}: {@link Struct} if provided to {@link render} and  */
    struct(value?: Struct, needToCenterStruct?: boolean, x?: number, y?: number): Struct;
    structToAddFragment(struct: Struct, x?: number, y?: number): Struct;
    setOptions(opts: string): false | RenderOptions;
    /** Apply options from {@link value} */
    options(value?: Record<string, unknown>): RenderOptions;
    setServerSettings(serverSettings?: Record<string, unknown>): void;
    /**
     * Determines whether structure position should be preserved when applying options.
     * Preserves atom coordinates only when viewOnlyMode is being set/changed on existing structure.
     * This prevents structures from shifting when enabling/disabling viewOnlyMode.
     * In all other cases (opening files, changing settings), structures are centered as before.
     */
    private shouldPreserveStructPosition;
    private updateToolAfterOptionsChange;
    zoom(value?: number, event?: WheelEvent): number;
    centerStruct(): void;
    centerViewportAccordingToStruct(struct?: Struct): void;
    positionStruct(x: number, y: number): void;
    zoomAccordingContent(struct: Struct): boolean;
    get monomerCreationState(): MonomerCreationState;
    private set monomerCreationState(value);
    setMonomerCreationSelectedType(type: KetMonomerClass | 'rnaPreset' | undefined): void;
    markAsRnaComponent(componentKey: RnaPresetComponentKey, atomIds: number[], bondIds: number[]): void;
    setConnectionAttachmentPoints(points: Map<AttachmentPointName, [number, number]>): void;
    /**
     * Restricts which assigned attachment points are rendered on the canvas.
     * Pass undefined to show all assigned attachment points (e.g. on Preset tab).
     */
    setVisibleAssignedAttachmentPoints(points: Map<AttachmentPointName, [number, number]> | undefined): void;
    highlightConnectionAttachmentPoint(name: AttachmentPointName | null): void;
    /**
     * Highlights a specific atom by its ID on the canvas (for use when the
     * AP name alone is ambiguous, e.g. two components sharing the same AP name).
     * Pass null to clear the highlight.
     */
    highlightAtomById(atomId: number | null): void;
    get isMonomerCreationWizardActive(): boolean;
    get isMonomerCreationDocumentTransitioning(): boolean;
    get isMonomerCreationWizardEnabled(): boolean;
    static isMinimalViableStructure(structure: Struct, monomerCreationState: MonomerCreationState | null): boolean;
    static isStructureImpure(struct: Struct): boolean;
    openMonomerCreationWizard(selectionOverride?: Selection, editInstanceInitialValues?: MonomerCreationInitialValues, editInstanceAttachmentPoints?: ReadonlyArray<SGroupAttachmentPoint>): void;
    assignLeavingGroupAtom(atomId: number): void;
    assignConnectionPointAtom(atomId: number, attachmentPointName?: AttachmentPointName, assignedAttachmentPointsByMonomer?: Map<AttachmentPointName, [
        number,
        number
    ]>, monomerStructure?: Selection, forceAddNewLeavingGroupAtom?: boolean, leavingAtomLabel?: AtomLabel, leavingAtomPosition?: Vec2): void;
    closeMonomerCreationWizard(restoreOriginalStruct?: boolean): void;
    saveNewMonomer(data: SaveNewMonomerData): {
        monomer: BaseMonomer;
        monomerTemplate: IKetMonomerTemplate;
        monomerRef: string;
    };
    finishNewMonomersCreation(monomersData: FinishNewMonomersCreationData[], { rnaPresetName, phosphatePosition }?: FinishNewMonomersCreationOptions): void;
    reassignAttachmentPointLeavingAtom(name: AttachmentPointName, newLeavingAtomId: number): void;
    reassignAttachmentPoint(currentName: AttachmentPointName, newName: AttachmentPointName): void;
    changeLeavingAtomLabel(name: AttachmentPointName, newLeavingAtomLabel: AtomLabel): void;
    removeAttachmentPoint(name: AttachmentPointName): void;
    cleanupCloseAttachmentPointEditPopup(): void;
    setProblematicAttachmentPoints(problematicPoints: Set<AttachmentPointName>): void;
    setProblematicAtoms(problematicAtoms: Set<number>): void;
    highlightAttachmentPoint(name: AttachmentPointName | null): void;
    findPotentialLeavingAtoms(attachmentAtomId: number): import("ketcher-core").Atom[];
    private subscribeToChangeEventInMonomerCreationWizard;
    private unsubscribeFromChangeEventInMonomerCreationWizard;
    setRnaMonomerCreationMode(isActive: boolean): void;
    selection(ci?: Selection | 'all' | 'descriptors' | null): Selection | null;
    hover(ci: HoverTarget | null, newTool?: Tool | null, event?: PointerEvent): void;
    update(action: Action | true, ignoreHistory?: boolean): void;
    historySize(): {
        readonly undo: number;
        readonly redo: number;
    };
    undo(): void;
    redo(): void;
    clearHistory(): void;
    subscribe(eventName: string, handler: ((data?: unknown) => void) | ((data: ChangeEventData[]) => void)): {
        handler: ((data?: unknown) => void) | ((data: ChangeEventData[]) => void);
    };
    unsubscribe(eventName: string, subscriber: {
        handler: ((data?: unknown) => void) | ((data: ChangeEventData[]) => void);
    }): void;
    findItem(event: Event | MouseEvent | {
        clientX: number;
        clientY: number;
    }, maps: Array<string> | null, skip?: SkipItem | null): (import(".").ClosestItemWithMap<unknown, string> & HoverTarget) | null;
    findMerge(srcItems: SelectedItems, maps?: string[]): import(".").MergeResult;
    explicitSelected(autoSelectBonds?: boolean): Selection;
    structSelected(existingSelection?: Selection, atomIdMap?: Map<number, number>, bondIdMap?: Map<number, number>): Struct;
    alignDescriptors(): void;
    setMacromoleculeConvertionError(errorMessage: string): void;
    clearMacromoleculeConvertionError(): void;
    focusCliparea(): void;
}
export { Editor };
export default Editor;
