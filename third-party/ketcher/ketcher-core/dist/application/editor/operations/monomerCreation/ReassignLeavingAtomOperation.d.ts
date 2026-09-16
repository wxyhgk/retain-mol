import { BaseOperation } from '../../../editor/operations/BaseOperation';
import type { MonomerCreationState, ReStruct } from '../../../render';
import type { AttachmentPointName } from '../../../../domain/types';
export declare class ReassignLeavingAtomOperation extends BaseOperation {
    private monomerCreationState;
    private readonly attachmentPointName;
    private readonly attachmentAtomId;
    private readonly newLeavingAtomId;
    private readonly previousLeavingAtomId;
    constructor(monomerCreationState: MonomerCreationState, attachmentPointName: AttachmentPointName, attachmentAtomId: number, newLeavingAtomId: number, previousLeavingAtomId: number);
    execute(restruct: ReStruct): void;
    invert(): BaseOperation;
    isDummy(): boolean;
}
