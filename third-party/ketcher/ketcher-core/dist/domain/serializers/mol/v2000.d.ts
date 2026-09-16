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
import { Struct } from '../../entities/struct';
declare function parseCTabV2000(ctabLines: string[], countsSplit: string[], ignoreChiralFlag?: boolean): Struct;
declare function parseRg2000(ctabLines: string[], ignoreChiralFlag?: boolean): Struct;
declare function parseRxn2000(ctabLines: string[], shouldReactionRelayout?: boolean, ignoreChiralFlag?: boolean): Struct;
declare const _default: {
    parseCTabV2000: typeof parseCTabV2000;
    parseRg2000: typeof parseRg2000;
    parseRxn2000: typeof parseRxn2000;
};
export default _default;
