import { EditorType } from '../editor/editor.types';
import { type IEditorEvents } from '../editor/editorEvents';
import type { BaseMode } from '../editor/modes/internal';
import { type BaseTool, type Tool, type ToolEventHandlerName } from '../editor/tools/Tool';
import { type IKetMacromoleculesContent, type IKetMonomerGroupTemplate } from '../formatters/types/ket';
import type { RenderersManager } from '../render/renderers/RenderersManager';
import { Vec2 } from '../../domain/entities';
import { KetMonomerClass } from '../../domain/constants/monomers';
import { SequenceType } from '../../domain/entities/monomer-chains/types';
import { BaseMonomer } from '../../domain/entities/BaseMonomer';
import { DrawingEntitiesManager } from '../../domain/entities/DrawingEntitiesManager';
import { type MonomerItemType } from '../../domain/types';
import { type HistoryOperationType } from './EditorHistory';
import ZoomTool from './tools/Zoom';
import { ViewModel } from '../render/view-model/ViewModel';
import type { ToolName } from '../editor/tools/types';
import { TransientDrawingView } from '../render/renderers/TransientView/TransientDrawingView';
import type { EditorTheme } from '../../domain/types/theme';
import type { DeepPartial } from '../../types';
export interface SkippedMonomerItem {
    name: string;
    reason: string;
}
/**
 * Thrown by `CoreEditor.updateMonomersLibrary` when one or more incoming
 * monomer definitions are invalid and could not be committed to the library.
 *
 * `partialSuccess` is `true` when at least one item from the payload was
 * committed successfully alongside the failures, and `false` when every item
 * was rejected.
 *
 * `skippedItems` holds a structured list of every rejected item — `name` is
 * the monomer or template identifier, `reason` is a human-readable explanation
 * of why it was skipped.
 *
 * @example
 * try {
 *   await ketcher.updateMonomersLibrary(data);
 * } catch (err) {
 *   if (err instanceof MonomerLibraryUpdateError) {
 *     console.warn(`Partial success: ${err.partialSuccess}`);
 *     err.skippedItems.forEach(({ name, reason }) =>
 *       console.warn(`Skipped ${name}: ${reason}`)
 *     );
 *   }
 * }
 */
