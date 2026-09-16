import type { IKetMacromoleculesContent, IKetMonomerNode, IKetMonomerTemplate, IKetAmbiguousMonomerNode, IKetAmbiguousMonomerTemplate } from '../../../../application/formatters/types/ket';
import { type Struct, type BaseMonomer, type BaseMonomerConfig, Vec2 } from '../../../entities';
import type { DrawingEntitiesManager } from '../../../entities/DrawingEntitiesManager';
import type { MonomerItemType } from '../../../types/monomers';
export declare function templateToMonomerProps(template: IKetMonomerTemplate): {
    hidden?: true | undefined;
    aliasBILN?: string | undefined;
    aliasAxoLabs?: string | undefined;
    aliasHELM?: string | undefined;
    id: string;
    Name: string;
    MonomerNaturalAnalogCode: string;
    MonomerNaturalAnalogThreeLettersCode: string;
    MonomerName: string;
    MonomerFullName: string | undefined;
    MonomerType: string | undefined;
    MonomerClass: import("../../../../application/formatters/types/ket").KetMonomerClass | undefined;
    MonomerCaps: {};
    idtAliases: import("../../../../application/formatters/types/ket").IKetIdtAliases | undefined;
    unresolved: boolean | undefined;
    modificationTypes: string[] | undefined;
};
export declare function monomerToDrawingEntity(node: IKetMonomerNode, template: IKetMonomerTemplate, struct: Struct, drawingEntitiesManager: DrawingEntitiesManager): import("../../../entities").Command;
export type MonomerFactoryFn = (monomerItem: MonomerItemType) => [
    new (monomerItem: MonomerItemType, position?: Vec2, config?: BaseMonomerConfig) => BaseMonomer,
    ...unknown[]
];
export declare function createMonomersForVariantMonomer(variantMonomerTemplate: IKetAmbiguousMonomerTemplate, parsedFileContent: IKetMacromoleculesContent, monomerFactory: MonomerFactoryFn): BaseMonomer[];
export declare function variantMonomerToDrawingEntity(drawingEntitiesManager: DrawingEntitiesManager, node: IKetAmbiguousMonomerNode, template: IKetAmbiguousMonomerTemplate, parsedFileContent: IKetMacromoleculesContent, monomerFactory: MonomerFactoryFn): import("../../../entities").Command;
