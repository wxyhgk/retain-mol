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
import { BaseOperation } from '../BaseOperation';
import type { ReStruct } from '../../../render';
import type { RGroup, RGroupAttributes } from '../../../../domain/entities/rgroup';
export type RGroupAttributeKey = keyof RGroupAttributes;
type Data<K extends RGroupAttributeKey = RGroupAttributeKey> = {
    rgid?: number;
    attribute?: K;
    value?: RGroup[K];
};
export declare class RGroupAttr<K extends RGroupAttributeKey = RGroupAttributeKey> extends BaseOperation {
    data: Data<K> | null;
    data2: Data<K> | null;
    constructor(rgroupId?: number, attribute?: K, value?: RGroup[K]);
    execute(restruct: ReStruct): void;
    invert(): RGroupAttr<K>;
    isDummy(restruct: ReStruct): boolean;
}
export {};
