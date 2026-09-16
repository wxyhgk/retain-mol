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
import { type ServiceMode, type StructService, type StructServiceProvider, Ketcher, type ISettingsService, type ISettingsStorage, type Settings, type DeepPartial } from 'ketcher-core';
import type { ButtonsConfig } from './ButtonsConfig';
import { initApp } from '../../../ui';
import type { Root } from 'react-dom/client';
import type { CustomButton } from './CustomButtons';
declare class KetcherBuilder {
    private structService;
    private serviceMode;
    private formatterFactory;
    private settingsService;
    private storageAdapter;
    private initialSettings;
    constructor();
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
    appendApiAsync(structServiceProvider: StructServiceProvider): StructService & Promise<import("ketcher-core").InfoResult>;
    reinitializeApi(ketcherId: string, structServiceProvider: StructServiceProvider, setStructServiceToStore: (structService: StructService) => void): StructService;
    appendServiceMode(mode: ServiceMode): void;
    appendUiAsync(prevKetcherId: string, ketcherId: string, element: HTMLDivElement | null, appRoot: Root, staticResourcesUrl: string, errorHandler: (message: string) => void, buttons?: ButtonsConfig, togglerComponent?: JSX.Element, customButtons?: Array<CustomButton>): Promise<{
        cleanup: ReturnType<typeof initApp> | null;
        setServer: (structService: StructService) => void;
    }>;
    build(): Promise<Ketcher>;
}
export { KetcherBuilder };
