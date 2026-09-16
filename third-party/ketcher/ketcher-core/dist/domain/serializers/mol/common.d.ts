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
import { SGroup } from '../../entities/sgroup';
import type { Struct } from '../../entities/struct';
import type { Mapping } from './mol.types';
declare function parseMol(ctabLines: string[], ignoreChiralFlag?: boolean): Struct;
declare function parseCTab(ctabLines: string[], ignoreChiralFlag?: boolean): Struct;
declare function parseRxn(ctabLines: string[], shouldReactionRelayout?: boolean, ignoreChiralFlag?: boolean): Struct;
declare const _default: {
    parseCTab: typeof parseCTab;
    parseMol: typeof parseMol;
    parseRxn: typeof parseRxn;
    prepareForSaving: Record<string, (sgroup: SGroup, mol: Struct) => void>;
    saveToMolfile: Record<string, (sgroup: SGroup, mol: Struct, sgMap: Mapping, atomMap: Mapping, bondMap: Mapping) => string>;
};
export default _default;
