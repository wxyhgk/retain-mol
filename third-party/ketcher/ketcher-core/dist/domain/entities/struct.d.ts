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
import { Atom } from './atom';
import type { EditorSelection } from '../../application/editor/editor.types';
import { Bond } from './bond';
import { Fragment } from './fragment';
import { FunctionalGroup } from './functionalGroup';
import { HalfBond } from './halfBond';
import { Loop } from './loop';
import { Pile } from './pile';
import { Pool } from './pool';
import type { RGroup } from './rgroup';
import type { RxnArrow } from './rxnArrow';
import type { RxnPlus } from './rxnPlus';
import { SGroup } from './sgroup';
import { SGroupForest } from './sgroupForest';
import type { SimpleObject } from './simpleObject';
import type { Text } from './text';
import { Vec2 } from './vec2';
import type { Highlight } from './highlight';
import type { RGroupAttachmentPoint } from './rgroupAttachmentPoint';
import type { Image } from './image';
import type { MultitailArrow } from './multitailArrow';
export type Neighbor = {
    aid: number;
    bid: number;
};
export type StructProperty = {
    key: string;
    value: string;
};
type CoordBoundingBox = {
    min: Vec2;
    max: Vec2;
};
type LoopHalfBondIds = number[];
type ConnectedComponent = Pile<number>;
export declare class Struct {
    atoms: Pool<Atom>;
    bonds: Pool<Bond>;
    sgroups: Pool<SGroup>;
    halfBonds: Pool<HalfBond>;
    loops: Pool<Loop>;
    isReaction: boolean;
    rxnArrows: Pool<RxnArrow>;
    rxnPluses: Pool<RxnPlus>;
    frags: Pool<Fragment | null>;
    rgroups: Pool<RGroup>;
    rgroupAttachmentPoints: Pool<RGroupAttachmentPoint>;
    name: string;
    abbreviation?: string;
    sGroupForest: SGroupForest;
    simpleObjects: Pool<SimpleObject>;
    texts: Pool<Text>;
    functionalGroups: Pool<FunctionalGroup>;
    highlights: Pool<Highlight>;
    images: Pool<Image>;
    multitailArrows: Pool<MultitailArrow>;
    private nextArrowId;
    constructor();
    private syncNextArrowId;
    private ensureArrowId;
    addRxnArrow(item: RxnArrow): number;
    setRxnArrow(id: number, item: RxnArrow): void;
    addMultitailArrow(item: MultitailArrow): number;
    setMultitailArrow(id: number, item: MultitailArrow): void;
    hasRxnProps(): boolean;
    hasRxnArrow(): boolean;
    hasMultitailArrow(): boolean;
    hasRxnPluses(): boolean;
    isRxn(): boolean;
    isBlank(): boolean;
    isSingleGroup(): boolean;
    clone(atomSet?: Pile<number> | null, bondSet?: Pile<number> | null, dropRxnSymbols?: boolean, aidMap?: Map<number, number> | null, simpleObjectsSet?: Pile<number> | null, textsSet?: Pile<number> | null, rgroupAttachmentPointSet?: Pile<number> | null, imagesSet?: Pile<number> | null, multitailArrowsSet?: Pile<number> | null, bidMap?: Map<number, number> | null, needCloneAttachmentPoints?: boolean): Struct;
    getScaffold(): Struct;
    getFragmentIds(_fid: number | number[]): Pile<number>;
    getFragment(fid: number | number[], aidMap?: Map<number, number>): Struct;
    getFragmentOnly(fid: number | number[], aidMap?: Map<number, number>): Struct;
    mergeInto(cp: Struct, atomSet?: Pile<number> | null, bondSet?: Pile<number> | null, dropRxnSymbols?: boolean, keepAllRGroups?: boolean, aidMap?: Map<number, number> | null, simpleObjectsSet?: Pile<number> | null, textsSet?: Pile<number> | null, rgroupAttachmentPointSet?: Pile<number> | null, imagesSet?: Pile<number> | null, multitailArrowsSet?: Pile<number> | null, bidMapEntity?: Map<number, number> | null, needCloneAttachmentPoints?: boolean): Struct;
    prepareLoopStructure(): void;
    atomAddToSGroup(sgid: any, aid: any): void;
    calcConn(atom: any, includeAtomsInCollapsedSgroups?: boolean): any[];
    findBondId(begin: number, end: number): number | null;
    initNeighbors(): void;
    bondInitHalfBonds(bid: any, bond?: Bond): void;
    halfBondUpdate(halfBondId: number): void;
    initHalfBonds(): void;
    setHbNext(hbid: any, next: any): void;
    halfBondSetAngle(hbid: any, left: any): void;
    atomAddNeighbor(hbid: any): void;
    atomSortNeighbors(aid: any): void;
    sortNeighbors(list: any): void;
    atomUpdateHalfBonds(atomId: number): void;
    updateHalfBonds(list: any): void;
    sGroupsRecalcCrossBonds(): void;
    sGroupDelete(sgid: number): void;
    atomSetPos(id: number, pp: Vec2): void;
    rxnPlusSetPos(id: number, pp: Vec2): void;
    rxnArrowSetPos(id: number, pos: Array<Vec2>): void;
    simpleObjectSetPos(id: number, pos: Array<Vec2>): void;
    textSetPosition(id: number, position: Vec2): void;
    getCoordBoundingBox(atomSet?: Pile<number>): CoordBoundingBox;
    getCoordBoundingBoxObj(): CoordBoundingBox;
    getBondLengthData(): {
        cnt: number;
        totalLength: number;
    };
    getAvgBondLength(): number;
    getAvgClosestAtomDistance(): number;
    checkBondExists(begin: number, end: number): boolean;
    findConnectedComponent(firstaid: number): Pile<number>;
    findConnectedComponents(discardExistingFragments?: boolean): ConnectedComponent[];
    markFragment(idSet: Pile<number>, properties?: [StructProperty]): void;
    clearFragments(): void;
    markFragments(properties?: any): void;
    scale(scale: number): void;
    scaleMonomerMicromoleculeSgroups(scale: number): void;
    rescale(): void;
    loopHasSelfIntersections(hbs: Array<number>): boolean;
    partitionLoop(loop: LoopHalfBondIds): LoopHalfBondIds[];
    halfBondAngle(hbid1: number, hbid2: number): number;
    loopIsConvex(loop: LoopHalfBondIds): boolean;
    loopIsInner(loop: LoopHalfBondIds): boolean;
    findLoops(): {
        newLoops: number[];
        bondsToMark: number[];
    };
    calcImplicitHydrogen(aid: number, includeAtomsInCollapsedSgroups?: boolean): void;
    setImplicitHydrogen(list?: Array<number>, includeAtomsInCollapsedSgroups?: boolean): void;
    setStereoLabelsToAtoms(): void;
    atomGetNeighbors(aid: number): Array<Neighbor> | undefined;
    getComponents(): {
        reactants: ConnectedComponent[];
        products: ConnectedComponent[];
    };
    defineRxnFragmentTypeForAtomset(atomset: Pile<number>, arrowpos: number): 1 | 2;
    getBondFragment(bid: number): number | undefined;
    bindSGroupsToFunctionalGroups(): void;
    getGroupIdFromAtomId(atomId: number): number | null;
    getGroupIdFromAtomIdBySgroups(atomId: number): number | null;
    getGroupFromAtomId(atomId: number | undefined): SGroup | undefined;
    getGroupFromAtomIdBySgroups(atomId: number | undefined): SGroup | undefined;
    getGroupIdFromBondId(bondId: number): number | null;
    getGroupFromBondId(atomId: number): SGroup | undefined;
    getGroupsIdsFromBondId(bondId: number): number[];
    getBondIdByHalfBond(halfBondId: number): number | undefined;
    /**
     * @returns visibleAtoms = selected atoms
     *                       - atoms in contracted functional groups
     *                       + functional groups's attachment atoms
     */
    getSelectedVisibleAtoms(selection: EditorSelection | null): number[];
    getRGroupAttachmentPointsByAtomId(atomId: number): number[];
    isAtomFromMacromolecule(atomId: number): boolean;
    isBondFromMacromolecule(bondOrBondId: Bond | number): boolean;
    isFunctionalGroupFromMacromolecule(functionalGroupId: number): boolean;
    isTargetFromMacromolecule(target?: {
        id: number;
        map: string;
    } | null): boolean | null | undefined;
    disableInitiallySelected(): void;
    enableInitiallySelected(): void;
    applyMonomersTransformations(scaleFactor?: number): void;
    applyStereoBondsToExpandedMonomers(): void;
    private flipBondAndSetStereo;
}
export {};
