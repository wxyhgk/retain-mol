import type { BaseSequenceItemRenderer } from '../../../render/renderers/sequence/BaseSequenceItemRenderer';
import type { MonomerItemType } from '../../../../domain/types';
import type { IRnaPreset } from '../../../editor/tools/Tool';
export interface SequenceMode {
    readonly isEditMode: boolean;
    readonly isEditInRNABuilderMode: boolean;
    deleteSelection(): void;
    turnOnEditMode(sequenceItemRenderer?: BaseSequenceItemRenderer): void;
    turnOnSequenceEditInRNABuilderMode(): void;
    turnOffSequenceEditInRNABuilderMode(): void;
    turnOnSyncEditMode(): void;
    turnOffSyncEditMode(): void;
    resetEditMode(): void;
    insertMonomerFromLibrary(monomerItem: MonomerItemType): void;
    insertPresetFromLibrary(preset: IRnaPreset): void;
    establishHydrogenBond(sequenceItemRenderer: BaseSequenceItemRenderer): void;
    deleteHydrogenBond(sequenceItemRenderer: BaseSequenceItemRenderer): void;
}
