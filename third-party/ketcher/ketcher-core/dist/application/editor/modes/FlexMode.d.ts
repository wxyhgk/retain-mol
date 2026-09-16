import type { LayoutMode } from '../../editor/modes/types';
import { BaseMode } from '../../editor/modes/BaseMode';
import { Command } from '../../../domain/entities/Command';
import type { DrawingEntitiesManager } from '../../../domain/entities/DrawingEntitiesManager';
export declare class FlexMode extends BaseMode {
    constructor(previousMode?: LayoutMode);
    initialize(): Command;
    getNewNodePosition(): import("../../..").Vec2;
    applyAdditionalPasteOperations(mergedDrawingEntities: DrawingEntitiesManager): Command;
    isPasteAllowedByMode(): boolean;
    isPasteAvailable(): boolean;
    scrollForView(): void;
}
