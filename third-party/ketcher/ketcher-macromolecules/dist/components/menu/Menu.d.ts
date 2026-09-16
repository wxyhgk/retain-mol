/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/
import React from 'react';
import { MenuContext } from '../../contexts';
import { GroupProps, MenuProps } from './types';
declare const Menu: {
    ({ children, onItemClick, activeMenuItems, testId, isHorizontal, }: React.PropsWithChildren<MenuProps>): import("@emotion/react/jsx-runtime").JSX.Element;
    Group: ({ children, divider, isHorizontal, }: React.PropsWithChildren<GroupProps>) => import("@emotion/react/jsx-runtime").JSX.Element;
    Item: ({ itemId, title, disabled, testId, onClick, type, }: {
        itemId: import("../..").MacromoleculesIconName;
        title?: string;
        testId?: string;
        disabled?: boolean;
        onClick?: () => void;
        type?: "icon-button" | "button";
    }) => import("@emotion/react/jsx-runtime").JSX.Element;
    Submenu: ({ children, vertical, autoSize, disabled, needOpenByMenuItemClick, testId, layoutModeButton, generalTitle, activeItem, subMenuId, }: React.PropsWithChildren<{
        vertical?: boolean;
        autoSize?: boolean;
        disabled?: boolean;
        needOpenByMenuItemClick?: boolean;
        testId?: string;
        layoutModeButton?: boolean;
        generalTitle?: string;
        activeItem?: import("../..").MacromoleculesIconName;
        subMenuId?: string;
    }>) => import("@emotion/react/jsx-runtime").JSX.Element;
};
export { Menu, MenuContext };
