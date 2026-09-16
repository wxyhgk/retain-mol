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
import { BaseOperation } from './BaseOperation';
import type { ReStruct } from '../../render';
declare class RestoreIfThen extends BaseOperation {
    readonly rgid_new: number;
    readonly rgid_old: number;
    readonly ifThenHistory: Map<number, number>;
    static InverseConstructor: new (rgNew: number, rgOld: number, skipRgids?: Array<number>) => BaseOperation;
    constructor(rgNew: number, rgOld: number, history: Map<number, number>);
    execute(restruct: ReStruct): void;
    invert(): BaseOperation<unknown>;
}
export { RestoreIfThen };
