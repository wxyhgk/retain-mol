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
import { Pile } from './pile';
import { SGroup } from './sgroup';
import type { Struct } from './struct';
export declare class SGroupForest {
    /** node id -> parent id */
    parent: Map<number, number>;
    /** node id -> list of child ids */
    children: Map<number, number[]>;
    atomSets: Map<number, Pile<number>>;
    constructor();
    /** returns an array or s-group ids in the order of breadth-first search */
    getSGroupsBFS(): number[];
    getAtomSetRelations(newId: number, atoms: Pile<number>): {
        children: number[];
        parent: number;
    };
    getPathToRoot(sgid: number): number[];
    insert({ id, atoms }: Pick<SGroup, 'id' | 'atoms'>, parent?: number, children?: number[]): {
        parent: number;
        children: number[];
    };
    private resetParentLink;
    remove(id: number): void;
}
export declare function checkOverlapping(struct: Struct, sGroupType: 'queryComponent' | 'common', atoms?: number[]): boolean;
