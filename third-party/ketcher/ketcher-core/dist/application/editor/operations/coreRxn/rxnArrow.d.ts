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
import type { RenderersManager } from '../../../render/renderers/RenderersManager';
import type { Operation } from '../../../../domain/entities/Operation';
import type { RxnArrow } from '../../../../domain/entities/CoreRxnArrow';
export declare class RxnArrowAddOperation implements Operation {
    addArrowChangeModel: (arrow?: RxnArrow) => RxnArrow;
    deleteArrowChangeModel: (arrow: RxnArrow) => void;
    rxnArrow: RxnArrow;
    priority: number;
    constructor(addArrowChangeModel: (arrow?: RxnArrow) => RxnArrow, deleteArrowChangeModel: (arrow: RxnArrow) => void);
    execute(renderersManager: RenderersManager): void;
    invert(renderersManager: RenderersManager): void;
}
export declare class RxnArrowDeleteOperation implements Operation {
    rxnArrow: RxnArrow;
    deleteArrowChangeModel: (arrow: RxnArrow) => void;
    addArrowChangeModel: (arrow: RxnArrow) => RxnArrow;
    priority: number;
    constructor(rxnArrow: RxnArrow, deleteArrowChangeModel: (arrow: RxnArrow) => void, addArrowChangeModel: (arrow: RxnArrow) => RxnArrow);
    execute(renderersManager: RenderersManager): void;
    invert(renderersManager: RenderersManager): void;
}
