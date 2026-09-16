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
import type { Operation } from '../../../../domain/entities/Operation';
import type { BaseMonomer } from '../../../../domain/entities/BaseMonomer';
import type { RenderersManager } from '../../../render/renderers/RenderersManager';
export declare class MonomerDeleteOperation implements Operation {
    addMonomerChangeModel: (monomer: BaseMonomer) => BaseMonomer;
    deleteMonomerChangeModel: (monomer: BaseMonomer) => void;
    private readonly callback?;
    monomer: BaseMonomer;
    priority: number;
    constructor(monomer: BaseMonomer, addMonomerChangeModel: (monomer: BaseMonomer) => BaseMonomer, deleteMonomerChangeModel: (monomer: BaseMonomer) => void, callback?: (() => void) | undefined);
    execute(renderersManager: RenderersManager): void;
    invert(renderersManager: RenderersManager): void;
}
