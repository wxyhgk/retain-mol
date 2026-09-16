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
import { type FlipDirection, type Vec2, Action, getItemsToFuse } from 'ketcher-core';
import type { Tool } from './Tool';
import type { RotationToolContext } from './select/selectionToolContext';
type SnapMode = 'one-bond' | 'multiple-bonds';
interface RotateDragContext {
    xy0: Vec2;
    angle1: number;
    angle?: number;
    action?: Action;
    mergeItems?: ReturnType<typeof getItemsToFuse>;
}
declare class RotateTool implements Tool {
    private readonly editor;
    dragCtx?: RotateDragContext;
    isNotActiveTool: boolean;
    private centerAtomId?;
    private snapInfo;
    constructor(editor: RotationToolContext, flipDirection?: FlipDirection);
    private get reStruct();
    private get struct();
    private get selection();
    get snapAngleDrawingProps(): {
        isSnapping: boolean;
        absoluteAngle: number;
        relativeAngle: number;
        snapMode: SnapMode;
    } | null;
    mousedownHandle(handleCenter: Vec2, center: Vec2): void;
    getCenter(): Vec2 | undefined;
    mousemove: import("lodash").DebouncedFunc<(event: any) => boolean>;
    mouseup(): boolean;
    cancel(): void;
    mouseleave(): void;
    private initSnapInfo;
    private calculateAbsoluteSnapAngles;
    private calculateAbsoluteAnglesByFixedBond;
    private calculateAbsoluteAnglesByBisector;
    private partitionNeighborsBySelection;
    private snap;
    private saveSnappingBonds;
}
export default RotateTool;
