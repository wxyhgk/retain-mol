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
import { type AtomAttributes } from 'ketcher-core';
import type { IToolContext } from './IToolContext';
import type { Tool } from './Tool';
type RGroupAtomDialogInput = {
    fragId: number | null;
    label: string;
    rglabel: number | null;
};
type RGroupAtomToolContext = Omit<Pick<IToolContext, 'event' | 'findItem' | 'hover' | 'render' | 'selection' | 'update'>, 'event'> & {
    event: Pick<IToolContext['event'], 'removeFG'> & {
        elementEdit: {
            dispatch(payload: RGroupAtomDialogInput): Promise<Partial<AtomAttributes>>;
        };
    };
};
declare class RGroupAtomTool implements Tool {
    private readonly editor;
    constructor(editor: RGroupAtomToolContext);
    mousemove(event: PointerEvent): void;
    click(event: PointerEvent): true | undefined;
}
export default RGroupAtomTool;
