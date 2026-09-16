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
import { Action } from './action';
import type { Struct } from '../../../domain/entities/struct';
import type { ReStruct } from '../../render';
/** Get action applied {@link struct} to {@link restruct}. */
export declare function fromNewCanvas(restruct: ReStruct, struct: Struct): Action;
export declare function fromDescriptorsAlign(restruct: any): Action;
