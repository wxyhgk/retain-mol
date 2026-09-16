import type { ReStruct } from '../../../render';
import BaseOperation from '../BaseOperation';
type Data = {
    atomId: number;
    attachmentPointType: any;
    attachmentPointId: number;
};
declare class RGroupAttachmentPointRemove extends BaseOperation {
    readonly data: Data;
    constructor(attachmentPointId?: number);
    execute(restruct: ReStruct): void;
}
export { RGroupAttachmentPointRemove };
