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
import type { StructServiceOptions, StructServiceProvider } from '../domain/services';
import { Ketcher } from './ketcher';
import { type ISettingsService, type ISettingsStorage, type Settings, type DeepPartial } from './settings';
export declare const DefaultStructServiceOptions: {
    'smart-layout': boolean;
    'ignore-stereochemistry-errors': boolean;
    'mass-skip-error-on-pseudoatoms': boolean;
    'gross-formula-add-rsites': boolean;
    'aromatize-skip-superatoms': boolean;
    'dearomatize-on-load': boolean;
    'ignore-no-chiral-flag': boolean;
};
export declare class KetcherBuilder {
    #private;
    withStructServiceProvider(structServiceProvider: StructServiceProvider): this;
    /**
     * Provide a custom settings service instance
     * If not provided, a default SettingsService will be created
     */
    withSettingsService(settingsService: ISettingsService): this;
    /**
     * Provide a custom storage adapter for settings
     * Default is LocalStorageAdapter
     */
    withStorageAdapter(storageAdapter: ISettingsStorage): this;
    /**
     * Provide initial settings to merge with defaults
     * These will be applied when the settings service is initialized
     */
    withSettings(settings: DeepPartial<Settings>): this;
    build(serviceOptions?: StructServiceOptions): Promise<Ketcher>;
}
