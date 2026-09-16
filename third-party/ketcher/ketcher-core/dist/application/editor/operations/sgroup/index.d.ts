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
import type { BaseMonomer } from '../../../../domain/entities/BaseMonomer';
import { SGroup } from '../../../../domain/entities/sgroup';
import { Vec2 } from '../../../../domain/entities/vec2';
import { type ReStruct } from '../../../render';
import { BaseOperation } from '../BaseOperation';
type Data = {
    sgid?: number;
    type?: string;
    pp?: Vec2 | null;
    expanded?: boolean;
    name?: string;
    oldSgroup?: SGroup;
};
declare class SGroupCreate extends BaseOperation {
    private readonly monomer?;
    data: Data;
    constructor(sgroupId?: number, type?: string, pp?: Vec2, expanded?: boolean, name?: string, oldSgroup?: SGroup, monomer?: BaseMonomer | undefined);
    execute(restruct: ReStruct): void;
}
declare class SGroupDelete extends BaseOperation {
    data: Data;
    constructor(sgroupId?: number);
    execute(restruct: ReStruct): void;
}
export { SGroupCreate, SGroupDelete };
export * from './sgroupAtom';
export * from './SGroupAttr';
export * from './SGroupDataMove';
export * from './sgroupHierarchy';
export * from './sgroupAttachmentPoints';
