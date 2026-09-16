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
import { SimpleObjectMode } from '../../../domain/entities/simpleObject';
import { Vec2 } from '../../../domain/entities/vec2';
import ReObject from './reobject';
import type ReStruct from './restruct';
import type { Render } from '../raphaelRender';
import type { RenderOptions } from '../render.types';
import type { Element, RaphaelPaper, RaphaelSet } from 'raphael';
interface MinDistanceWithReferencePoint {
    minDist: number;
    refPoint: Vec2 | null;
}
interface StyledPath {
    path: Element;
    stylesApplied: boolean;
}
interface SimpleObjectItem {
    mode: SimpleObjectMode;
    pos: Array<Vec2>;
}
declare class ReSimpleObject extends ReObject {
    private readonly item;
    private selectionSet;
    private selectionPointsSet;
    constructor(simpleObject: SimpleObjectItem);
    static isSelectable(): boolean;
    calcDistance(p: Vec2, s: number): MinDistanceWithReferencePoint;
    getReferencePointDistance(p: Vec2): MinDistanceWithReferencePoint;
    getReferencePoints(): Array<Vec2>;
    getReferencePointsOnObject(): Array<Vec2>;
    getBorderHoverPath(path: Element, render: Render): any;
    getFillHoverPath(path: Element, render: Render): any;
    hoverPath(render: Render): Array<StyledPath>;
    drawHover(render: Render): Array<Element>;
    makeSelectionPlate(restruct: ReStruct, paper: RaphaelPaper, styles: RenderOptions): RaphaelSet;
    showPoints(): void;
    hidePoints(): void;
    show(restruct: ReStruct, options: RenderOptions): void;
}
export default ReSimpleObject;
