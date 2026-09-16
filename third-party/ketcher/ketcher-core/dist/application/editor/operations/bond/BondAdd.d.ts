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
import { type ReStruct } from '../../../render';
import { BaseOperation } from '../BaseOperation';
import { type BondAttributes } from '../../../../domain/entities';
type Data = {
    bond: Partial<BondAttributes> | null;
    begin: number | null;
    end: number | null;
    bid: number | null;
    needInvalidateAtoms?: boolean;
};
declare class BondAdd extends BaseOperation {
    data: Data;
    constructor(begin?: number, end?: number, bond?: Partial<BondAttributes>, needInvalidateAtoms?: boolean);
    execute(restruct: ReStruct): void;
}
export { BondAdd };
