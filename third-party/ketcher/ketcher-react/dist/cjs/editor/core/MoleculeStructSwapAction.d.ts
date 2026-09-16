import { Action, type ReStruct } from 'ketcher-core';
/** The installation callback owns synchronous render/selection rollback. */
export declare class MoleculeStructSwapAction extends Action {
    private readonly swap;
    private inverseAction?;
    constructor(swap: () => MoleculeStructSwapAction);
    perform(_restruct: ReStruct): Action;
    isDummy(): boolean;
}
