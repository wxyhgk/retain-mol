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
import { Pool } from '../../entities/pool';
import { SGroup } from '../../entities/sgroup';
import { SGroupAttachmentPoint } from '../../entities/sGroupAttachmentPoint';
import type { Struct } from '../../entities/struct';
import type { SGroupMap, AtomMap } from './mol.types';
declare function readKeyValuePairs(str: string, valueString: boolean): Pool<string | number>;
declare function readKeyMultiValuePairs(str: string, valueString: boolean): Array<[number, string | number]>;
declare function loadSGroup(mol: Struct, sg: SGroup, atomMap: AtomMap): number;
declare function initSGroup(sGroups: SGroupMap, propData: string): void;
declare function applySGroupProp(sGroups: SGroupMap, propName: string, propData: string, numeric?: boolean, core?: boolean): void;
declare function applySGroupArrayProp(sGroups: SGroupMap, propName: string, propData: string, shift: number): void;
declare function applyDataSGroupName(sg: SGroup, name: string): void;
declare function applyDataSGroupExpand(sg: SGroup, expanded: boolean): void;
declare function applyDataSGroupQuery(sg: SGroup, query: string): void;
declare function applyDataSGroupQueryOp(sg: SGroup, queryOp: string): void;
declare function applyDataSGroupDesc(sGroups: SGroupMap, propData: string): void;
declare function applyDataSGroupInfo(sg: SGroup, propData: string): void;
declare function applyDataSGroupInfoLine(sGroups: SGroupMap, propData: string): void;
declare function applyDataSGroupData(sg: SGroup, data: string, finalize: boolean): void;
declare function applyDataSGroupDataLine(sGroups: SGroupMap, propData: string, finalize: boolean): void;
/**
 * Superatom attachment point parsing for 'ctab' v2000
 * Implemented based on: https://github.com/epam/ketcher/issues/2467
 * @param ctabString example '   1  1   2   0   '
 *        M SAP sssnn6 iii ooo cc
 *             ^
 *             start position for ctabString content
 */
declare function parseSGroupSAPLineV2000(ctabString: string): {
    sGroupId: number;
    attachmentPoints: SGroupAttachmentPoint[];
};
declare const _default: {
    readKeyValuePairs: typeof readKeyValuePairs;
    readKeyMultiValuePairs: typeof readKeyMultiValuePairs;
    loadSGroup: typeof loadSGroup;
    initSGroup: typeof initSGroup;
    applySGroupProp: typeof applySGroupProp;
    applySGroupArrayProp: typeof applySGroupArrayProp;
    applyDataSGroupName: typeof applyDataSGroupName;
    applyDataSGroupQuery: typeof applyDataSGroupQuery;
    applyDataSGroupQueryOp: typeof applyDataSGroupQueryOp;
    applyDataSGroupDesc: typeof applyDataSGroupDesc;
    applyDataSGroupInfo: typeof applyDataSGroupInfo;
    applyDataSGroupData: typeof applyDataSGroupData;
    applyDataSGroupInfoLine: typeof applyDataSGroupInfoLine;
    applyDataSGroupDataLine: typeof applyDataSGroupDataLine;
    applyDataSGroupExpand: typeof applyDataSGroupExpand;
    parseSGroupSAPLineV2000: typeof parseSGroupSAPLineV2000;
};
export default _default;
