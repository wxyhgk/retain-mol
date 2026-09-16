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
import type { SettingsFormValue } from 'ketcher-core';
export type SettingFieldValue = boolean | number | string;
export type SettingFieldName = {
    [Key in keyof SettingsFormValue]-?: Exclude<SettingsFormValue[Key], undefined> extends SettingFieldValue ? Key : never;
}[keyof SettingsFormValue];
export interface FieldGroup {
    id: string;
    title: string;
    fields: Array<SettingFieldName>;
}
export interface FieldDefinition {
    label: string;
    type: 'checkbox' | 'number' | 'text' | 'select' | 'color';
    options?: Array<{
        value: SettingFieldValue;
        label: string;
    }>;
    min?: number;
    max?: number;
    step?: number;
}
export declare const FIELD_GROUPS: FieldGroup[];
export declare const FIELD_DEFINITIONS: Record<string, FieldDefinition>;
