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
import { type RxnArrowMode, type SimpleObjectMode, OperationType } from 'ketcher-core';
type OperationTypeValue = typeof OperationType[keyof typeof OperationType];
type Position = {
    x: number;
    y: number;
};
type ArrowPosition = [Position, Position];
export type ChangeEventData = {
    operation: OperationTypeValue;
    id?: number;
    label?: string;
    position?: Position | ArrowPosition;
    attribute?: string;
    from?: unknown;
    to?: unknown;
    atomId?: number;
    fragId?: number;
    sGroupId?: number;
    type?: string;
    mode?: RxnArrowMode | SimpleObjectMode;
};
export declare function customOnChangeHandler(action: any, handler: any): any;
export {};
