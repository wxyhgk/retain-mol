import type { Vec2 } from '../../../domain/entities/vec2';
import type { AttachmentPointName } from '../../../domain/types';
export declare const MonomerCreationAttachmentPointClickEvent = "MonomerCreationAttachmentPointClick";
export declare const MonomerCreationComponentStructureUpdateEvent = "MonomerCreationComponentStructureUpdate";
export type AttachmentPointClickData = {
    attachmentPointName: AttachmentPointName;
    position: Vec2;
};
export type RnaPresetComponentKey = 'base' | 'sugar' | 'phosphate';
export type ComponentStructureUpdateData = {
    componentKey: RnaPresetComponentKey;
    atomIds: number[];
    bondIds: number[];
};
