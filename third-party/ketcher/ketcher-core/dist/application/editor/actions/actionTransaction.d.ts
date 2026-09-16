/****************************************************************************
 * Copyright 2026 EPAM Systems
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
import type { ReStruct } from '../../render';
import type { BaseOperation } from '../operations/BaseOperation';
import { Action } from './action';
export declare class ActionTransaction {
    #private;
    constructor(restruct: ReStruct);
    capture(action: Action): Action;
    capture<TOperation extends BaseOperation>(inverseOperation: TOperation): TOperation;
    commit(): Action;
    rollback(): void;
    rollback(cause: unknown): never;
    private assertActive;
}
export declare function runActionTransaction(restruct: ReStruct, callback: (transaction: ActionTransaction) => unknown): Action;
