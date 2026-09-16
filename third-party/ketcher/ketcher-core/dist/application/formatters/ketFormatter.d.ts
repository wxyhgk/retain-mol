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
import type { KetSerializer } from '../../domain/serializers/ket/ketSerializer';
import type { Struct } from '../../domain/entities/struct';
import type { StructFormatter } from './structFormatter.types';
import type { DrawingEntitiesManager } from '../../domain/entities/DrawingEntitiesManager';
import type { EditorSelection } from '../editor/editor.types';
export declare class KetFormatter implements StructFormatter {
    #private;
    constructor(serializer: KetSerializer);
    getStringFromStructureAsync(struct: Struct, drawingEntitiesManager?: DrawingEntitiesManager, selection?: EditorSelection): Promise<string>;
    getStructureFromStringAsync(content: string): Promise<Struct>;
    parseMacromoleculeString(content: string): void;
}
