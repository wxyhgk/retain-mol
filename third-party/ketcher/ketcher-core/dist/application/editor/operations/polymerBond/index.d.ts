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
import type { PolymerBond } from '../../../../domain/entities/PolymerBond';
import type { RenderersManager } from '../../../render/renderers/RenderersManager';
import type { Operation } from '../../../../domain/entities/Operation';
import type { BaseMonomer } from '../../../../domain/entities/BaseMonomer';
import type { HydrogenBond } from '../../../../domain/entities/HydrogenBond';
import type { LayoutMode } from '../../../editor/modes/types';
export declare class PolymerBondAddOperation implements Operation {
    private readonly addPolymerBondChangeModel;
    private readonly deletePolymerBondChangeModel;
    polymerBond: any;
    priority: number;
    constructor(addPolymerBondChangeModel: (polymerBond?: PolymerBond | HydrogenBond) => PolymerBond | HydrogenBond, deletePolymerBondChangeModel: (polymerBond: any) => void);
    execute(renderersManager: RenderersManager): void;
    invert(renderersManager: RenderersManager): void;
}
export declare class PolymerBondDeleteOperation implements Operation {
    polymerBond: PolymerBond | HydrogenBond;
    private readonly deletePolymerBondChangeModel;
    private readonly finishPolymerBondCreationModelChange;
    priority: number;
    constructor(polymerBond: PolymerBond | HydrogenBond, deletePolymerBondChangeModel: () => void, finishPolymerBondCreationModelChange: (polymerBond?: PolymerBond | HydrogenBond) => PolymerBond | HydrogenBond);
    execute(renderersManager: RenderersManager): void;
    invert(renderersManager: RenderersManager): void;
}
export declare class PolymerBondMoveOperation implements Operation {
    polymerBond: PolymerBond;
    constructor(polymerBond: PolymerBond);
    execute(renderersManager: RenderersManager): void;
    invert(): void;
}
/**
 * Snaps a polymer bond's endpoints to the current positions of its linked
 * monomers by calling `moveToLinkedEntities()` and then re-rendering.
 *
 * Unlike `PolymerBondMoveOperation`, this operation is fully symmetric:
 * both `execute` and `invert` snap the bond to its monomers' current
 * positions. This makes it suitable for undo-safe chain-shift operations
 * where monomers are moved and bonds must follow in both directions.
 */
export declare class PolymerBondSnapToMonomersOperation implements Operation {
    polymerBond: PolymerBond;
    constructor(polymerBond: PolymerBond);
    private snap;
    execute(renderersManager: RenderersManager): void;
    invert(renderersManager: RenderersManager): void;
}
export declare class PolymerBondShowInfoOperation implements Operation {
    polymerBond: PolymerBond;
    constructor(polymerBond: PolymerBond);
    execute(renderersManager: RenderersManager): void;
    invert(): void;
}
export declare class PolymerBondCancelCreationOperation implements Operation {
    polymerBond: PolymerBond;
    private readonly secondMonomer?;
    constructor(polymerBond: PolymerBond, secondMonomer?: BaseMonomer | undefined);
    execute(renderersManager: RenderersManager): void;
    invert(): void;
}
export declare class PolymerBondFinishCreationOperation implements Operation {
    private readonly finishPolymerBondCreationModelChange;
    private readonly deletePolymerBondCreationModelChange;
    polymerBond: any;
    priority: number;
    constructor(finishPolymerBondCreationModelChange: (polymerBond?: PolymerBond) => PolymerBond, deletePolymerBondCreationModelChange: (polymerBond: any) => void);
    execute(renderersManager: RenderersManager): void;
    invert(renderersManager: RenderersManager): void;
}
export declare class SelectLayoutModeOperation implements Operation {
    _onExecute: () => void;
    _onInvert: () => void;
    mode: LayoutMode;
    prevMode: any;
    private readonly onExecute;
    private readonly onInvert;
    constructor(_onExecute: () => void, _onInvert: () => void, mode: LayoutMode, prevMode: any);
    execute(): void;
    invert(): void;
}
export declare class ReconnectPolymerBondOperation implements Operation {
    private readonly reconnectPolymerBondModelChange;
    private readonly revertReconnectPolymerBondModelChange;
    polymerBond: any;
    constructor(reconnectPolymerBondModelChange: () => PolymerBond, revertReconnectPolymerBondModelChange: () => PolymerBond);
    execute(renderersManager: RenderersManager): void;
    invert(renderersManager: RenderersManager): void;
}
