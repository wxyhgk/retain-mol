import { Vec2 } from '../../../domain/entities';
import { Command } from '../../../domain/entities/Command';
import { BaseMonomer } from '../../../domain/entities/BaseMonomer';
import { AttachmentPointName, type MonomerOrAmbiguousType } from '../../../domain/types';
import type { IRnaPreset } from '../../editor/tools/Tool';
import type { DrawingEntitiesManager } from '../../../domain/entities/DrawingEntitiesManager';
import type { RenderersManager } from '../../render/renderers/RenderersManager';
import type { TransientDrawingView } from '../../render/renderers/TransientView';
import type { IEditorEvents } from '../../editor/editorEvents';
import type { CoreEditor } from '../../editor/Editor';
import type { DrawingEntity } from '../../../domain/entities/DrawingEntity';
export interface IAutochainMonomerAddResult {
    modelChanges: Command;
    firstMonomer: BaseMonomer;
    lastMonomer: BaseMonomer;
    drawingEntities: DrawingEntity[];
}
/**
 * Narrow interface for the dependencies that LibraryItemDragDropHandler
 * needs from CoreEditor. This keeps the handler decoupled from the concrete
 * editor class and makes it independently testable.
 */
export interface LibraryItemDragDropHandlerDeps {
    drawingEntitiesManager: DrawingEntitiesManager;
    renderersContainer: RenderersManager;
    events: Pick<IEditorEvents, 'setLibraryItemDragState' | 'placeLibraryItemOnCanvas' | 'openMonomerConnectionModal' | 'openConfirmationDialog' | 'error'>;
    getCanvasOffset(): DOMRect;
    getKetcherRootRect(): DOMRect | undefined;
    getModeName(): string;
    getEditor(): CoreEditor;
    getTransientDrawingView(): TransientDrawingView;
    placeItemOnCanvas(item: IRnaPreset | MonomerOrAmbiguousType, position: Vec2): IAutochainMonomerAddResult | undefined;
    calculateAndStoreNextAutochainPosition(lastMonomer: BaseMonomer): void;
}
/**
 * Classification of a replacement target:
 *  - 'same-geometry-preset': the cursor is over a preset that has the same
 *    geometry as the dragged preset → the whole preset will be replaced.
 *  - 'monomer': a standalone monomer or a preset component → only this single
 *    monomer will be replaced.
 */
export type ReplacementTargetKind = 'same-geometry-preset' | 'monomer';
export type ReplacementTarget = {
    /** The canvas monomer nearest to the cursor (center of the hit zone) */
    monomer: BaseMonomer;
    kind: ReplacementTargetKind;
    /**
     * If kind is 'same-geometry-preset', this holds the sugar of the target
     * preset (the anchor for the preset replacement).
     */
    presetSugar?: BaseMonomer;
    /**
     * If kind is 'same-geometry-preset', the exact canvas monomers that
     * structurally correspond to the dragged preset (sugar + optional base +
     * optional phosphate). These are the monomers highlighted during drag and
     * replaced on drop. Resolved once at classification time so highlighting and
     * replacement stay consistent.
     */
    presetComponents?: BaseMonomer[];
};
/**
 * Handles all drag-and-drop attachment-point logic for library items being
 * dragged onto the macromolecule canvas.
 *
 * Responsibilities:
 * - Proximity hover highlighting (25 px bond-target ring, 8 px snap circle)
 * - Auto-connect on snap-drop (circle-hover threshold)
 * - Opening the connection modal when the source AP cannot be determined
 * - Resuming / cancelling bond creation after the modal resolves
 * - Flex-mode repositioning and preset mirroring after a drag-drop bond
 * - Replacement detection (center-proximity) — runs before AP proximity checks
 */
