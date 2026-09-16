/****************************************************************************
 * Copyright 2022 EPAM Systems
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
import type { Struct } from '../../entities/struct';
import { Vec2 } from '../../entities/vec2';
import type { EditorSelection } from '../../../application/editor/editor.types';
import { type MonomerTransformation, KetMonomerClass } from '../../../application/formatters/types/ket';
import type { MonomerItemType } from '../../types';
export declare const getNodeWithInvertedYCoord: <T>(node: T) => T;
export declare const setMonomerTemplatePrefix: (templateName: string) => string;
export declare const setMonomerPrefix: (monomerId: number) => string;
export declare const setMonomerGroupTemplatePrefix: (templateName: string) => string;
export declare const setAmbiguousMonomerTemplatePrefix: (templateName: string) => string;
export declare const setAmbiguousMonomerPrefix: (monomerId: number) => string;
export declare const getKetRef: (entityId: string) => {
    $ref: string;
};
export declare const getMonomerTemplateRefFromMonomerItem: (monomerItem: MonomerItemType) => string;
export declare const getHELMClassByKetMonomerClass: (monomerClass: KetMonomerClass) => string;
export declare const fillNaturalAnalogueForPhosphateAndSugar: (naturalAnalogue: string, monomerClass: KetMonomerClass) => string;
/**
 *
 * System coordinates for browser and for chemistry files format (mol, ket, etc.) area are different.
 * It needs to rotate them by 180 degrees in y-axis.
 *
 * @param position - coordinates of the structure
 *
 */
export declare const switchIntoChemistryCoordSystem: (position: Vec2) => Vec2;
export declare const modifyTransformation: (transformation: MonomerTransformation) => Partial<{
    rotate: number;
    shift: Partial<{
        x: number;
        y: number;
    }>;
    flip: import("../../..").FlipDirection;
}>;
export declare const populateStructWithSelection: (populatedStruct: Struct, selection?: EditorSelection, resetSelection?: boolean) => Struct;
