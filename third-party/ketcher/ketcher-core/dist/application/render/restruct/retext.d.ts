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
import type { Text } from '../../../domain/entities/text';
import { Vec2 } from '../../../domain/entities/vec2';
import ReObject from './reobject';
import type ReStruct from './restruct';
import type { RaphaelBaseElement } from 'raphael';
export interface SerializedTextNode {
    detail?: number;
    format: number;
    mode?: string;
    style: string;
    text: string;
    type: string;
    version?: number;
}
export interface SerializedParagraphNode {
    children: Array<SerializedTextNode | {
        type: string;
    }>;
    direction?: string;
    format?: string | number;
    indent?: number;
    type: string;
    version?: number;
}
export interface SerializedRootNode {
    children: Array<SerializedParagraphNode>;
    direction?: string;
    format?: string | number;
    indent?: number;
    type: string;
    version?: number;
}
export interface SerializedEditorState {
    root: SerializedRootNode;
}
declare class ReText extends ReObject {
    private readonly item;
    paths: Array<Array<RaphaelBaseElement>>;
    constructor(text: Text);
    static isSelectable(): boolean;
    getReferencePoints(): Array<Vec2>;
    getVBoxObj(): Box2Abs;
    hoverPath(render: any): any;
    getRelBox(paths: Array<Array<RaphaelBaseElement>>): {
        p0: Vec2;
        p1: Vec2;
    };
    getRowWidth(row: Array<RaphaelBaseElement>): number;
    drawHover(render: any): any;
    makeSelectionPlate(restruct: ReStruct, paper: any, options: any): any;
    show(restruct: ReStruct, _id: number, options: any): void;
    getStylesFromTextNode(textNode: SerializedTextNode, options: any): Record<string, any>;
}
export default ReText;
