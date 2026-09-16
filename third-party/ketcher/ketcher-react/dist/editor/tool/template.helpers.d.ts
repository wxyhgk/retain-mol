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
import { type Bond, type ReStruct, type Struct, Vec2 } from 'ketcher-core';
import type { ClosestItemWithMap } from '../shared/closest.types';
import type { Sign } from './template.types';
export declare function getSign(molecule: Struct, bond: Bond, v: Vec2): Sign;
export declare function getBondFlipSign(struct: Struct, bond: Bond): 1 | -1;
export declare function getAngleFromEvent(event: MouseEvent | PointerEvent | undefined, ci: Pick<ClosestItemWithMap, 'id'>, restruct: ReStruct): any;
