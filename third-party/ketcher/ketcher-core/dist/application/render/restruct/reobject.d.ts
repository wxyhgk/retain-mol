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
import type { Box2Abs } from '../../../domain/entities/box2Abs';
import type ReStruct from './restruct';
import type { Render } from '../raphaelRender';
import type { RenderOptions } from '../render.types';
import type { Element, RaphaelPaper, RaphaelSet } from 'raphael';
import Visel from './visel';
declare class ReObject {
    visel: Visel;
    hover: boolean;
    hovering: RaphaelSet | Element | null;
    selected: boolean;
    selectionPlate: RaphaelSet | Element | null;
    constructor(viselType: string);
    changeSelectionStyle(options: RenderOptions, drawOutline?: boolean): void;
    getVBoxObj(render: Render): Box2Abs | null;
    setHover(hover: boolean, render: Render, drawOutline?: boolean): void;
    drawHover(_render: Render, _drawOutline?: boolean): RaphaelSet | Element | void;
    makeSelectionPlate(_restruct: ReStruct, _paper: RaphaelPaper, _styles: RenderOptions): RaphaelSet | Element | null;
}
export default ReObject;
