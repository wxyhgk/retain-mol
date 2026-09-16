import type { EditorSelection } from './editor/editor.types';
import { type FormatterFactory, SupportedFormat } from './formatters';
import type { Struct } from '../domain/entities';
import { DrawingEntitiesManager } from '../domain/entities/DrawingEntitiesManager';
export declare function getStructure(ketcherId: string, formatterFactory: FormatterFactory, struct: Struct, structureFormat?: SupportedFormat, drawingEntitiesManager?: DrawingEntitiesManager, selection?: EditorSelection): Promise<string>;
