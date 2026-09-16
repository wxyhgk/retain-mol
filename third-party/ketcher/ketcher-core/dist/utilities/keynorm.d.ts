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
export declare const KeyboardModifiers: {
    readonly Alt: "Alt";
    readonly Control: "Control";
    readonly Ctrl: "Ctrl";
    readonly Meta: "Meta";
    readonly Shift: "Shift";
};
export declare const KeyCodePrefixes: {
    Key: string;
    Digit: string;
};
type HotKeyMap = Record<string, string[]>;
type HotKeyAction = {
    shortcut?: string | string[];
};
type HotKeyActions = Record<string, HotKeyAction>;
export declare const CanonicalModifiersOrder: ("Alt" | "Ctrl" | "Meta" | "Shift")[];
export declare const ModifiersRegex: {
    Mod: RegExp;
    Meta: RegExp;
    Ctrl: RegExp;
    Alt: RegExp;
    Shift: RegExp;
};
export declare const isControlKey: (event: KeyboardEvent | PointerEvent) => boolean;
/**
 * Normalizes a shortcut string, keyboard event, or normalized hotkey map.
 * String and event inputs return a normalized shortcut key, while map inputs
 * return a copy with normalized shortcut keys.
 */
declare function keyNormBase(obj: KeyboardEvent): string;
declare function keyNormBase(obj: string): string;
declare function keyNormBase(obj: HotKeyMap): HotKeyMap;
export declare const initHotKeys: (actions: HotKeyActions) => HotKeyMap;
type KeyNorm = typeof keyNormBase & {
    /**
     * Returns the action group bound to a keyboard event. Multiple action names
     * may be returned when the same hotkey is shared, in the order they were
     * registered. Undefined means no binding was found for that shortcut.
     */
    lookup: (map: HotKeyMap, event: KeyboardEvent) => string[] | undefined;
};
declare const keyNorm: KeyNorm;
export { keyNorm };
