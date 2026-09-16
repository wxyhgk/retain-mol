import { BaseMode } from '../../editor/modes/BaseMode';
import type { LayoutMode } from '../../editor/modes/types';
import { Command } from '../../../domain/entities/Command';
import { Vec2 } from '../../../domain/entities';
import type { DrawingEntitiesManager } from '../../../domain/entities/DrawingEntitiesManager';
export declare class SnakeMode extends BaseMode {
    constructor(previousMode?: LayoutMode);
    initialize(_needRemoveSelection: boolean, _isUndo?: boolean): Command;
    getNewNodePosition(): Vec2;
    scrollForView(): Promise<void>;
    applyAdditionalPasteOperations(mergedDrawingEntities: DrawingEntitiesManager): Command;
    isPasteAllowedByMode(): boolean;
    isPasteAvailable(): boolean;
}
