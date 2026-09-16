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
import type { RGroup } from '../../../domain/entities/rgroup';
import ReObject from './reobject';
import type ReStruct from './restruct';
import type { Render } from '../raphaelRender';
import type { RenderOptions } from '../render.types';
declare class ReRGroup extends ReObject {
    labelBox: Box2Abs | null;
    item: RGroup;
    constructor(rgroup: RGroup);
    static isSelectable(): boolean;
    getAtoms(render: Render): number[];
    getBonds(render: Render): number[];
    calcBBox(render: Render): Box2Abs | null;
    draw(render: Render, options: RenderOptions): {
        data: unknown[];
    };
    _draw(render: Render, _rgid: number, attrs: Record<string, unknown>): any;
    drawHover(render: Render): any;
    show(restruct: ReStruct, _id: number, options: RenderOptions): void;
}
export default ReRGroup;
