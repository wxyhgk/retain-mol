import { BaseOperation } from '../../../editor/operations/BaseOperation';
import type { MultitailArrow } from '../../../../domain/entities/multitailArrow';
import { type ReStruct } from '../../../render';
interface MultitailArrowUpsertData {
    id?: number;
    arrowId?: number;
}
interface MultitailArrowDeleteData {
    id: number;
    arrowId?: number;
}
export declare class MultitailArrowUpsert extends BaseOperation<MultitailArrowUpsertData> {
    private readonly multitailArrow;
    readonly data: MultitailArrowUpsertData;
    constructor(multitailArrow: MultitailArrow, id?: number, arrowId?: number);
    execute(reStruct: ReStruct): void;
    invert(): MultitailArrowDelete;
}
export declare class MultitailArrowDelete extends BaseOperation<MultitailArrowDeleteData> {
    private multitailArrow?;
    readonly data: MultitailArrowDeleteData;
    constructor(id: number);
    execute(reStruct: ReStruct): void;
    invert(): BaseOperation;
}
export {};