export declare class LibraryItemDragDropHandler {
    private readonly deps;
    private dragDropBondTarget;
    private dragCircleHoverTarget;
    private isDragDropBondModalOpen;
    private dragDropModalContext;
    /** Tracks whether a library-item drag is currently in progress. */
    private currentDragState;
    /**
     * The current replacement target if the cursor is within
     * DRAG_REPLACE_PROXIMITY_THRESHOLD_PX of a canvas monomer center.
     * Cleared when the cursor moves outside the threshold or the drag ends.
     */
    private dragReplaceTarget;
    constructor(deps: LibraryItemDragDropHandlerDeps);
    /**
     * Wire up editor events. Must be called exactly once during editor
     * initialisation (from Editor.subscribeEvents()).
     */
    subscribe(): void;
    /**
     * Called from onCreateBond() in Editor when the connection modal resolves
     * and this.isDragDropBondModalOpen is true.
     */
    handleMonomerConnection(payload: {
        firstMonomer: BaseMonomer;
        secondMonomer: BaseMonomer;
        firstSelectedAttachmentPoint: AttachmentPointName;
        secondSelectedAttachmentPoint: AttachmentPointName;
    }): void;
    /**
     * Called from onCancelBondCreation() in Editor when the modal is dismissed
     * and this.isDragDropBondModalOpen is true.
     */
    handleMonomerConnectionCancel(): void;
    /** Whether a drag-drop connection modal is currently open. */
    get isModalOpen(): boolean;
    /** Whether a library item is currently being dragged. */
    get isDragging(): boolean;
    private onDragStateChanged;
    /**
     * Called on each drag event from the library. Updates the visual hover state
     * to indicate either:
     *  1. A replacement target (center-proximity check, runs first), OR
     *  2. The nearest free attachment point (AP-proximity check, falls through).
     */
    private onLibraryItemDragOver;
    /**
     * Clears any drag-drop bond target hover state and resets related fields.
     */
    private clearDragDropBondTarget;
    /**
     * Finds the nearest canvas monomer whose center is within
     * DRAG_REPLACE_PROXIMITY_THRESHOLD_PX of the cursor, or null.
     *
     * Converts the cursor position to canvas space so that the threshold is
     * compared in canvas pixels, making it zoom-independent. At 100% zoom
     * canvas pixels equal screen pixels; at other zoom levels the canvas-space
     * distance is invariant to zoom changes.
     */
    private findReplacementTarget;
    /**
     * Classifies a replacement target monomer based on the dragged item.
     *
     * Outcomes:
     * - 'same-geometry-preset': dragged item is a preset AND the hit monomer
     *   belongs to a canvas preset that contains every component the dragged
     *   preset provides (sugar, base if present, phosphate on the same side) →
     *   those parts of the canvas preset replace.
     * - 'monomer': everything else → only the hit monomer is replaced.
     */
    private classifyReplaceTarget;
    /**
     * Applies the replacement-target visual state to all monomers identified
     * by `target`: dims the monomer bodies to read as a "will be replaced"
     * preview and draws a single smooth outline around the whole group via a
     * transient view.
     */
    private applyReplacementVisualState;
    /**
     * Removes the replacement-target visual state from all monomers identified
     * by `target` and hides the outline.
     */
    private clearReplacementVisualState;
    /**
     * Returns the monomers that make up the replacement highlight: the matched
     * preset components for a same-geometry preset, otherwise the single hit
     * monomer.
     */
    private getHighlightMonomers;
    /**
     * Clears the current replacement target visual state and the stored field.
     */
    private clearReplacementTarget;
    private onPlaceOnCanvas;
    /**
     * Executes the replacement flow when a library item is dropped onto an
     * existing replacement target.
     *
     * Flow:
     *  1. Collect the bonds that would be lost during replacement.
     *  2. If any bonds would be lost, show the "Deletion of bonds" modal.
     *     - On Cancel: abort, restore canvas state.
     *     - On Yes: execute the replacement.
     *  3. If no bonds would be lost: execute the replacement immediately.
     */
    private executeReplacement;
    /**
     * Returns the number of bonds that would be lost if `item` were dropped
     * onto `replaceTarget`. A bond is "lost" when the replacement monomer/preset
     * does not expose the attachment point the original bond used.
     */
    private computeLostBondsForReplacement;
    /**
     * Extracts the attachment-point names declared by a monomer template, or
     * null when they cannot be determined from the template.
     */
    private getTemplateAttachmentPointNames;
    /**
     * Computes, for a dragged RNA preset, the free (available) attachment points
     * of each new component after the internal intra-preset bonds are formed,
     * plus which roles the preset provides.
     *
     * Internal usage:
     *  - sugar: R3 (base) and R2/R1 (phosphate on right/left)
     *  - base: R1
     *  - phosphate: R1/R2 (right/left)
     */
    private computeNewPresetFreeAPs;
    /**
     * Builds the replacement `Command` for the given item and target.
     */
    private buildReplacementCommand;
    /**
     * Sets or clears the drag-target attachment point on a monomer's renderer,
     * guarded by instanceof to ensure only BaseMonomerRenderer is used.
     */
    private setMonomerDragTargetAP;
    private setMonomerDragCircleHoverAP;
    /**
     * Returns the approximate canvas-space position of an attachment point
     * on a monomer renderer, based on the canonical angle for that AP.
     */
    private getAttachmentPointApproxCanvasPosition;
    /**
     * Finds the nearest free attachment point of any on-canvas monomer
     * within the given threshold (canvas pixels) of `position`.
     *
     * Converts the cursor to canvas space so that the threshold is compared in
     * canvas pixels, making it zoom-independent. At 100% zoom canvas pixels equal
     * screen pixels; at other zoom levels the canvas-space distance is invariant
     * to zoom changes.
     */
    private findNearestFreeAttachmentPointForDrag;
    /**
     * Updates an attachment-point drag target field and synchronises the
     * corresponding renderer flag.
     *
     * Compares `previousTarget` against `nextTarget`: if they differ, clears the
     * renderer flag on the old target (if any), sets it on the new one (if any),
     * and returns the `nextTarget` value. If nothing changed, returns
     * `previousTarget` unchanged so callers can detect a no-op.
     */
    private updateAttachmentPointTarget;
    /**
     * For a preset being dropped onto a target attachment point, find the
     * best monomer within the preset to form the bond.
     *
     * Delegates to the shared `findPresetMonomerForBonding` helper in
     * `bondConnectionHelpers` so that the logic can be unit-tested
     * independently.
     *
     * Implements requirements 3.1–3.3:
     * - R1 target → preset component with free R2
     * - R2 target → preset component with free R1
     * - Otherwise → sugar (if free), then phosphate (if free), then base (if free)
     */
    private findPresetMonomerForBonding;
}
