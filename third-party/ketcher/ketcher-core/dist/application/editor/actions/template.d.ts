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
import { Vec2 } from '../../../domain/entities/vec2';
import { Action } from './action';
import { type CreatedItems } from './paste';
import type { ReStruct } from '../../render';
export declare function fromTemplateOnCanvas(restruct: ReStruct, template: any, pos: Vec2, angle?: number, isPreview?: boolean): [Action, {
    atoms: number[];
    bonds: number[];
}, CreatedItems];
export declare function fromTemplateOnAtom(restruct: any, template: any, aid: any, angle: any, extraBond: any, isPreview?: boolean): [Action, {
    atoms: number[];
    bonds: number[];
}];
type FromTemplateOnBondResult = [Action, {
    atoms: number[];
    bonds: number[];
}];
export declare function fromTemplateOnBondAction(restruct: any, template: any, bid: any, events: any, flip: any, force: false, isPreview?: boolean): FromTemplateOnBondResult;
export declare function fromTemplateOnBondAction(restruct: any, template: any, bid: any, events: any, flip: any, force: true, isPreview?: boolean): Promise<FromTemplateOnBondResult>;
export {};
