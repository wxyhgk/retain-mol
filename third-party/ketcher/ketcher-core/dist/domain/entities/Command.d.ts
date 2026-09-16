import type { Operation } from '../entities/Operation';
import type { RenderersManager } from '../../application/render/renderers/RenderersManager';
export declare class Command {
    operations: Operation[];
    private undoOperationReverse;
    private setUndoOperationByPriority;
    addOperation(operation: Operation): void;
    merge(command: Command): void;
    setUndoOperationReverse(): void;
    setUndoOperationsByPriority(): void;
    invert(renderersManagers: RenderersManager): void;
    execute(renderersManagers: RenderersManager): void;
    executeAfterAllOperations(renderersManagers: RenderersManager, operations?: Operation[]): void;
    invertAfterAllOperations(renderersManagers: RenderersManager, operations?: Operation[]): void;
    clear(): void;
}
