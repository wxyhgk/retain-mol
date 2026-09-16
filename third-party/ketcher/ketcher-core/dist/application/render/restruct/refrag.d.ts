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
import { Box2Abs } from '../../../domain/entities/box2Abs';
import type { Fragment } from '../../../domain/entities/fragment';
import ReObject from './reobject';
import type ReStruct from './restruct';
import type { Render } from '../raphaelRender';
declare class ReFrag extends ReObject {
    item: Fragment;
    constructor(frag: Fragment);
    static isSelectable(): boolean;
    fragGetAtoms(restruct: ReStruct, fid: number): number[];
    fragGetBonds(restruct: ReStruct, fid: number): number[];
    calcBBox(restruct: ReStruct, fid: number, render?: Render): Box2Abs | undefined;
    _draw(render: Render, fid: number, attrs: Record<string, unknown>): any;
    draw(_render: Render): null;
    drawHover(_render: Render): void;
    setHover(hover: boolean, render: Render): void;
}
export default ReFrag;
