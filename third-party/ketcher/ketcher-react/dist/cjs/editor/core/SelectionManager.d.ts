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
import { type Action, type ReStruct, type Render, type RenderOptions, type Struct, type Vec2, IMAGE_KEY, MULTITAIL_ARROW_KEY } from 'ketcher-core';
import type { ClosestItemWithMap, MergeResult, SelectedItems, SkipItem } from '../shared/closest.types';
import type { HoverTarget } from '../tool/Tool';
export interface Selection {
    atoms?: Array<number>;
    bonds?: Array<number>;
    frags?: Array<number>;
    sgroups?: Array<number>;
    sgroupData?: Array<number>;
    rgroups?: Array<number>;
    enhancedFlags?: Array<number>;
    rxnPluses?: Array<number>;
    rxnArrows?: Array<number>;
    simpleObjects?: Array<number>;
    texts?: Array<number>;
    rgroupAttachmentPoints?: Array<number>;
    [IMAGE_KEY]?: Array<number>;
    [MULTITAIL_ARROW_KEY]?: Array<number>;
}
export interface ISelectionManager {
    replaceSilently(selection: Selection | null): void;
    selection(ci?: Selection | 'all' | 'descriptors' | null): Selection | null;
    explicitSelected(autoSelectBonds?: boolean): Selection;
    structSelected(existingSelection?: Selection, atomIdMap?: Map<number, number>, bondIdMap?: Map<number, number>): Struct;
    findItem(event: Event | MouseEvent | {
        clientX: number;
        clientY: number;
    }, maps: Array<string> | null, skip?: SkipItem | null): (ClosestItemWithMap & HoverTarget) | null;
    findMerge(srcItems: SelectedItems, maps?: string[]): MergeResult;
    alignDescriptors(): void;
}
export interface SelectionManagerDeps {
    getCtab: () => ReStruct;
    getRender: () => Render;
    getOptions: () => RenderOptions;
    dispatchSelectionChange: (sel: Selection | null) => void;
    onSelectAll: () => void;
    onSelectionCleared: () => void;
    requestUpdate: (force?: boolean, viewSz?: Vec2 | null) => void;
    update: (action: Action | true, ignoreHistory?: boolean) => void;
}
export declare class SelectionManager implements ISelectionManager {
    private readonly deps;
    private _selection;
    constructor(deps: SelectionManagerDeps);
    /** Restore only surviving runtime IDs without dispatching or rendering. */
    replaceSilently(selection: Selection | null): void;
    selection(ci?: Selection | 'all' | 'descriptors' | null): Selection | null;
    findItem(event: Event | MouseEvent | {
        clientX: number;
        clientY: number;
    }, maps: Array<string> | null, skip?: SkipItem | null): (ClosestItemWithMap & HoverTarget) | null;
    findMerge(srcItems: SelectedItems, maps?: string[]): MergeResult;
    explicitSelected(autoSelectBonds?: boolean): Selection;
    structSelected(existingSelection?: Selection, atomIdMap?: Map<number, number>, bondIdMap?: Map<number, number>): Struct;
    alignDescriptors(): void;
}
