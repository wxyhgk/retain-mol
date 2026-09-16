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
import { Struct } from '../../entities';
import type { Serializer } from '../serializers.types';
import { type IKetConnectionMoleculeEndPoint, type IKetConnectionMonomerEndPoint, type IKetMacromoleculesContent, type IKetMacromoleculesContentRootProperty, type IKetMonomerTemplate } from '../../../application/formatters/types/ket';
import { Command } from '../../entities/Command';
import type { EditorSelection } from '../../../application/editor/editor.types';
import { type MonomerFactoryFn } from '../../serializers/ket/fromKet/monomerToDrawingEntity';
import { DrawingEntitiesManager } from '../../entities/DrawingEntitiesManager';
import type { BaseMonomer } from '../../entities/BaseMonomer';
import { type AmbiguousMonomerType, type MonomerItemType } from '../../types';
import type { PolymerBond } from '../../entities/PolymerBond';
export declare class KetSerializer implements Serializer<Struct> {
    private static _monomerFactory;
    static setMonomerFactory(factory: MonomerFactoryFn): void;
    private static getMonomerFactory;
    deserializeMicromolecules(content: string): Struct;
    private static fillStruct;
    serializeMicromolecules(struct: Struct, monomer?: BaseMonomer): string;
    private validateMonomerNodeTemplate;
    private validateConnectionTypeAndEndpoints;
    parseAndValidateMacromolecules(fileContent: string): {
        error: boolean;
        parsedFileContent?: undefined;
    } | {
        error: boolean;
        parsedFileContent: IKetMacromoleculesContent;
    };
    deserializeToStruct(fileContent: string): Struct;
    private filterMacromoleculesContent;
    private static enrichTemplateWithLibraryData;
    convertMonomerTemplateToLibraryItem(template: IKetMonomerTemplate): MonomerItemType;
    deserializeToDrawingEntities(fileContent: string): {
        modelChanges: Command;
        drawingEntitiesManager: DrawingEntitiesManager;
    } | undefined;
    deserialize(fileContent: string): Struct;
    getConnectionMonomerEndpoint(monomer: BaseMonomer, polymerBond: PolymerBond, monomerIdMap: Map<number, number>): IKetConnectionMonomerEndPoint;
    getConnectionMoleculeEndpoint(monomer: BaseMonomer, polymerBond: PolymerBond, monomerToAtomIdMap: Map<BaseMonomer, Map<number, number>>, struct: Struct): IKetConnectionMoleculeEndPoint;
    private serializeMonomerTemplate;
    private serializeVariantMonomerTemplate;
    serializeMacromolecules(struct: Struct, drawingEntitiesManager: DrawingEntitiesManager, needSetSelection?: boolean): {
        serializedMacromolecules: IKetMacromoleculesContentRootProperty;
        micromoleculesStruct: Struct;
        moleculesSelection: {
            atoms: number[];
            bonds: number[];
        };
    };
    static removeLeavingGroupsFromConnectedAtoms(_struct: Struct): Struct;
    serialize(_struct: Struct, drawingEntitiesManager?: DrawingEntitiesManager, selection?: EditorSelection, isBeautified?: boolean, // TODO make false by default
    needSetSelectionToMacromolecules?: boolean): string;
    convertMonomersLibrary(monomersLibrary: IKetMacromoleculesContent): MonomerItemType[] & AmbiguousMonomerType[];
}
