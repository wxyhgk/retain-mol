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
import BaseOperation from '../../../editor/operations/BaseOperation';
import type { ReStruct } from '../../../render';
import type { FlipDirection } from '../../../editor/shared/utils.types';
type FlipMonomerData = {
    id: number;
    value: FlipDirection | null;
    rotate?: number;
};
export declare class FlipMonomerOperation extends BaseOperation {
    readonly data: FlipMonomerData;
    private previousValue;
    private previousRotate;
    constructor(data: FlipMonomerData);
    execute(_restruct: ReStruct): void;
    invert(): FlipMonomerOperation;
}
export {};
