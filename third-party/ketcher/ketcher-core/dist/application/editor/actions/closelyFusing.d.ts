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
import { Action } from './action';
import type { Struct } from '../../../domain/entities/struct';
export interface FuseMergeCandidates {
    atoms: ReadonlyMap<number, number>;
    bonds: ReadonlyMap<number, number>;
    atomToFunctionalGroup: ReadonlyMap<number, number>;
}
export interface ItemsToFuse {
    atoms: Map<number, number>;
    bonds: Map<number, number>;
    atomToFunctionalGroup: Map<number, number>;
}
export declare function fromItemsFuse(restruct: any, items: any): Action;
export declare function getItemsToFuse(struct: Struct, mergeCandidates: FuseMergeCandidates): ItemsToFuse | null;
export declare function getHoverToFuse(items: any): {
    map: string;
    id: number;
    items: any;
} | null;
export declare function mergeMapOfItemsToSet(items: Map<number, number>): Set<number>;
