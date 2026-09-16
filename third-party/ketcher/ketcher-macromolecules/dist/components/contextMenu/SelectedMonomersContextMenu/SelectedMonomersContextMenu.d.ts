import { BaseMonomer } from 'ketcher-core';
import { PointerEvent } from 'react';
type SelectedMonomersContextMenuType = {
    selectedMonomers?: BaseMonomer[];
    contextMenuEvent?: PointerEvent;
    isPasteAvailable?: boolean;
};
export declare const SelectedMonomersContextMenu: ({ selectedMonomers: _selectedMonomers, contextMenuEvent, isPasteAvailable, }: SelectedMonomersContextMenuType) => import("react").ReactPortal | null;
export {};
