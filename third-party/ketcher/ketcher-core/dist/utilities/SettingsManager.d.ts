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
import type { LayoutMode } from '../application/editor/modes/types';
export declare const KETCHER_SAVED_SETTINGS_KEY = "ketcher_editor_saved_settings";
export declare const KETCHER_SAVED_OPTIONS_KEY = "ketcher-opts";
export type EditorLineLength = Record<Exclude<LayoutMode, 'flex-layout-mode'>, number>;
export declare const SetEditorLineLengthAction = "SetEditorLineLength";
/**
 * Shape of the selection tool persisted in local storage.
 * Mirrors the `ActionObj` used by the UI reducer that assigns it,
 * but is kept minimal here to avoid coupling `ketcher-core` to
 * UI-layer action types.
 */
export interface PersistedSelectionTool {
    tool: 'select';
    opts?: unknown;
}
interface SavedSettings {
    selectionTool?: PersistedSelectionTool;
    disableCustomQuery?: boolean;
    editorLineLength?: EditorLineLength;
    monomerLibraryUpdates?: string[];
}
interface SavedOptions {
    ignoreChiralFlag?: boolean;
    disableQueryElements?: string[] | null;
}
export declare class SettingsManager {
    private static disableCustomQueryValue?;
    private static persistMonomerLibraryUpdatesValue;
    static getSettings(): SavedSettings;
    static saveSettings(settings: SavedSettings): void;
    static getOptions(): SavedOptions;
    static saveOptions(options: SavedOptions): void;
    static get selectionTool(): PersistedSelectionTool | undefined;
    static set selectionTool(selectionTool: PersistedSelectionTool | undefined);
    static get editorLineLength(): EditorLineLength;
    static set editorLineLength(newEditorLineLength: Partial<EditorLineLength>);
    static get disableCustomQuery(): boolean | undefined;
    static set disableCustomQuery(disableCustomQuery: boolean | undefined);
    static get ignoreChiralFlag(): boolean | undefined;
    static set ignoreChiralFlag(ignoreChiralFlag: boolean | undefined);
    static get monomerLibraryUpdates(): string[];
    static set monomerLibraryUpdates(monomerLibraryUpdates: string[]);
    static addMonomerLibraryUpdate(newUpdate: string): void;
    static get persistMonomerLibraryUpdates(): boolean;
    static set persistMonomerLibraryUpdates(value: boolean | undefined);
}
export {};
