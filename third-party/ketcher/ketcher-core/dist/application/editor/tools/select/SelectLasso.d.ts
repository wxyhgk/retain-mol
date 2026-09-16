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
import { SelectBase } from '../../../editor/tools/select/SelectBase';
import type { CoreEditor } from '../../../editor';
import type { SelectionLassoViewParams } from '../../../render/renderers/TransientView';
export declare class SelectLasso extends SelectBase {
    readonly editor: CoreEditor;
    selectionViewParams: SelectionLassoViewParams;
    constructor(editor: CoreEditor);
    protected createSelectionView(): void;
    protected updateSelectionViewParams(): void;
    protected onSelectionMove(isShiftPressed: boolean): void;
}
