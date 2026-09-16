import { AnyAction, Dispatch } from 'redux';
import { CoreEditor } from 'ketcher-core';
export declare const resetRnaBuilder: (dispatch: Dispatch<AnyAction>) => void;
export declare const resetRnaBuilderAfterSequenceUpdate: (dispatch: Dispatch<AnyAction>, editor: CoreEditor | undefined) => void;
