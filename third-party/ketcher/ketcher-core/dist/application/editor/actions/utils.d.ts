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
import { type AtomAttributes, type AtomQueryProperties } from '../../../domain/entities/atom';
import { Bond, type BondAttributes } from '../../../domain/entities/bond';
import type { SGroup } from '../../../domain/entities/sgroup';
import type { Struct } from '../../../domain/entities/struct';
import { Vec2 } from '../../../domain/entities/vec2';
import type { ReStruct } from '../../render';
import { selectionKeys } from '../shared/constants';
import type { EditorSelection } from '../editor.types';
export type AtomType = 'single' | 'list' | 'pseudo';
export type AtomAttributeName = keyof AtomAttributes;
export type AtomQueryPropertiesName = keyof AtomQueryProperties;
export type AtomAllAttributeName = AtomAttributeName | AtomQueryPropertiesName;
export type AtomAllAttributeValue = AtomAttributes[AtomAttributeName] | AtomQueryProperties[AtomQueryPropertiesName];
type NormalizedEditorSelection = Record<typeof selectionKeys[number], number[]>;
type AtomForNewBondResult = {
    atom: number | AtomAttributes;
    pos: Vec2;
};
export declare function atomGetAttr(restruct: ReStruct, aid: number, name: AtomAttributeName): string | number | boolean | import("../../..").AtomList | Vec2 | AtomQueryProperties | null | undefined;
export declare function atomGetDegree(restruct: ReStruct, aid: number): number;
export declare function atomGetSGroups(restruct: ReStruct, atomId: number): number[];
export declare function atomGetPos(restruct: ReStruct, id: number): Vec2;
export declare function findStereoAtoms(struct: Struct, atomIds: number[] | undefined): number[];
export declare function structSelection(struct: Struct): EditorSelection;
export declare function getSelectionFromStruct(struct: Struct): EditorSelection;
export declare function formatSelection(selection: EditorSelection): NormalizedEditorSelection;
export declare function atomForNewBond(restruct: ReStruct, atom: number | AtomAttributes, bond?: Partial<BondAttributes>): AtomForNewBondResult;
export declare function getRelSGroupsBySelection(struct: Struct, selectedAtoms: number[]): Set<SGroup>;
export declare function isAttachmentBond({ begin, end }: Bond, selection: EditorSelection): boolean;
export {};
