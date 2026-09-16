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
import { type AtomListParams, AtomList } from './atomList';
import { type Point, Vec2 } from './vec2';
import { Pile } from './pile';
import type { Struct } from './struct';
import { type initiallySelectedType, BaseMicromoleculeEntity } from '../entities/BaseMicromoleculeEntity';
import type { AtomCIP } from './types';
import { SGroup } from '../entities/sgroup';
/**
 * Return unions of Pick.
 * Difference with <Partial<Pick<O,P>>>  that this type always require at least one property
 *
 * Example:
 * interface O {
 *   field1 : 1;
 *   field2: 2;
 *   field3: 3
 * }
 * SubsetOfFields<O, 'field1'| 'field2'>
 * @returns Pick<O, "field1"> | Pick<O, "field2">
 */
type SubsetOfFields<O, P extends keyof O> = P extends P ? Pick<O, P> : never;
export declare enum AttachmentPoints {
    None = 0,
    FirstSideOnly = 1,
    SecondSideOnly = 2,
    BothSides = 3
}
export declare enum StereoLabel {
    Abs = "abs",
    And = "&",
    Or = "or"
}
export type Aromaticity = 'aromatic' | 'aliphatic';
export type Chirality = 'clockwise' | 'anticlockwise';
export interface AtomQueryProperties {
    aromaticity?: Aromaticity | null;
    ringMembership?: number | null;
    ringSize?: number | null;
    connectivity?: number | null;
    chirality?: Chirality | null;
    customQuery?: string | null;
}
export interface AtomAttributes {
    stereoParity?: number;
    stereoLabel?: string | null;
    exactChangeFlag?: number;
    rxnFragmentType?: number;
    invRet?: number;
    aam?: number;
    hCount?: number;
    isPreview?: boolean;
    unsaturatedAtom?: number;
    substitutionCount?: number;
    ringBondCount?: number;
    queryProperties?: AtomQueryProperties;
    explicitValence?: number;
    /**
     * Rgroup member attachment points
     * Its value is indigo-converted `ATTCHPT`
     * Ref: https://discover.3ds.com/sites/default/files/2020-08/biovia_ctfileformats_2020.pdf P15
     * Note: value `-1` has been converted to `3` by indigo.
     */
    attachmentPoints?: AttachmentPoints | null;
    rglabel?: number | null;
    charge?: number | null;
    radical?: number;
    cip?: AtomCIP | null;
    isotope?: number | null;
    alias?: string | null;
    pseudo?: string;
    atomList?: AtomListParams | null;
    label: string;
    fragment?: number;
    pp?: Point;
    implicitH?: number;
    implicitHCount?: number | null;
    initiallySelected?: initiallySelectedType;
}
export type AtomPropertiesInContextMenu = SubsetOfFields<AtomAttributes, 'hCount' | 'ringBondCount' | 'substitutionCount' | 'unsaturatedAtom' | 'implicitHCount'>;
export declare class Atom extends BaseMicromoleculeEntity {
    static readonly PATTERN: {
        RADICAL: {
            NONE: number;
            SINGLET: number;
            DOUPLET: number;
            TRIPLET: number;
        };
        STEREO_PARITY: {
            NONE: number;
            ODD: number;
            EVEN: number;
            EITHER: number;
        };
    };
    static readonly attrlist: {
        alias: null;
        label: string;
        isotope: null;
        radical: number;
        cip: null;
        charge: null;
        explicitValence: number;
        ringBondCount: number;
        substitutionCount: number;
        unsaturatedAtom: number;
        hCount: number;
        queryProperties: {
            aromaticity: null;
            ringMembership: null;
            ringSize: null;
            connectivity: null;
            chirality: null;
            customQuery: null;
        };
        atomList: null;
        invRet: number;
        exactChangeFlag: number;
        rglabel: null;
        attachmentPoints: null;
        aam: number;
        isPreview: boolean;
        stereoLabel: null;
        stereoParity: number;
        implicitHCount: null;
    };
    label: string;
    fragment: number;
    atomList: AtomList | null;
    attachmentPoints: AttachmentPoints | null;
    isotope: number | null;
    isPreview: boolean;
    hCount: number;
    radical: number;
    cip: AtomCIP | null;
    charge: number | null;
    explicitValence: number;
    ringBondCount: number;
    queryProperties: AtomQueryProperties;
    unsaturatedAtom: number;
    substitutionCount: number;
    valence: number;
    implicitH: number;
    implicitHCount: number | null;
    pp: Vec2;
    neighbors: Array<number>;
    sgs: Pile<number>;
    badConn: boolean;
    alias: string | null;
    rglabel: number | null;
    aam: number;
    invRet: number;
    exactChangeFlag: number;
    rxnFragmentType: number;
    stereoLabel?: string | null;
    stereoParity: number;
    hasImplicitH?: boolean;
    pseudo: string;
    /** @deprecated */
    get attpnt(): AttachmentPoints | null;
    constructor(attributes: AtomAttributes);
    get isRGroupAttachmentPointEditDisabled(): boolean;
    /**
     * Trick: used for cloned struct for tooltips, for preview, for templates
     *
     * Why?
     * Currently, tooltips are implemented with removing sgroups (wrong implementation)
     * That's why we need to mark atoms as sgroup attachment points.
     *
     * If we change preview approach to flagged (option for showing sgroups without abbreviation),
     * then we will be able to remove this hack.
     */
    setRGAttachmentPointForDisplayPurpose(): void;
    static getConnectedBondIds(struct: Struct, atomId: number): number[];
    static getAttrHash(atom: Atom): Partial<Record<"label" | "cip" | "isPreview" | "isotope" | "charge" | "explicitValence" | "ringBondCount" | "substitutionCount" | "hCount" | "implicitHCount" | "atomList" | "attachmentPoints" | "radical" | "queryProperties" | "unsaturatedAtom" | "alias" | "rglabel" | "aam" | "invRet" | "exactChangeFlag" | "stereoLabel" | "stereoParity", unknown>>;
    static attrGetDefault(attr: string): any;
    static isHeteroAtom(label: string): boolean;
    static isInAromatizedRing(struct: Struct, atomId: number): boolean;
    clone(fidMap?: Map<number, number>): Atom;
    isQuery(): boolean;
    pureHydrogen(): boolean;
    isPlainCarbon(): boolean;
    isPseudo(): boolean;
    hasRxnProps(): boolean;
    calcValence(connectionCount: number): boolean;
    private calculateValenceResult;
    private calculateUndefinedGroupValence;
    private calculateGroup1Valence;
    private calculateGroup2Valence;
    private calculateGroup3Valence;
    private calculateGroup4Valence;
    private calculateGroup5Valence;
    private calculateGroup6Valence;
    private calculateGroup7Valence;
    private calculateGroup8Valence;
    private overrideHydrogenCountIfNeeded;
    private applyValenceResult;
    calcValenceMinusHyd(conn: number): number;
    static getSuperAtomAttachmentPointByAttachmentAtom(struct: Struct, atomId: number, searchBySgroups?: boolean): import("./sGroupAttachmentPoint").SGroupAttachmentPoint | undefined;
    static getSuperAtomAttachmentPointByLeavingGroup(structOrSgroup: Struct | SGroup, atomId: number, searchBySgroups?: boolean): import("./sGroupAttachmentPoint").SGroupAttachmentPoint | undefined;
    static isSuperatomLeavingGroupAtom(structOrSgroup: Struct | SGroup, atomId?: number, searchBySgroups?: boolean): boolean;
    static isSuperatomAttachmentAtom(struct: Struct, atomId?: number): boolean;
    static getAttachmentAtomExternalConnections(struct: Struct, attachmentAtomId?: number, leavingGroupAtomid?: number, searchBySgroups?: boolean): import("./pool").Pool<import("./bond").Bond> | undefined;
    static isHiddenLeavingGroupAtom(struct: Struct, atomId: number, searchBySgroups?: boolean, includeAtomsInCollapsedSgroups?: boolean): boolean;
    private static isSGroup;
}
export declare function radicalElectrons(radical: unknown): 1 | 2 | 0;
export {};
