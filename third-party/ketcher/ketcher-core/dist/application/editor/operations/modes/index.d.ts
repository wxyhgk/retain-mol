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
export declare class ReinitializeModeOperation implements Operation {
    private readonly forceRecalculateAntisense;
    priority: number;
    constructor(forceRecalculateAntisense?: boolean);
    execute(_renderersManager: RenderersManager): void;
    invert(renderersManager: RenderersManager): void;
}
export declare class RestoreSequenceCaretPositionOperation implements Operation {
    private readonly previousPosition;
    private readonly nextPosition;
    private readonly setCaretPosition;
    constructor(previousPosition: number, nextPosition: number, setCaretPosition: (position: number) => void);
    execute(): void;
    invert(_renderersManager: RenderersManager): void;
}
