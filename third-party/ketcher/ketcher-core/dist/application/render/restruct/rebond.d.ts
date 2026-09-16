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
import { Bond } from '../../../domain/entities/bond';
import { Vec2 } from '../../../domain/entities/vec2';
import ReObject from './reobject';
import type ReStruct from './restruct';
import type { Render } from '../raphaelRender';
import type { RelativeBox, RenderPath, RenderOptions } from '../render.types';
import Visel from './visel';
import type { Element, RaphaelPaper, RaphaelSet } from 'raphael';
type FragmentSelectionPreviewOptions = {
    disabled?: boolean;
};
declare class ReBond extends ReObject {
    b: Bond;
    doubleBondShift: number;
    path: RenderPath;
    neihbid1: number;
    neihbid2: number;
    boldStereo?: boolean;
    rbb?: RelativeBox;
    cip?: {
        path: RaphaelSet;
        text: Element;
        rectangle: Element;
    };
    constructor(bond: Bond);
    static isSelectable(): boolean;
    private static getAtomPositionForBond;
    static bondRecalc(bond: ReBond, restruct: ReStruct, options: RenderOptions): void;
    drawHover(render: Render, drawOutline?: boolean): any;
    getSelectionPoints(render: Render, isHighlight?: boolean): Vec2[];
    getSelectionContour(render: Render, isHighlight: boolean): any;
    makeHoverPlate(render: Render, drawOutline?: boolean): any;
    makeSelectionPlate(restruct: ReStruct, _paper: RaphaelPaper, options: RenderOptions): any;
    private readonly isPlateShouldBeHidden;
    private makeHighlitePlate;
    show(restruct: ReStruct, bid: number, options: RenderOptions): void;
    private addTestIds;
    drawFragmentSelectionPreview(render: Render, atomIdToDrawArrows: number, options?: FragmentSelectionPreviewOptions): Visel | null;
}
export declare function getBondLineShift(cos: number, sin: number): number;
export default ReBond;
