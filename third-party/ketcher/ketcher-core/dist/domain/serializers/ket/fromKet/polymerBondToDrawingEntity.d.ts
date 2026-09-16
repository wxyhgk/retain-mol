import type { IKetConnection } from '../../../../application/formatters/types/ket';
import { Command } from '../../../entities/Command';
import type { DrawingEntitiesManager } from '../../../entities/DrawingEntitiesManager';
import type { BaseMonomer } from '../../../entities/BaseMonomer';
export declare function polymerBondToDrawingEntity(connection: IKetConnection, drawingEntitiesManager: DrawingEntitiesManager, atomIdMap: Map<number, number>, superatomMonomerToUsedAttachmentPoint: Map<BaseMonomer, Set<string>>, firstMonomer: BaseMonomer, secondMonomer: BaseMonomer): Command;
