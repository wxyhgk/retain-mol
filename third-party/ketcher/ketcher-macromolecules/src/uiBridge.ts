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

import {
  createElement,
  type ButtonHTMLAttributes,
  type ComponentType,
  type CSSProperties,
  type InputHTMLAttributes,
  type MouseEvent as ReactMouseEvent,
  type MouseEventHandler,
  type ReactNode,
  type RefObject,
} from 'react';

import type { RenderOptions, Struct } from 'ketcher-core';
import type { AmbiguousMonomerPreviewState } from './state/types';

/**
 * Icon names used by the macromolecules editor, as provided by the host
 * application through {@link MacromoleculesUIComponents}.
 */
export type MacromoleculesIconName =
  | 'about'
  | 'arrange-ring'
  | 'arrow-upward'
  | 'antisenseDnaStrand'
  | 'arrows-left'
  | 'arrows-right'
  | 'base'
  | 'check'
  | 'chem'
  | 'chevron'
  | 'close'
  | 'copyMenu'
  | 'delete'
  | 'deleteMenu'
  | 'dropdown'
  | 'elements-group'
  | 'expand'
  | 'filter'
  | 'image-frame'
  | 'minimize-expansion'
  | 'monomer-autochain'
  | 'open-1'
  | 'open-window-paste-icon'
  | 'open-window-upload-icon'
  | 'pasteNavBar'
  | 'phosphate'
  | 'preset-left-phosphate'
  | 'preset-right-phosphate'
  | 'questionMark'
  | 'reset'
  | 'save-1'
  | 'search'
  | 'sugar'
  | 'transform-flip-h'
  | 'transform-flip-v'
  | 'antisenseRnaStrand'
  | 'antisenseStrand'
  | 'bond-hydrogen'
  | 'bond-single'
  | 'erase'
  | 'flex-layout-mode'
  | 'fullscreen-enter'
  | 'fullscreen-exit'
  | 'hand'
  | 'help'
  | 'open'
  | 'select-fragment'
  | 'select-lasso'
  | 'select-rectangle'
  | 'select-structure'
  | 'sequence-layout-mode'
  | 'settings'
  | 'shape-ellipse'
  | 'shape-rectangle'
  | 'snake-layout-mode'
  | 'clear'
  | 'copy'
  | 'file-thumbnail'
  | 'redo'
  | 'save'
  | 'vertical-dots'
  | 'undo';
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
  Button: ComponentType<
    ButtonHTMLAttributes<HTMLButtonElement> & { isActive?: boolean }
  >;
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
    options?:
      | (RenderOptions & { cachePrefix?: string; needCache?: boolean })
      | { cachePrefix?: string; needCache?: boolean };
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
  usePortalStyle: (
    params: [
      ref: RefObject<HTMLDivElement | null>,
      isOpen: boolean,
      isTop?: boolean,
      rootElementSelector?: string,
    ],
  ) => [CSSProperties];
  getFullscreenElement: () => HTMLElement;
}

let uiComponents: MacromoleculesUIComponents | null = null;

export function initMacromoleculesUI(ui: MacromoleculesUIComponents): void {
  uiComponents = ui;
}

export function getMacromoleculesUI(): MacromoleculesUIComponents {
  if (!uiComponents) {
    throw new Error(
      'Macromolecules UI components are not initialized. ' +
        'Pass `ui` to the macromolecules Editor.',
    );
  }
  return uiComponents;
}

/**
 * Drop-in replacements with the same names as the ketcher-react exports.
 * Each wrapper resolves the host implementation lazily at render time, so
 * importing this module never touches ketcher-react (no import cycle) and
 * call sites keep working unchanged. The host must call
 * {@link initMacromoleculesUI} before rendering (done by the Editor).
 */
function bridge<
  K extends
    | 'Icon'
    | 'IconButton'
    | 'Button'
    | 'Input'
    | 'Accordion'
    | 'ArrowScroll'
    | 'StructRender'
    | 'AmbiguousMonomerPreview',
>(key: K): MacromoleculesUIComponents[K] {
  const Bridged = (props: Record<string, unknown>) => {
    const registry = getMacromoleculesUI();
    const Target = registry[key] as ComponentType<Record<string, unknown>>;
    return createElement(Target, props);
  };
  Bridged.displayName = `Bridged(${key})`;
  return Bridged as MacromoleculesUIComponents[K];
}

export const Icon = bridge('Icon');
export const IconButton = bridge('IconButton');
export const Button = bridge('Button');
export const Input = bridge('Input');
export const Accordion = bridge('Accordion');
export const ArrowScroll = bridge('ArrowScroll');
export const StructRender = bridge('StructRender');
export const AmbiguousMonomerPreview = bridge('AmbiguousMonomerPreview');

export function usePortalStyle(
  ...args: Parameters<MacromoleculesUIComponents['usePortalStyle']>
): [CSSProperties] {
  return getMacromoleculesUI().usePortalStyle(...args);
}

export function getFullscreenElement(): HTMLElement {
  return getMacromoleculesUI().getFullscreenElement();
}