export declare class MonomerLibraryUpdateError extends Error {
    readonly partialSuccess: boolean;
    readonly skippedItems: SkippedMonomerItem[];
    constructor(skippedItems: SkippedMonomerItem[], partialSuccess: boolean);
}
export declare class MonomerLibraryConvertError extends Error {
    constructor(message: string, cause?: Error);
}
type CoreEditorTheme = DeepPartial<{
    ketcher: EditorTheme;
}>;
interface ICoreEditorConstructorParams {
    ketcherId?: string;
    theme: CoreEditorTheme;
    canvas: SVGSVGElement;
    renderersContainer: RenderersManager;
    mode?: BaseMode;
}
export declare const NATURAL_AMINO_ACID_MODIFICATION_TYPE = "Natural amino acid";
export declare class CoreEditor {
    events: IEditorEvents;
    ketcherId?: string;
    _type: EditorType;
    renderersContainer: RenderersManager;
    transientDrawingView: TransientDrawingView;
    drawingEntitiesManager: DrawingEntitiesManager;
    viewModel: ViewModel;
    lastCursorPosition: Vec2;
    lastCursorPositionOfCanvas: Vec2;
    private _monomersLibraryParsedJson;
    private _monomersLibrary;
    canvas: SVGSVGElement;
    ketcherRootElement: HTMLDivElement | null;
    drawnStructuresWrapperElement: SVGGElement;
    canvasOffset: DOMRect;
    ketcherRootElementBoundingClientRect: DOMRect | undefined;
    nextAutochainPosition?: Vec2;
    private libraryItemDragCancelled;
    theme: CoreEditorTheme;
    /** Handles all drag-and-drop attachment-point logic for library items. */
    private dragDropHandler;
    zoomTool: ZoomTool;
    private tool?;
    get selectedTool(): Tool | BaseTool | undefined;
    mode: BaseMode;
    private readonly previousModes;
    sequenceTypeEnterMode: SequenceType;
    private readonly micromoleculesEditor;
    private hotKeyEventHandler;
    private copyEventHandler;
    private pasteEventHandler;
    private cutEventHandler;
    private keydownEventHandler;
    private contextMenuEventHandler;
    private readonly cleanupsForDomEvents;
    constructor({ ketcherId, theme, canvas, renderersContainer, mode, }: ICoreEditorConstructorParams);
    private resetCanvasOffset;
    private resetKetcherRootElementOffset;
    private initializeGlobalEventListeners;
    private readonly handleVisibilityChange;
    private readonly handleWindowBlur;
    private readonly handleWindowResize;
    private cancelActiveDrag;
    private clearSelectionAfterCopy;
    clearMonomersLibrary(): void;
    initializeMonomersLibraryFromKetcher(monomersLibraryUpdate?: string | JSON, monomersLibraryReplace?: string | JSON, onError?: (err: unknown) => void): Promise<void>;
    private setMonomersLibrary;
    /**
     * Upserts the provided monomer definitions into the in-memory library.
     *
     * @throws {MonomerLibraryUpdateError} When one or more items fail validation.
     *   `skippedItems` lists every rejected monomer with a `name` and `reason`.
     *   `partialSuccess` is `true` when at least one item was committed before
     *   the error was raised. There is no rollback, so items committed before
     *   the first failure remain in the library.
     */
    updateMonomersLibrary(monomersDataRaw: string | JSON): void;
    get monomersLibraryParsedJson(): IKetMacromoleculesContent | null;
    get monomersLibrary(): MonomerItemType[];
    checkIfMonomerSymbolClassPairExists(symbol: string, monomerClass: KetMonomerClass | 'rnaPreset' | undefined): boolean;
    checkIfBilnAliasExists(alias: string): boolean;
    checkIfPresetCodeExists(code: string): boolean;
    get defaultRnaPresetsLibraryItems(): IKetMonomerGroupTemplate[];
    get isLibraryItemDragCancelled(): boolean;
    set isLibraryItemDragCancelled(value: boolean);
    cancelLibraryItemDrag(): void;
    private handleHotKeyEvents;
    private setupKeyboardEvents;
    private setupCopyPasteEvent;
    private setupHotKeysEvents;
    private setupContextMenuEvents;
    private onLayoutCircular;
    private subscribeEvents;
    private onFlipHorizontal;
    private onFlipVertical;
    getDataForAutochain(): {
        selectedMonomerToConnect: BaseMonomer | undefined;
        newMonomerPosition: Vec2;
        selectedMonomersWithFreeR2: BaseMonomer[];
        selectedMonomers: BaseMonomer[];
    };
    private onRemoveAutochainPreview;
    private onPreviewAutochain;
    private onAutochain;
    /**
     * Bridge method called by LibraryItemDragDropHandler to route item placement
     * to the correct private handler based on item type.
     */
    private placeItemOnCanvasForHandler;
    private onPlaceRnaPresetOnCanvas;
    private onPlaceMonomerOnCanvas;
    private onPlaceAmbiguousMonomerOnCanvas;
    private clearTransientViews;
    private clearSelection;
    calculateAndStoreNextAutochainPosition(drawingEntitiesManagerOrMonomer: DrawingEntitiesManager | BaseMonomer): void;
    invalidateNextAutochainPositionIfNeeded(isRnaPreset?: boolean): void;
    private onEditSequence;
    private onEstablishHydrogenBondSequenceMode;
    private onDeleteHydrogenBondSequenceMode;
    private onTurnOnSequenceEditInRNABuilderMode;
    private onTurnOffSequenceEditInRNABuilderMode;
    private onChangeSequenceTypeEnterMode;
    private onChangeToggleIsSequenceSyncEditMode;
    private onResetSequenceSyncEditMode;
    private onCreateAntisenseChain;
    private onSelectMonomer;
    private onSelectRNAPreset;
    onSelectTool(tool: ToolName, options?: object): void;
    private onCreateBond;
    private onCancelBondCreation;
    private onSelectMode;
    setMode(mode: BaseMode): void;
    getAllAminoAcidsModificationTypesGroupedByNaturalAnalogue(): Record<string, string[]>;
    private onModifyAminoAcids;
    private get sequenceMode();
    get isSequenceMode(): boolean;
    get isSequenceEditMode(): boolean;
    get isSequenceEditInRNABuilderMode(): boolean;
    get isSequenceAnyEditMode(): boolean;
    onSelectHistory(name: HistoryOperationType): void;
    selectTool(name: ToolName, options?: any): void;
    get isHandToolSelected(): boolean;
    unsubscribeEvents(): void;
    get trackedDomEvents(): {
        target: Element | Document;
        eventName: string;
        toolEventHandler: ToolEventHandlerName;
    }[];
    private isMouseMainButtonPressed;
    private domEventSetup;
    private updateLastCursorPosition;
    private useToolIfNeeded;
    private useModeIfNeeded;
    switchToMicromolecules(): void;
    private resetModeIfNeeded;
    switchToMacromolecules(): void;
    private rescaleStructForModeTransition;
    isCurrentModeWithAutozoom(): boolean;
    zoomToStructuresIfNeeded(): void;
    scrollToTopLeftCorner(): void;
    destroy(): void;
}
export {};
