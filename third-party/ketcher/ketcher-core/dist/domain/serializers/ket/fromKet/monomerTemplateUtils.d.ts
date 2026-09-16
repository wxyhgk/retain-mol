import type { IKetAttachmentPoint, IKetMonomerTemplate } from '../../../../application/formatters/types/ket';
import { Struct } from '../../../entities';
import { type MonomerItemType } from '../../../types';
export declare function fillMonomerTemplateStruct(ket: any): Struct;
export declare function normalizeTemplateAttachmentPoints(template: IKetMonomerTemplate): IKetAttachmentPoint[] | undefined;
export declare function getTemplateAttachmentPoints(template: IKetMonomerTemplate): IKetAttachmentPoint[];
export declare function convertMonomerTemplateToStruct(template: IKetMonomerTemplate): Struct;
export declare function fillStructRgLabelsByMonomerTemplate(template: IKetMonomerTemplate, monomerItem: MonomerItemType): void;
