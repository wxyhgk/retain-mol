import { SGroup, Struct } from 'ketcher-core';
export declare const TOOLTIP_DELAY = 300;
type InfoPanelData = {
    groupStruct: Struct;
    sGroup: SGroup;
    event: PointerEvent;
};
export interface FunctionalGroupsTooltipContext {
    event: {
        showInfo: {
            dispatch(payload: InfoPanelData | null): unknown;
        };
    };
    findItem(event: Event, maps: string[] | null): {
        id: number;
    } | null;
    struct(): Struct;
}
export declare function setFunctionalGroupsTooltip({ editor, event, isShow, }: {
    editor: FunctionalGroupsTooltipContext;
    event?: PointerEvent;
    isShow: boolean;
}): void;
export {};
