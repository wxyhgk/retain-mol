import type { Struct } from '../domain/entities';
import type { Ketcher } from './ketcher';
import type { StructService } from '../domain/services';
export declare function prepareStructToRender(structStr: string, structService: StructService, ketcherInstance: Ketcher): Promise<Struct>;
export declare function parseStruct(structStr: string, structService: StructService, ketcherInstance: Ketcher): Promise<Struct>;
export declare function deleteAllEntitiesOnCanvas(): void;
export declare function parseAndAddMacromoleculesOnCanvas(struct: string, structService: StructService, mergeWithLatestHistoryCommand?: boolean): Promise<void>;
