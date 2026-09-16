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
import type { IToolContext } from './IToolContext';
import type { Tool } from './Tool';
type SGroupDialogContext = Pick<IToolContext, 'render' | 'selection' | 'event' | 'errorHandler' | 'update'>;
type SGroupToolContext = Pick<IToolContext, 'errorHandler' | 'event' | 'findItem' | 'hover' | 'render' | 'rotateController' | 'selection' | 'update'>;
declare class SGroupTool implements Tool {
    private readonly editor;
    private readonly lassoHelper;
    isNotActiveTool: boolean | undefined;
    constructor(editor: SGroupToolContext);
    checkSelection(): void;
    mousedown(event: MouseEvent): void;
    mousemove(event: PointerEvent): void;
    mouseleave(_event: MouseEvent): void;
    private isContractedFunctionalGroupClicked;
    private processSelectedAtoms;
    private getActualSgroupId;
    private isAtomInContractedGroup;
    private addContractedGroupToSelection;
    private processSelectedBonds;
    private expandFunctionalGroupSelection;
    private expandAtomsToFunctionalGroups;
    private expandBondsToFunctionalGroups;
    private collectFunctionalGroupIds;
    private collectFunctionalGroupIdsFromAtoms;
    private collectFunctionalGroupIdsFromBonds;
    private shouldRemoveSingleFunctionalGroup;
    private determineSelection;
    private handleLassoSelection;
    private handleClickSelection;
    private shouldOpenDialog;
    mouseup(event: any): void;
    cancel(): void;
    static sgroupDialog(editor: SGroupDialogContext, id: number | null): Promise<void>;
}
export default SGroupTool;
