import type { RenderersManager } from '../../application/render/renderers/RenderersManager';
import type { BaseMonomer } from '../entities/BaseMonomer';
import type { PolymerBond } from '../entities/PolymerBond';
import type { Atom } from '../entities/CoreAtom';
import type { Bond } from '../entities/CoreBond';
import type { MonomerToAtomBond } from '../entities/MonomerToAtomBond';
import type { RxnArrow } from '../entities/CoreRxnArrow';
import type { MultitailArrow } from '../entities/CoreMultitailArrow';
import type { RxnPlus } from '../entities/CoreRxnPlus';
import type { SGroupDrawingEntity } from '../entities/SGroupDrawingEntity';
export interface Operation {
    priority?: number;
    monomer?: BaseMonomer;
    atom?: Atom;
    bond?: Bond;
    monomerToAtomBond?: MonomerToAtomBond;
    polymerBond?: PolymerBond;
    rxnArrow?: RxnArrow;
    multitailArrow?: MultitailArrow;
    rxnPlus?: RxnPlus;
    sgroupDrawingEntity?: SGroupDrawingEntity;
    execute(renderersManager: RenderersManager): void;
    invert(renderersManager: RenderersManager): void;
    executeAfterAllOperations?(renderersManager: RenderersManager): void;
    invertAfterAllOperations?(renderersManager: RenderersManager): void;
}
