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
import type { Atom } from './atom';
import type { Bond } from './bond';
import { Box2Abs } from './box2Abs';
import { Pile } from './pile';
import type { Struct } from './struct';
import { Vec2 } from './vec2';
import type { Render, ReStruct } from '../../application/render';
import type { FunctionalGroup } from '../entities/functionalGroup';
import type { Pool } from '../entities/pool';
import type { SGroupAttachmentPoint } from '../entities/sGroupAttachmentPoint';
import type { ReSGroup } from '../../application/render';
import { SgContexts } from '../../application/editor/shared/constants';
export declare enum SUPERATOM_CLASS {
    SUGAR = "SUGAR",
    BASE = "BASE",
    PHOSPHATE = "PHOSPHATE"
}
export declare class SGroupBracketParams {
    readonly c: Vec2;
    readonly d: Vec2;
    readonly n: Vec2;
    readonly w: number;
    readonly h: number;
    constructor(c: Vec2, d: Vec2, w: number, h: number);
}
type SGroupContext = typeof SgContexts[keyof typeof SgContexts];
interface SGroupData {
    [key: string]: unknown;
    mul: number;
    connectivity: string;
    name: string;
    nucleotideComponent: string;
    subscript: string;
    expanded: boolean;
    attached: boolean;
    absolute: boolean;
    showUnits: boolean;
    nCharsToDisplay: number;
    nCharnCharsToDisplay: number;
    tagChar: string;
    daspPos: number;
    fieldType: string;
    fieldName: string;
    fieldValue: string;
    units: string;
    query: string;
    queryOp: string;
    context?: SGroupContext;
    subtype?: string;
    class?: SUPERATOM_CLASS | string;
}
type AtomIdRemap = Record<number, number> | number[];
type StructAtomsAccess = Pick<Struct, 'atoms'>;
type StructBondsAccess = Pick<Struct, 'bonds'>;
type StructAtomsAndBondsAccess = Pick<Struct, 'atoms' | 'bonds'>;
export declare class SGroup {
    static readonly TYPES: {
        SUP: string;
        MUL: string;
        SRU: string;
        MON: string;
        MER: string;
        COP: string;
        CRO: string;
        MOD: string;
        GRA: string;
        COM: string;
        MIX: string;
        FOR: string;
        DAT: string;
        ANY: string;
        GEN: string;
        queryComponent: string;
        nucleotideComponent: string;
    };
    type: string;
    id: number;
    label: number;
    bracketBox: Box2Abs | null;
    bracketDirection: Vec2;
    areas: Box2Abs[];
    hover: boolean;
    hovering: unknown;
    selected: boolean;
    selectionPlate: unknown;
    atoms: number[];
    atomSet: Pile<number>;
    parentAtomSet: Pile<number>;
    patoms: number[] | null;
    allAtoms: boolean;
    bonds: number[];
    xBonds: number[];
    neiAtoms: number[];
    pp: Vec2 | null;
    data: SGroupData;
    dataArea: Box2Abs | null;
    functionalGroup: FunctionalGroup | undefined;
    private readonly attachmentPoints;
    constructor(type: string);
    getAttr(attr: string): unknown;
    setFunctionalGroup(functionalGroup: FunctionalGroup): void;
    getAttrs(): Record<string, unknown>;
    setAttr(attr: string, value: unknown): unknown;
    checkAttr(attr: string, value: unknown): boolean;
    updateOffset(offset: Vec2): void;
    isExpanded(): boolean;
    isContracted(): boolean;
    calculatePP(struct: Struct): void;
    isGroupAttached(struct: Struct): boolean;
    addAttachmentPoint(attachmentPoint: SGroupAttachmentPoint, validateUniqueness?: boolean): void;
    addAttachmentPoints(attachmentPoints: ReadonlyArray<SGroupAttachmentPoint> | SGroupAttachmentPoint[], validateUniqueness?: boolean): void;
    removeAttachmentPoint(attachmentPoint: SGroupAttachmentPoint): boolean;
    getAttachmentPoints(): ReadonlyArray<SGroupAttachmentPoint>;
    /**
     * Connection point - is not! the same as Attachment point.
     * Connection point is a fact for the sgroup - is the atom that has connected bond to an external atom.
     * So it doesn't matter how it happens (connection atom).
     * When we talk about "Attachment point" it is a hypothetical, suitable place to connect to sgroup.
     * But there are cases when sgroup doesn't have attachment points but have connection (read from external file)
     */
    private getConnectionPointsCount;
    isNotContractible(struct: Struct): boolean;
    /**
     * Why only one?
     * Currently other parts of application don't support several attachment points for sgroup.
     * So to support it - it's required to refactor almost every peace of code with sgroups.
     *
     *
     * Why return 'undefined' without fallback?
     * If sgroup doesn't have attachment points it can't be attached, (salt and solvents for example).
     */
    getAttachmentAtomId(): number | undefined;
    /**
     * WHY? atomId drives which atom renders the sgroup label; position is the visual
     * center used for movement, hit-testing and rendering. Keeping them separate lets
     * the label always float at the geometric center of all atoms regardless of which
     * atom happens to be the attachment point.
     */
    getContractedPosition(struct: Struct): {
        atomId: number;
        position: Vec2;
    };
    cloneAttachmentPoints(atomIdMap: Map<number, number>): ReadonlyArray<SGroupAttachmentPoint>;
    get isSuperatomWithoutLabel(): boolean;
    get isMonomer(): boolean;
    static getOffset(sgroup: SGroup): null | Vec2;
    static isSaltOrSolvent(moleculeName: string): boolean;
    static isAtomInSaltOrSolvent(atomId: number, sgroupsOnCanvas: SGroup[]): boolean;
    static isBondInSaltOrSolvent(bondId: number, sgroupsOnCanvas: SGroup[]): boolean;
    static filterAtoms(atoms: readonly number[] | null | undefined, map: AtomIdRemap): number[];
    static removeNegative(atoms: readonly number[]): number[];
    static filter(_mol: unknown, sg: SGroup, atomMap: AtomIdRemap): void;
    static clone(sgroup: SGroup, aidMap: Map<number, number>): SGroup;
    static addAtom(sgroup: SGroup, aid: number, struct: Struct): void;
    static removeAtom(sgroup: SGroup, aid: number): void;
    static getCrossBonds(mol: StructBondsAccess, parentAtomSet: Pile<number>): {
        [key: number]: Array<number>;
    };
    static bracketPos(sGroup: SGroup, mol: StructAtomsAccess, remol?: ReStruct, render?: Render): void;
    static getBracketParameters(mol: StructBondsAccess, crossBondsPerAtom: {
        [key: number]: Array<number>;
    }, atomSet: Pile<number>, bb: Box2Abs, d?: Vec2, n?: Vec2): SGroupBracketParams[];
    static getObjBBox(atoms: number[], mol: Struct, useCollapsedSgroupsPosition?: boolean): Box2Abs;
    static getAtoms(mol: StructAtomsAccess, sg: SGroup | undefined): number[];
    static getBonds(mol: StructAtomsAndBondsAccess, sg?: SGroup): number[];
    static prepareMulForSaving(sgroup: SGroup, mol: Struct): void;
    static getMassCentre(mol: StructAtomsAccess, atoms: readonly number[]): Vec2;
    static readonly isAtomInContractedSGroup: (atom: Atom, sGroups: Map<number, ReSGroup> | Pool<SGroup>) => boolean;
    static isBondInContractedSGroup(bond: Bond, sGroups: Map<number, ReSGroup> | Pool<SGroup>): boolean;
    static isSuperAtom(sGroup?: SGroup): boolean;
    static isDataSGroup(sGroup: SGroup): boolean;
    static isQuerySGroup(sGroup: SGroup): boolean;
    static isSRUSGroup(sGroup: SGroup): boolean;
    static isMulSGroup(sGroup: SGroup): boolean;
    static isCOPGroup(sGroup: SGroup): boolean;
}
export {};
