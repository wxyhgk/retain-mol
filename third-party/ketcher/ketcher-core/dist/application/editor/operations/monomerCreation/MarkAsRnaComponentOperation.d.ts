import { BaseOperation } from '../../../editor/operations/BaseOperation';
import type ReStruct from '../../../render/restruct/restruct';
import type { MonomerCreationState } from '../../../render';
import { type RnaPresetComponentKey } from '../../../editor/shared/customEvents';
export declare class MarkAsRnaComponentOperation extends BaseOperation {
    private readonly monomerCreationState;
    private readonly componentKey;
    private readonly newAtomIds;
    private readonly newBondIds;
    private readonly prevAtomIds;
    private readonly prevBondIds;
    constructor(monomerCreationState: MonomerCreationState, componentKey: RnaPresetComponentKey, newAtomIds: number[], newBondIds: number[], prevAtomIds: number[], prevBondIds: number[]);
    execute(_restruct: ReStruct): void;
    invert(): BaseOperation;
}
