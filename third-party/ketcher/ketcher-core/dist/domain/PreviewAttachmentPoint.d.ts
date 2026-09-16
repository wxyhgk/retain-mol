import { AttachmentPoint } from './AttachmentPoint';
import type { Coordinates } from './helpers/attachmentPointCalculations';
import type { PreviewAttachmentPointConstructorParams } from './types';
export declare class PreviewAttachmentPoint extends AttachmentPoint {
    private readonly connected;
    private readonly selected;
    private readonly usage;
    constructor(constructorParams: PreviewAttachmentPointConstructorParams);
    protected renderAttachmentPointByCoordinates(attachmentOnBorder: Coordinates, attachmentPointCoordinates: Coordinates): import("../application/render/types").D3SvgElementSelection<SVGGElement, this>;
    appendAttachmentPoint(): import("../application/render/types").D3SvgElementSelection<SVGGElement, this>;
}
