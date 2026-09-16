import type { Atom as MicromoleculesAtom } from '../../domain/entities/atom';
import { SGroupAttachmentPoint } from '../../domain/entities/sGroupAttachmentPoint';
import type { Struct } from '../../domain/entities/struct';
import type { DrawingEntitiesManager } from '../../domain/entities/DrawingEntitiesManager';
import { type ReStruct } from '../render/restruct';
import type { BaseMonomer } from '../../domain/entities/BaseMonomer';
import { MonomerMicromolecule } from '../../domain/entities/monomerMicromolecule';
import { Command } from '../../domain/entities/Command';
import type { PolymerBond } from '../../domain/entities/PolymerBond';
import type { AttachmentPointName } from '../../domain/types';
import type { MonomerToAtomBond } from '../../domain/entities/MonomerToAtomBond';
import type { Atom } from '../../domain/entities/CoreAtom';
export declare class MacromoleculesConverter {
    static convertMonomerToMonomerMicromolecule(monomer: BaseMonomer, struct: Struct): MonomerMicromolecule;
    private static addMonomerAtomToStruct;
    static convertAttachmentPointNameToNumber(attachmentPointName: AttachmentPointName): number;
    static findAttachmentPointAtom(polymerBond: PolymerBond | MonomerToAtomBond, monomer: BaseMonomer, monomerToAtomIdMap: Map<BaseMonomer, Map<number, number>>): {
        attachmentAtomId: undefined;
        attachmentPointNumber: undefined;
        globalAttachmentAtomId?: undefined;
    } | {
        globalAttachmentAtomId: number | false | undefined;
        attachmentAtomId: number | false;
        attachmentPointNumber: number;
    };
    static convertMonomerAttachmentPointsToSGroupAttachmentPoints(monomer: BaseMonomer, atomIdsMap?: Map<number, number>): SGroupAttachmentPoint[];
    static convertDrawingEntitiesToStruct(drawingEntitiesManager: DrawingEntitiesManager, struct: Struct, reStruct?: ReStruct): {
        struct: Struct;
        reStruct: ReStruct | undefined;
        conversionErrorMessage: string;
    };
    private static convertMonomerMicromoleculeToMonomer;
    private static convertFragmentToChem;
    static getAttachmentPointLabel(atom: MicromoleculesAtom): string;
    static getFragmentsGroupedBySgroup(struct: Struct): number[][];
    private static shouldSplitSgroupIntoSeparateFragments;
    private static clonePartialSgroupsWithAttachmentPoints;
    static findAtomByMicromoleculeAtomId(drawingEntitiesManager: DrawingEntitiesManager, atomId: number, monomer?: BaseMonomer): Atom | undefined;
    static convertStructToDrawingEntities(struct: Struct, drawingEntitiesManager: DrawingEntitiesManager): {
        drawingEntitiesManager: DrawingEntitiesManager;
        modelChanges: Command;
        fragmentIdToMonomer: Map<number, BaseMonomer>;
        fragmentIdToAtomIdMap: Map<number, Map<number, number>>;
    };
}
