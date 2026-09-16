import { BaseOperation } from '../../../editor/operations/BaseOperation';
import type { MonomerCreationState, ReStruct } from '../../../render';
import type { AttachmentPointName } from '../../../../domain/types';
export declare class AssignAttachmentAtomOperation extends BaseOperation {
    private readonly monomerCreationState;
    private readonly attachmentAtomId;
    private readonly leavingAtomId;
    private readonly _attachmentPointName?;
    private readonly _assignedAttachmentPoints?;
    private attachmentPointName;
    private assignedAttachmentPoints;
    constructor(monomerCreationState: MonomerCreationState, attachmentAtomId: number, leavingAtomId: number, _attachmentPointName?: AttachmentPointName | undefined, _assignedAttachmentPoints?: Map<AttachmentPointName, [number, number]> | undefined);
    execute(restruct: ReStruct): void;
    invert(): BaseOperation;
}
