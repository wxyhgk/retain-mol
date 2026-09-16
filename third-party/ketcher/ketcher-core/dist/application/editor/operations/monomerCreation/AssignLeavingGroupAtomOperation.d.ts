import { BaseOperation } from '../../../editor/operations/BaseOperation';
import type { MonomerCreationState, ReStruct } from '../../../render';
import type { AttachmentPointName } from '../../../../domain/types';
import type Restruct from '../../../render/restruct/restruct';
export declare class RemoveAttachmentPointOperation extends BaseOperation {
    private readonly monomerCreationState;
    private readonly attachmentPointName;
    private readonly potentialLeavingAtoms?;
    private readonly _assignedAttachmentPoints?;
    private readonly atomPair;
    private readonly assignedAttachmentPoints;
    constructor(monomerCreationState: MonomerCreationState, attachmentPointName: AttachmentPointName, potentialLeavingAtoms?: Set<number> | undefined, _assignedAttachmentPoints?: Map<AttachmentPointName, [number, number]> | undefined);
    execute(restruct: Restruct): void;
    invert(): AssignLeavingGroupAtomOperation;
}
export declare class AssignLeavingGroupAtomOperation extends BaseOperation {
    private readonly monomerCreationState;
    private readonly atomId;
    private attachmentPointName;
    private potentialLeavingAtoms;
    constructor(monomerCreationState: MonomerCreationState, atomId: number);
    execute(restruct: ReStruct): void;
    invert(): RemoveAttachmentPointOperation;
}
