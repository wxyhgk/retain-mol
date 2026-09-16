import { ReactElement } from 'react';
import { ItemParams } from 'react-contexify';
import { BaseMonomer, BaseSequenceItemRenderer, DeprecatedFlexModeOrSnakeModePolymerBondRenderer } from 'ketcher-core';
import { CONTEXT_MENU_ID } from 'components/contextMenu/types';
interface MenuItem {
    name: string;
    title?: string;
    separator?: boolean;
    icon?: ReactElement;
    disabled?: boolean | (({ props, }: {
        props?: {
            polymerBondRenderer?: DeprecatedFlexModeOrSnakeModePolymerBondRenderer;
            sequenceItemRenderer?: BaseSequenceItemRenderer;
            selectedMonomers?: BaseMonomer[];
        };
    }) => boolean);
    hidden?: boolean | (({ props, }: {
        props?: {
            polymerBondRenderer?: DeprecatedFlexModeOrSnakeModePolymerBondRenderer;
            sequenceItemRenderer?: BaseSequenceItemRenderer;
            selectedMonomers?: BaseMonomer[];
        };
    }) => boolean);
    isMenuTitle?: boolean;
    subMenuItems?: MenuItem[];
    onMouseOver?: (itemId: string) => void;
    onMouseOut?: (itemId: string) => void;
}
interface MenuProps {
    id: CONTEXT_MENU_ID;
    menuItems: MenuItem[];
    handleMenuChange: (params: ItemParams) => void;
}
export declare const ContextMenu: ({ id, handleMenuChange, menuItems }: MenuProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export {};
