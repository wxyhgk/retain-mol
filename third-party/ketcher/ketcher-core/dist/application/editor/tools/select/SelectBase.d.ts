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
import { BaseMonomer, Vec2 } from '../../../../domain/entities';
import type { CoreEditor } from '../../../editor/Editor';
import { BaseRenderer } from '../../../render/renderers/BaseRenderer';
import type { BaseTool } from '../../../editor/tools/Tool';
import type { DrawingEntity } from '../../../../domain/entities/DrawingEntity';
import type { MonomersAlignment } from '../../../editor/tools/types';
type GroupCenterSnapResult = {
    snapPosition: Vec2;
    isVertical: boolean;
    absoluteSnapPosition: Vec2;
    monomerPair: [BaseMonomer, BaseMonomer];
    connectionLength: number;
    showGroupCenterSnapping: true;
};
declare abstract class SelectBase implements BaseTool {
    protected readonly editor: CoreEditor;
    readonly name = "select-tool";
    protected mousePositionAfterMove: Vec2;
    protected mousePositionBeforeMove: Vec2;
    protected selectionStartCanvasPosition: Vec2;
    protected previousSelectedEntities: [number, DrawingEntity][];
    private readonly canvasResizeObserver?;
    private firstMonomerPositionBeforeMove;
    mode: 'moving' | 'selecting' | 'standby' | 'rotating' | 'rotating-center';
    protected rotationStartAngle: number;
    protected rotationCenter: Vec2 | null;
    protected currentRotationAngle: number;
    protected static readonly ROTATION_SNAP_ANGLE = 15;
    protected static readonly ROTATION_ANGLE_EPSILON = 0.001;
    protected rotationStartPositions: Map<number, Vec2>;
    protected userRotationCenter: Vec2 | null;
    private readonly rotationHandleUnsubscribe?;
    private readonly rotationCenterUnsubscribe?;
    private readonly selectEntitiesHandler;
    /**
     * Reads renderer data from d3-bound event targets (`target.__data__`).
     * Returns undefined when an event target has no renderer payload.
     */
    private static getRendererFromEvent;
    constructor(editor: CoreEditor);
    private startMoveIfNeeded;
    mousedown(event: MouseEvent): void;
    private getCanvasBbox;
    private buildRotationViewParams;
    protected startRotation(event: MouseEvent | PointerEvent): void;
    protected startRotationCenterDrag(event: MouseEvent | PointerEvent): void;
    protected mousedownEntity(renderer: BaseRenderer, shiftKey?: boolean, modKey?: boolean, altKey?: boolean): void;
    protected onSelectionStart(): void;
    isSelectionRunning(): boolean;
    protected abstract createSelectionView(): void;
    protected abstract updateSelectionViewParams(): void;
    protected abstract onSelectionMove(isShiftPressed: boolean): void;
    static calculateAngleSnap(monomerPositionPlusCursorDelta: Vec2, connectedPosition: Vec2, snapAngle: number, snappedDistance?: number): {
        angleSnapPosition: null;
        snappedAngleRad?: undefined;
    } | {
        angleSnapPosition: Vec2;
        snappedAngleRad: number;
    };
    static calculateBondLengthSnap(cursorPosition: Vec2, connectedPosition: Vec2, snappedAngle: number | undefined): {
        bondLengthSnapPosition: null;
    } | {
        bondLengthSnapPosition: Vec2;
    };
    static needApplyGroupCenterSnapForOneAxis(pointToCheck: number, snappingPoint: number, threshold: number, pointToCheckOnAnotherAxis: number, snappingPointOnAnotherAxis: number, thresholdOnAnotherAxis: number): boolean;
    static calculateGroupCenterSnapPosition(selectedEntities: BaseMonomer[], connectedMonomers: BaseMonomer[], movementDelta: Vec2): GroupCenterSnapResult[];
    static determineAlignment(firstPosition: Vec2, secondPosition: Vec2): MonomersAlignment | null;
    static checkMonomersAlignment(firstMonomer: BaseMonomer, secondMonomer: BaseMonomer, snapAlignment: MonomersAlignment, distance: number): boolean;
    static getNextMonomers(currentMonomer: BaseMonomer, visitedMonomers: Set<number>): (BaseMonomer | undefined)[];
    static findRemainingAlignedMonomers(startingMonomer: BaseMonomer, initialState: BaseMonomer[], alignment: MonomersAlignment, distance: number): BaseMonomer[];
    static calculateSideDistanceSnap(cursorPosition: Vec2, initialMonomer: BaseMonomer, connectedMonomer: BaseMonomer): {
        distanceSnapPosition: null;
        snapDistance?: undefined;
        alignment?: undefined;
        alignedMonomers?: undefined;
    } | {
        snapDistance: number;
        distanceSnapPosition: Vec2;
        alignment: MonomersAlignment;
        alignedMonomers: BaseMonomer[];
    };
    static calculateInBetweenDistanceSnap(cursorPosition: Vec2, initialMonomer: BaseMonomer, firstConnectedMonomer: BaseMonomer, secondConnectedMonomer: BaseMonomer, alignment: MonomersAlignment): {
        distanceSnapPosition: null;
        snapDistance?: undefined;
        alignment?: undefined;
        alignedMonomers?: undefined;
    } | {
        snapDistance: number;
        distanceSnapPosition: Vec2;
        alignment: MonomersAlignment;
        alignedMonomers: BaseMonomer[];
    };
    static calculateDistanceSnap(cursorPosition: Vec2, initialMonomer: BaseMonomer, connectedMonomer: BaseMonomer): {
        distanceSnapPosition: null;
        snapDistance?: undefined;
        alignment?: undefined;
        alignedMonomers?: undefined;
    } | {
        snapDistance: number;
        distanceSnapPosition: Vec2;
        alignment: MonomersAlignment;
        alignedMonomers: BaseMonomer[];
    };
    private tryToSnap;
    mousemove(event: MouseEvent): void;
    mouseup(event: MouseEvent): void;
    mouseOverDrawingEntity(event: MouseEvent): void;
    mouseLeaveDrawingEntity(event: MouseEvent): void;
    mouseOverPolymerBond(event: MouseEvent): void;
    mouseLeavePolymerBond(event: MouseEvent): void;
    setSelectedEntities(): void;
    protected updateRotationView(): void;
    protected handleRotationMove(event: MouseEvent): void;
    protected finishRotation(): void;
    destroy(): void;
    stopMovement(): void;
}
export { SelectBase };
