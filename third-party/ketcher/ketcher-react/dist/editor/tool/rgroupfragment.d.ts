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
import { type RGroupAttributes } from 'ketcher-core';
import type { IToolContext } from './IToolContext';
import type { Tool } from './Tool';
type RGroupDialogInput = RGroupAttributes & {
    fragId?: number;
    label: number | null;
};
type RGroupDialogResult = RGroupAttributes & {
    label: number;
};
type RGroupFragmentToolContext = Omit<Pick<IToolContext, 'event' | 'findItem' | 'hover' | 'render' | 'selection' | 'update'>, 'event'> & {
    event: Pick<IToolContext['event'], 'editMonomer' | 'removeFG'> & {
        rgroupEdit: {
            dispatch(payload: RGroupDialogInput): Promise<RGroupDialogResult>;
        };
    };
};
declare class RGroupFragmentTool implements Tool {
    private readonly editor;
    constructor(editor: RGroupFragmentToolContext);
    mousemove(event: PointerEvent): void;
    click(event: PointerEvent): true | undefined;
    cancel(): void;
}
export default RGroupFragmentTool;
