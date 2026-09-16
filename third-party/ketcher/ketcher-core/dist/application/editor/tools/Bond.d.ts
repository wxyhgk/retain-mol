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
import type { CoreEditor } from '../../editor/Editor';
import type { BaseTool } from '../../editor/tools/Tool';
import type { BaseMonomer } from '../../../domain/entities/BaseMonomer';
import { AttachmentPointName, type MouseEventWithAttachmentPoint } from '../../../domain/types';
declare class PolymerBond implements BaseTool {
    private readonly editor;
    private bondRenderer?;
    private isBondConnectionModalOpen;
    private readonly history;
    private readonly bondType;
    constructor(editor: CoreEditor, ...args: unknown[]);
    get isHydrogenBond(): boolean;
    mouseDownAttachmentPoint(event: MouseEventWithAttachmentPoint): void;
    private removeBond;
    mousedown(event: MouseEvent): void;
    mousemove(): void;
    mouseLeavePolymerBond(event: MouseEvent): void;
    mouseOverPolymerBond(event: MouseEvent): void;
    mouseOverMonomer(event: MouseEvent): void;
    mouseOverAttachmentPoint(event: MouseEventWithAttachmentPoint): void;
    mouseLeaveMonomer(event: MouseEvent): void;
    mouseLeaveAttachmentPoint(event: MouseEvent): void;
    mouseUpAttachmentPoint(event: MouseEventWithAttachmentPoint): void;
    private finishBondCreation;
    mouseup(): void;
    mouseUpMonomer(event: MouseEvent): void;
    mouseUpAtom(event: MouseEvent): void;
    handleBondCreation: (payload: {
        firstMonomer: BaseMonomer;
        secondMonomer: BaseMonomer;
        firstSelectedAttachmentPoint: AttachmentPointName;
        secondSelectedAttachmentPoint: AttachmentPointName;
    }) => void;
    handleBondCreationCancellation: (secondMonomer: BaseMonomer) => void;
    destroy(): void;
    private shouldInvokeModal;
}
export { PolymerBond };
