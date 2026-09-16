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
type AtomToolProperties = Partial<AtomAttributes> & Pick<AtomAttributes, 'label'> & {
    type?: string;
};
type AtomToolContext = Pick<IToolContext, 'event' | 'findItem' | 'hover' | 'render' | 'selection' | 'struct' | 'update'> & {
    hoverIcon: {
        fill: string;
        label: string;
        hide(): void;
        show(): void;
        updatePosition(): void;
    };
};
declare class AtomTool implements Tool {
    #private;
    private readonly editor;
    private readonly atomProps;
    private dragCtx;
    isNotActiveTool: boolean | undefined;
    constructor(editor: AtomToolContext, atomProps: AtomToolProperties);
    mousedown(event: PointerEvent): void;
    mousemove(event: PointerEvent): void;
    mouseup(event: PointerEvent): void;
}
export declare function atomLongtapEvent(tool: any, render: any): void;
export default AtomTool;
