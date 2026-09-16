import { BaseOperation } from '../BaseOperation';
import type { ReStruct } from '../../../render';
import type { SGroupAttachmentPoint } from '../../../../domain/entities/sGroupAttachmentPoint';
type Data = {
    sGroupId: number;
    attachmentPoint: SGroupAttachmentPoint;
};
export declare class SGroupAttachmentPointAdd extends BaseOperation {
    readonly data: Data;
    constructor(sGroupId: number, attachmentPoint: SGroupAttachmentPoint);
    execute(restruct: ReStruct): void;
    invert(): SGroupAttachmentPointRemove;
}
export declare class SGroupAttachmentPointRemove extends BaseOperation {
    readonly data: Data;
    constructor(sGroupId: number, attachmentPoint: SGroupAttachmentPoint);
    execute(restruct: ReStruct): void;
    invert(): SGroupAttachmentPointAdd;
}
export {};
