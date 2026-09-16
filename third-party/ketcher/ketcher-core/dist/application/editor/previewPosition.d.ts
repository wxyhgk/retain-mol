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
import { type AmbiguousMonomerType } from '../../domain/types';
import { type PolymerBond } from '../../domain/entities';
export declare const preview: {
    readonly width: 345;
    readonly height: 345;
    readonly gap: 5;
    readonly topPadding: 16;
    readonly heightForNucleotide: 105;
    readonly widthForBond: 358;
    readonly heightForBond: 268;
};
export interface PreviewStyle {
    readonly top?: string;
    readonly left?: string;
    readonly right?: string;
    readonly transform?: string;
}
export declare enum PresetPosition {
    Library = "library",
    ChainStart = "chainStart",
    ChainMiddle = "chainMiddle",
    ChainEnd = "chainEnd"
}
type CalculatePreviewTopPayload = {
    left: number;
    top: number;
    bottom: number;
};
export declare const calculateMonomerPreviewTop: (target?: CalculatePreviewTopPayload) => string;
export declare const calculateNucleoElementPreviewTop: (target?: CalculatePreviewTopPayload) => string;
export declare const calculateAmbiguousMonomerPreviewTop: (monomer: AmbiguousMonomerType) => (target?: CalculatePreviewTopPayload) => string;
export declare function calculateAmbiguousMonomerPreviewLeft(initialLeft: number): number;
export declare const calculateBondPreviewPosition: (bond: PolymerBond, bondCoordinates: DOMRect) => PreviewStyle;
export {};
