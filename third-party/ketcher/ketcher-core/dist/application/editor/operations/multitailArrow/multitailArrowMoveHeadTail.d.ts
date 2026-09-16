import { BaseOperation } from '../../../editor/operations/BaseOperation';
import { type ReStruct } from '../../../render';
export declare class MultitailArrowMoveHeadTail extends BaseOperation {
    private readonly id;
    private offset;
    private readonly name;
    private readonly tailId;
    private readonly normalize?;
    constructor(id: number, offset: number, name: string, tailId: number | null, normalize?: true | undefined);
    execute(reStruct: ReStruct): void;
    invert(): BaseOperation;
}
