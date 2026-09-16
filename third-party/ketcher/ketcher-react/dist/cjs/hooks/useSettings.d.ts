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
import { type Settings, type DeepPartial } from 'ketcher-core';
/**
 * React hook to access settings from ketcher-core settings service
 * Provides reactive access to settings with update methods
 *
 * @example
 * ```typescript
 * const { settings, updateSettings, loadPreset } = useSettings();
 *
 * // Read settings
 * console.log(settings?.resetToSelect);
 *
 * // Update settings
 * await updateSettings({ atomColoring: false });
 *
 * // Load preset
 * await loadPreset('acs');
 * ```
 */
export declare function useSettings(): {
    settings: Settings | null;
    updateSettings: (partial: DeepPartial<Settings>) => Promise<Settings>;
    resetToDefaults: () => Promise<Settings>;
    loadPreset: (name: string) => Promise<Settings>;
    exportSettings: () => string;
    importSettings: (json: string) => Promise<Settings>;
    availablePresets: string[];
};
