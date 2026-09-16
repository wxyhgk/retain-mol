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
import { Atom } from '../../../entities/atom';
import { SGroup } from '../../../entities/sgroup';
import { Struct } from '../../../entities/struct';
export declare function toRlabel(values: any): number;
export declare function moleculeToStruct(ketItem: any): Struct;
export declare function rglabelToStruct(source: any): Atom;
export declare function sgroupToStruct(source: any): SGroup;
