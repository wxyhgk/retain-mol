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
import { type ReStruct, type RenderOptions, Vec2 } from 'ketcher-core';
import type { ClosestItemWithMap, MergeResult, SelectedItems, SkipItem } from './closest.types';
type ClosestFunctionOptions = RenderOptions & {
    showStereoFlags?: boolean;
};
declare function findClosestAtom(restruct: ReStruct, pos: Vec2, skip: SkipItem | null, minDist: number | null): {
    id: never;
    dist: number;
} | null;
declare function findClosestItem(restruct: ReStruct, pos: Vec2, maps: string[] | null | undefined, skip: SkipItem | null, options: ClosestFunctionOptions): ClosestItemWithMap | null;
/**
 * @param restruct { ReStruct }
 * @param selected { object }
 * @param maps { Array<string> }
 * @param options { RenderOption }
 * @return {{
 * 		atoms: Map<number, number>?
 * 		bonds: Map<number, number>?
 *    atomToFunctionalGroup: Map<number, number>?
 * }}
 */
declare function findCloseMerge(restruct: ReStruct, selected: SelectedItems, options: ClosestFunctionOptions, maps?: string[]): MergeResult & {
    [key: string]: Map<number, number>;
};
declare const _default: {
    atom: typeof findClosestAtom;
    item: typeof findClosestItem;
    merge: typeof findCloseMerge;
};
export default _default;
