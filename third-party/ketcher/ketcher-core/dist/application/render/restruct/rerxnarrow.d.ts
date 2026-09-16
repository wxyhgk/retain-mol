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
import { type RxnArrowMode } from '../../../domain/entities/rxnArrow';
import { Vec2 } from '../../../domain/entities/vec2';
import ReObject from './reobject';
import type ReStruct from './restruct';
import type { Render } from '../raphaelRender';
import type { RenderOptions } from '../render.types';
import type { RaphaelPaper, RaphaelSet } from 'raphael';
type Arrow = {
    pos: Array<Vec2>;
    mode: RxnArrowMode;
    height?: number;
    arrowId?: number;
};
type ArrowParams = {
    length: number;
    angle: number;
};
interface MinDistanceWithReferencePoint {
    minDist: number;
    refPoint: Vec2 | null;
}
declare class ReRxnArrow extends ReObject {
    item: Arrow;
    isResizing: boolean;
    constructor(/* chem.RxnArrow */ arrow: Arrow);
    static isSelectable(): boolean;
    calcDistance(p: Vec2, s: number): MinDistanceWithReferencePoint;
    getReferencePointDistance(p: Vec2): MinDistanceWithReferencePoint;
    hoverPath(render: Render): any;
    drawHover(render: Render): any;
    getReferencePoints(): Array<Vec2>;
    makeAdditionalInfo(restruct: ReStruct): any;
    makeSelectionPlate(restruct: ReStruct, _paper: RaphaelPaper, styles: RenderOptions): RaphaelSet;
    generatePath(render: Render, options: RenderOptions, type: string): any;
    getArrowParams(x1: number, y1: number, x2: number, y2: number): ArrowParams;
    show(restruct: ReStruct, _id: number, options: RenderOptions): void;
}
export default ReRxnArrow;
