import type { BaseMonomer } from '../entities/BaseMonomer';
import type { MonomerOrAmbiguousType } from '../types';
import { Command } from '../entities/Command';
import type { DrawingEntitiesManager } from './DrawingEntitiesManager';
export declare function replaceMonomer(drawingEntitiesManager: DrawingEntitiesManager, monomer: BaseMonomer, newMonomerItem: MonomerOrAmbiguousType): Command;
