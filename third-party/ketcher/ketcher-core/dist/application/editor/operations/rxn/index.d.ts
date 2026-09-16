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
import { RxnArrowMode } from '../../../../domain/entities/rxnArrow';
import { Vec2 } from '../../../../domain/entities/vec2';
import Base from '../BaseOperation';
import type Restruct from '../../../render/restruct/restruct';
type RxnArrowAddData = {
    id?: number;
    pos: Array<Vec2>;
    mode: RxnArrowMode;
    height?: number;
    arrowId?: number;
};
declare class RxnArrowAdd extends Base<RxnArrowAddData> {
    data: RxnArrowAddData;
    constructor(pos?: Array<Vec2>, mode?: RxnArrowMode, id?: number, height?: number, arrowId?: number);
    execute(restruct: Restruct): void;
    invert(): RxnArrowDelete;
}
interface RxnArrowDeleteData {
    id?: number;
    pos?: Array<Vec2>;
    mode?: RxnArrowMode;
    height?: number;
    arrowId?: number;
}
declare class RxnArrowDelete extends Base<RxnArrowDeleteData> {
    data: RxnArrowDeleteData;
    performed: boolean;
    constructor(id?: number);
    execute(restruct: Restruct): void;
    invert(): Base;
}
export { RxnArrowAdd, RxnArrowDelete };
export * from './RxnArrowMove';
export * from './RxnArrowRotate';
export * from './RxnArrowResize';
export * from './plus';
