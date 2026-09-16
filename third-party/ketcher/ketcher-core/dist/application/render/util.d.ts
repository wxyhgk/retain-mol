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
import type { RaphaelAxisAlignedBoundingBox } from 'raphael';
import { Atom } from '../../domain/entities/atom';
import type { Bond } from '../../domain/entities/bond';
import type { Box2Abs } from '../../domain/entities/box2Abs';
import type { HalfBond } from '../../domain/entities/halfBond';
import { Vec2 } from '../../domain/entities/vec2';
import type ReStruct from './restruct/restruct';
import type Visel from './restruct/visel';
import type { RelativeBox } from './render.types';
import { UsageInMacromolecule } from './render.constants';
declare function relBox(box: RaphaelAxisAlignedBoundingBox): RelativeBox;
/**
 * Finds intersection of a ray and a box and
 * Returns the shift magnitude to avoid it
 */
declare function shiftRayBox(p: Vec2, d: Vec2, bb: Box2Abs): number;
declare function calcCoordinates(aPoint: Vec2, bPoint: Vec2, lengthHyp: number): {
    pos1: null | {
        x: number;
        y: number;
    };
    pos2: null | {
        x: number;
        y: number;
    };
};
declare function drawCIPLabel({ atomOrBond, position, restruct, visel, }: {
    atomOrBond: Bond | Atom;
    position: Vec2;
    restruct: ReStruct;
    visel: Visel;
}): {
    path: any;
    text: any;
    rectangle: any;
};
declare function updateHalfBondCoordinates(hb1: HalfBond, hb2: HalfBond, xShift: number): [HalfBond, HalfBond];
declare function escapeHtml(str: any): any;
declare function useLabelStyles(attachmentPointSelected: boolean, attachmentPointUsed: boolean, usageInMacromolecule: UsageInMacromolecule): {
    color: string;
    fill: string;
    stroke: string;
};
declare const util: {
    relBox: typeof relBox;
    shiftRayBox: typeof shiftRayBox;
    calcCoordinates: typeof calcCoordinates;
    drawCIPLabel: typeof drawCIPLabel;
    updateHalfBondCoordinates: typeof updateHalfBondCoordinates;
    escapeHtml: typeof escapeHtml;
    useLabelStyles: typeof useLabelStyles;
};
export default util;
