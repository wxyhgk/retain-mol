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
import type { ConvertData, ConvertResult, LayoutData, LayoutResult, StructService, StructServiceOptions } from '../../domain/services';
import { type StructFormatter, SupportedFormat } from './structFormatter.types';
import type { KetSerializer } from '../../domain/serializers/ket/ketSerializer';
import type { Struct } from '../../domain/entities/struct';
import type { DrawingEntitiesManager } from '../../domain/entities/DrawingEntitiesManager';
type ConvertPromise = (data: ConvertData, options?: StructServiceOptions) => Promise<ConvertResult>;
type LayoutPromise = (data: LayoutData, options?: StructServiceOptions) => Promise<LayoutResult>;
export declare class ServerFormatter implements StructFormatter {
    #private;
    constructor(structService: StructService, ketSerializer: KetSerializer, format: SupportedFormat, options?: StructServiceOptions);
    getStringFromStructureAsync(struct: Struct, drawingEntitiesManager?: DrawingEntitiesManager): Promise<string>;
    getCallingMethod(stringifiedStruct: string, format: SupportedFormat): {
        method: LayoutPromise | ConvertPromise;
        struct: string;
    };
    getStructureFromStringAsync(stringifiedStruct: string): Promise<Struct>;
}
export {};
