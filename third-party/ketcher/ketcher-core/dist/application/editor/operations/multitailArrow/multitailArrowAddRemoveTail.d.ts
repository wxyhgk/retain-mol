import { BaseOperation } from '../../../editor/operations/BaseOperation';
import type { ReStruct } from '../../../render';
import type { FixedPrecisionCoordinates } from '../../../../domain/entities/fixedPrecision';
export declare class MultitailArrowAddTail extends BaseOperation {
    private readonly itemId;
    private tailId?;
    private readonly coordinate?;
    constructor(itemId: number, tailId?: number | undefined, coordinate?: FixedPrecisionCoordinates | undefined);
    execute(reStruct: ReStruct): void;
    invert(): MultitailArrowRemoveTail;
}
export declare class MultitailArrowRemoveTail extends BaseOperation {
    private readonly itemId;
    private readonly tailId;
    private coordinate?;
    constructor(itemId: number, tailId: number);
    execute(reStruct: ReStruct): void;
    invert(): BaseOperation;
}
