import { type ReStruct } from '../../../render';
import { type RGroupAttachmentPointType } from '../../../../domain/entities';
import BaseOperation from '../BaseOperation';
type Data = {
    atomId: number;
    attachmentPointType: RGroupAttachmentPointType;
    attachmentPointId?: number;
};
declare class RGroupAttachmentPointAdd extends BaseOperation {
    readonly data: Data;
    constructor(data?: Data);
    execute(restruct: ReStruct): void;
    invert(): BaseOperation<unknown>;
}
export { RGroupAttachmentPointAdd };
