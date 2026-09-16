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
import type { AtomHotspotCommand } from '../../editor/tool/atomHotspot';
export { initClipboard } from './clipboardProviderAdapter';
type KeydownEventTarget = Document | HTMLElement;
type KeydownListenerOwner = () => unknown;
type ChemDrawHotspotKeyEvent = Pick<KeyboardEvent, 'key' | 'metaKey' | 'ctrlKey' | 'altKey'>;
type ChemDrawBondOptions = {
    type: number;
    stereo?: number;
    label?: string;
};
export type ChemDrawHotspotRoute = {
    target: 'atom';
    tool: 'atom-hotspot';
    command: AtomHotspotCommand;
    templateIndex?: number;
} | {
    target: 'bond';
    tool: 'bond';
    opts: ChemDrawBondOptions;
} | {
    target: 'bond';
    tool: 'template';
    templateIndex: number;
};
export declare const CHEMDRAW_BOND_RING_TEMPLATE_INDEX: Readonly<Record<string, number>>;
export declare const CHEMDRAW_ATOM_RING_TEMPLATE_INDEX: Readonly<Record<string, number>>;
/**
 * Resolves only RetainMol's direct ChemDraw-style hotspot commands. Returning
 * null is important: the caller must leave system shortcuts (for example
 * Cmd/Ctrl+Z and Cmd/Ctrl+A) available to the regular shortcut dispatcher.
 */
export declare function resolveChemDrawHotspotShortcut(hoveredItem: Record<string, number> | null, event: ChemDrawHotspotKeyEvent): ChemDrawHotspotRoute | null;
export declare function resolveSelectedAtomSproutShortcut(event: ChemDrawHotspotKeyEvent): ChemDrawHotspotRoute | null;
export declare function initKeydownListener(element: KeydownEventTarget | null): (dispatch: any, getState: KeydownListenerOwner) => void;
export declare function removeKeydownListener(element: KeydownEventTarget | null): (_dispatch: any, getState: KeydownListenerOwner) => void;
