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
import { type ChangeEvent } from 'react';
interface CustomColorEditorProps {
    customColors: string[] | readonly string[];
    pendingColor: string;
    hue: number;
    lightness: number;
    hexInput: string;
    onHueChange: (h: number) => void;
    onLightnessChange: (sliderLightness: number) => void;
    onHexInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onDeleteCustomColor: () => void;
}
declare function CustomColorEditor({ customColors, pendingColor, hue, lightness, hexInput, onHueChange, onLightnessChange, onHexInputChange, onDeleteCustomColor, }: CustomColorEditorProps): import("react").JSX.Element;
export default CustomColorEditor;
