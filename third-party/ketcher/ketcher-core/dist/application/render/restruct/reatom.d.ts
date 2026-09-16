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
import { Atom, type AtomQueryProperties } from '../../../domain/entities/atom';
import type { Struct } from '../../../domain/entities/struct';
import { Box2Abs } from '../../../domain/entities/box2Abs';
import { Vec2 } from '../../../domain/entities/vec2';
import ReObject from './reobject';
import type ReStruct from './restruct';
import type { Render } from '../raphaelRender';
import type { Element, RaphaelSet } from 'raphael';
import type { RelativeBox, RenderPath, RenderOptions } from '../../render/render.types';
interface ElemAttr {
    text: string;
    path: RenderPath;
    rbb: RelativeBox;
    background?: Element;
}
export declare enum ShowHydrogenLabelNames {
    Off = "Off",
    Hetero = "Hetero",
    Terminal = "Terminal",
    TerminalAndHetero = "Terminal and Hetero",
    On = "On"
}
declare class ReAtom extends ReObject {
    a: Atom;
    showLabel: boolean;
    showInfoLabel: boolean;
    hydrogenOnTheLeft: boolean;
    color: string;
    component: number;
    label?: ElemAttr;
    infoLabel?: string;
    cip?: {
        path: RaphaelSet;
        text: Element;
        rectangle: Element;
    };
    private expandedMonomerAttachmentPoints?;
    constructor(atom: Atom);
    static isSelectable(): true;
    getVBoxObj(render: Render): Box2Abs | null;
    drawHover(render: Render, drawOutline?: boolean): any;
    private attachHighlightTriggerForAttachmentPointAtom;
    private drawHoverForPotentialAttachmentPointAtomsInMonomerCreationWizard;
    setHover(hover: boolean, render: Render, drawOutline?: boolean): boolean | undefined;
    makeMonomerAttachmentPointHighlightPlate(render: Render): any;
    getLabeledSelectionContour(render: Render, highlightPadding?: number): any;
    getUnlabeledSelectionContour(render: Render, highlightPadding?: number): any;
    getSelectionContour(render: Render, highlightPadding?: number): any;
    private readonly isPlateShouldBeHidden;
    private readonly makeHighlightePlate;
    makeHoverPlate(render: Render, drawOutline?: boolean): any;
    makeSelectionPlate(restruct: ReStruct): any;
    private createInvisibleAtomTarget;
    private isNeedShiftForCharge;
    private getRatio;
    /**
     * if atom is rendered as Abbreviation: O, NH, ...
     * In this case we need to shift the bond render start position to free space for Atom,
     * same for the Attachment point
     */
    getShiftedSegmentPosition(renderOptions: RenderOptions, direction: Vec2, _atomPosition?: Vec2, bondLen?: number | null): Vec2;
    hasAttachmentPoint(): boolean;
    show(restruct: ReStruct, aid: number, options: RenderOptions): void;
    getLargestSectorFromNeighbors(struct: Struct): {
        neighborAngle: number;
        largestAngle: number;
    };
    bisectLargestSector(struct: Struct): Vec2;
}
export declare function getColorFromStereoLabel(options: RenderOptions, stereoLabel: string): string | undefined;
/**
 * Minimum shape required by getAtomCustomQuery.
 * Satisfied by both a full Atom instance (query-specific fields nested
 * under queryProperties) and the flat Redux form state produced by the
 * Atom dialog (those fields hoisted to top level by fromAtom).
 */
type AtomQueryInput = Partial<Pick<Atom, 'isotope' | 'charge' | 'explicitValence' | 'ringBondCount' | 'substitutionCount' | 'hCount' | 'implicitHCount'>> & {
    unsaturatedAtom?: number | boolean;
    queryProperties?: Partial<AtomQueryProperties>;
} & Partial<AtomQueryProperties>;
export declare function getAtomType(atom: Atom): "single" | "list" | "pseudo";
export declare function checkIsSmartPropertiesExist(atom: Atom): boolean;
export declare function getAtomCustomQuery(atom: AtomQueryInput, includeOnlyQueryAttributes?: boolean): string;
export default ReAtom;
