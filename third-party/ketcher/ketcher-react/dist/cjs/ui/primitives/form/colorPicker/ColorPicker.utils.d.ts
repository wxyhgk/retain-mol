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
export declare function isPresetColor(color: string): boolean;
export declare function normalizeHexColor(color: string): string;
export declare function sanitizeCustomColors(colors: string[] | readonly string[]): string[];
export declare function addCustomColor(colors: string[] | readonly string[], color: string): string[];
export declare function hexToHsl(hex: string): {
    h: number;
    s: number;
    l: number;
};
export declare function hslToHex(h: number, s: number, l: number): string;
export declare function isValidHex(hex: string): boolean;
export declare function sanitizeHexInput(rawInput: string): string;
