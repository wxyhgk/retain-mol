import { BaseOperation } from '../../../editor/operations/BaseOperation';
import type { ReStruct } from '../../../render';
export declare class MultitailArrowResizeTailHead extends BaseOperation {
    private readonly id;
    private offset;
    private readonly isHead;
    constructor(id: number, offset: number, isHead: boolean);
    execute(reStruct: ReStruct): void;
    invert(): BaseOperation;
}
