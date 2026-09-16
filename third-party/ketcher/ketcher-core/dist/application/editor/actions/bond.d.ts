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
import type { AtomAttributes } from '../../../domain/entities/atom';
import { type BondAttributes, Bond } from '../../../domain/entities/bond';
import type { Vec2 } from '../../../domain/entities/vec2';
import { Action } from './action';
import type { ReSGroup, ReStruct } from '../../render';
export declare function fromBondAddition(reStruct: ReStruct, bond: Partial<BondAttributes>, begin: number | AtomAttributes, end: number | AtomAttributes, beginAtomPos?: Vec2, endAtomPos?: Vec2): [Action, number, number, number];
export declare function fromBondsAttrs(restruct: ReStruct, ids: Array<number> | number, attrs: Partial<Bond>, reset?: boolean): Action;
export declare function fromBondsMerge(restruct: ReStruct, mergeMap: Map<number, number>): Action;
export declare function fromBondFlipping(restruct: ReStruct, id: number): Action;
export declare function bondChangingAction(restruct: ReStruct, itemID: number, bond: Bond, bondProps: Partial<BondAttributes>): Action;
export declare function removeAttachmentPointFromSuperatom(sgroup: ReSGroup, beginAtomId: number | undefined, endAtomId: number | undefined, action: Action, restruct: ReStruct): void;
