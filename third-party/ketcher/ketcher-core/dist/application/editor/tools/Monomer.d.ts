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
import type { BaseTool } from '../../editor/tools/Tool';
import type { CoreEditor } from '../../editor/Editor';
import { EditorHistory } from '../../editor/internal';
declare class MonomerTool implements BaseTool {
    private readonly editor;
    private monomerPreview;
    private monomerPreviewRenderer;
    readonly MONOMER_PREVIEW_SCALE_FACTOR = 0.8;
    readonly MONOMER_PREVIEW_OFFSET_X = 30;
    readonly MONOMER_PREVIEW_OFFSET_Y = 30;
    history: EditorHistory;
    private readonly monomer;
    constructor(editor: CoreEditor, ...args: unknown[]);
    mousedown(): void;
    mousemove(): void;
    mouseLeaveClientArea(): void;
    mouseover(): void;
    hidePreview(): void;
    destroy(): void;
}
export { MonomerTool };
