import type { Dispatch } from 'redux';
import type { IToolContext } from '../../editor/tool/IToolContext';
type TNewAction = {
    tool?: string;
    dialog?: string;
    opts?: any;
};
type HandleHotkeyOverItemProps = {
    hoveredItem: Record<string, number>;
    newAction: TNewAction;
    ctx: IToolContext;
    dispatch: Dispatch;
};
export declare function handleHotkeyOverItem(props: HandleHotkeyOverItemProps): any;
export {};
