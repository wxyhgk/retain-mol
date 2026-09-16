/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * You may not use this file except in compliance with the License.
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
import { type ButtonHTMLAttributes, type ComponentType, type CSSProperties, type InputHTMLAttributes, type MouseEvent as ReactMouseEvent, type MouseEventHandler, type ReactNode, type RefObject } from 'react';
import type { RenderOptions, Struct } from 'ketcher-core';
import type { AmbiguousMonomerPreviewState } from './state/types';
/**
 * Icon names used by the macromolecules editor, as provided by the host
 * application through {@link MacromoleculesUIComponents}.
 */
export type MacromoleculesIconName = 'about' | 'arrange-ring' | 'arrow-upward' | 'antisenseDnaStrand' | 'arrows-left' | 'arrows-right' | 'base' | 'check' | 'chem' | 'chevron' | 'close' | 'copyMenu' | 'delete' | 'deleteMenu' | 'dropdown' | 'elements-group' | 'expand' | 'filter' | 'image-frame' | 'minimize-expansion' | 'monomer-autochain' | 'open-1' | 'open-window-paste-icon' | 'open-window-upload-icon' | 'pasteNavBar' | 'phosphate' | 'preset-left-phosphate' | 'preset-right-phosphate' | 'questionMark' | 'reset' | 'save-1' | 'search' | 'sugar' | 'transform-flip-h' | 'transform-flip-v' | 'antisenseRnaStrand' | 'antisenseStrand' | 'bond-hydrogen' | 'bond-single' | 'erase' | 'flex-layout-mode' | 'fullscreen-enter' | 'fullscreen-exit' | 'hand' | 'help' | 'open' | 'select-fragment' | 'select-lasso' | 'select-rectangle' | 'select-structure' | 'sequence-layout-mode' | 'settings' | 'shape-ellipse' | 'shape-rectangle' | 'snake-layout-mode' | 'clear' | 'copy' | 'file-thumbnail' | 'redo' | 'save' | 'vertical-dots' | 'undo';
export interface MacromoleculesUIComponents {
    Icon: ComponentType<{
        name: MacromoleculesIconName;
        className?: string;
        title?: string;
        onClick?: (e: ReactMouseEvent) => void;
        onMouseOver?: (e: ReactMouseEvent) => void;
        onMouseOut?: (e: ReactMouseEvent) => void;
        onDoubleClick?: (e: ReactMouseEvent) => void;
        dataTestId?: string;
    }>;
    IconButton: ComponentType<{
        iconName: MacromoleculesIconName;
        onClick: (e: ReactMouseEvent<HTMLButtonElement>) => void;
        title?: string;
        className?: string;
        disabled?: boolean;
        isActive?: boolean;
        isHidden?: boolean;
        shortcut?: string;
        testId?: string;
        children?: ReactNode;
    }>;
    Button: ComponentType<ButtonHTMLAttributes<HTMLButtonElement> & {
        isActive?: boolean;
    }>;
    Input: ComponentType<InputHTMLAttributes<HTMLInputElement>>;
    Accordion: ComponentType<{
        summary: ReactNode;
        details: ReactNode;
        expanded: boolean;
        onSummaryClick: MouseEventHandler<HTMLDivElement>;
        className?: string;
        dataTestIdDetails?: string;
    }>;
    ArrowScroll: ComponentType<{
        startInView: boolean;
        endInView: boolean;
        scrollForward: (dtMs: number) => void;
        scrollBack: (dtMs: number) => void;
        isLeftRight?: boolean;
    }>;
    StructRender: ComponentType<{
        struct: Struct | string;
        options?: (RenderOptions & {
            cachePrefix?: string;
            needCache?: boolean;
        }) | {
            cachePrefix?: string;
            needCache?: boolean;
        };
        className?: string;
        update?: boolean;
        fullsize?: boolean;
        testId?: string;
    }>;
    AmbiguousMonomerPreview: ComponentType<{
        className?: string;
        preview: AmbiguousMonomerPreviewState;
        style?: CSSProperties;
    }>;
    usePortalStyle: (params: [
        ref: RefObject<HTMLDivElement | null>,
        isOpen: boolean,
        isTop?: boolean,
        rootElementSelector?: string
    ]) => [CSSProperties];
    getFullscreenElement: () => HTMLElement;
}
export declare function initMacromoleculesUI(ui: MacromoleculesUIComponents): void;
export declare function getMacromoleculesUI(): MacromoleculesUIComponents;
export declare const Icon: ComponentType<{
    name: MacromoleculesIconName;
    className?: string;
    title?: string;
    onClick?: (e: ReactMouseEvent) => void;
    onMouseOver?: (e: ReactMouseEvent) => void;
    onMouseOut?: (e: ReactMouseEvent) => void;
    onDoubleClick?: (e: ReactMouseEvent) => void;
    dataTestId?: string;
}>;
export declare const IconButton: ComponentType<{
    iconName: MacromoleculesIconName;
    onClick: (e: ReactMouseEvent<HTMLButtonElement>) => void;
    title?: string;
    className?: string;
    disabled?: boolean;
    isActive?: boolean;
    isHidden?: boolean;
    shortcut?: string;
    testId?: string;
    children?: ReactNode;
}>;
export declare const Button: ComponentType<ButtonHTMLAttributes<HTMLButtonElement> & {
    isActive?: boolean;
}>;
export declare const Input: ComponentType<InputHTMLAttributes<HTMLInputElement>>;
export declare const Accordion: ComponentType<{
    summary: ReactNode;
    details: ReactNode;
    expanded: boolean;
    onSummaryClick: MouseEventHandler<HTMLDivElement>;
    className?: string;
    dataTestIdDetails?: string;
}>;
export declare const ArrowScroll: ComponentType<{
    startInView: boolean;
    endInView: boolean;
    scrollForward: (dtMs: number) => void;
    scrollBack: (dtMs: number) => void;
    isLeftRight?: boolean;
}>;
export declare const StructRender: ComponentType<{
    struct: Struct | string;
    options?: (RenderOptions & {
        cachePrefix?: string;
        needCache?: boolean;
    }) | {
        cachePrefix?: string;
        needCache?: boolean;
    };
    className?: string;
    update?: boolean;
    fullsize?: boolean;
    testId?: string;
}>;
export declare const AmbiguousMonomerPreview: ComponentType<{
    className?: string;
    preview: AmbiguousMonomerPreviewState;
    style?: CSSProperties;
}>;
export declare function usePortalStyle(...args: Parameters<MacromoleculesUIComponents['usePortalStyle']>): [CSSProperties];
export declare function getFullscreenElement(): HTMLElement;
